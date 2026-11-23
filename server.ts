import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '12mb' }));

// Response timing header for observability
app.use((_req, res, next) => {
  const start = performance.now();
  const origJson = res.json.bind(res);
  res.json = ((body: unknown) => {
    const ms = Math.round(performance.now() - start);
    if (!res.headersSent) {
      res.setHeader('X-Response-Time-Ms', String(ms));
    }
    return origJson(body);
  }) as typeof res.json;
  next();
});

// ---------------------------------------------------------------------------
// Secure Server-Side Authentication (scrypt + HMAC-SHA256 Bearer Tokens)
// ---------------------------------------------------------------------------
type UserRole = 'patient' | 'doctor' | 'hospital_admin';

interface StoredUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  salt: string;
  passwordHash: string;
  createdAt: string;
  phone?: string;
}

const SESSION_SECRET =
  process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16
    ? process.env.SESSION_SECRET
    : crypto.randomBytes(32).toString('hex');

const usersByEmail = new Map<string, StoredUser>();
let claimedAdminHash: { salt: string; hash: string } | null = null;

function hashPassword(password: string, salt?: string): { salt: string; hash: string } {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, s, 64).toString('hex');
  return { salt: s, hash: derived };
}

function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  const derived = crypto.scryptSync(password, salt, 64);
  const expectedBuf = Buffer.from(expectedHash, 'hex');
  if (derived.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(derived, expectedBuf);
}

interface TokenPayload {
  sub: string;
  email: string;
  fullName: string;
  role: UserRole;
  exp: number;
}

function signToken(payload: Omit<TokenPayload, 'exp'>): string {
  const fullPayload: TokenPayload = {
    ...payload,
    exp: Date.now() + 1000 * 60 * 60 * 12, // 12 hours
  };
  const encoded = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encoded, sig] = parts;
    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(encoded)
      .digest('base64url');
    const a = Buffer.from(sig);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const decoded = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as TokenPayload;
    if (!decoded.exp || decoded.exp < Date.now()) return null;
    return decoded;
  } catch {
    return null;
  }
}

// Simple in-memory rate limiter for auth routes
const authAttempts = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string, maxPerMin = 30): boolean {
  const now = Date.now();
  const entry = authAttempts.get(ip);
  if (!entry || entry.resetAt < now) {
    authAttempts.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= maxPerMin) return false;
  entry.count += 1;
  return true;
}

function extractBearerUser(req: Request): TokenPayload | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return verifyToken(authHeader.slice(7).trim());
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 120;
}

// Check if admin passcode is configured or claimed
app.get('/api/auth/admin-status', (_req, res) => {
  const envConfigured = Boolean(process.env.ADMIN_PASSCODE && process.env.ADMIN_PASSCODE.trim());
  res.json({
    adminConfigured: envConfigured || Boolean(claimedAdminHash),
  });
});

// One-time first-run admin passcode claim (locks itself once claimed or when env var is set)
app.post('/api/auth/admin-claim', (req, res) => {
  const ip = req.ip || 'unknown';
  if (!checkRateLimit(ip, 15)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a minute.' });
  }
  const envConfigured = Boolean(process.env.ADMIN_PASSCODE && process.env.ADMIN_PASSCODE.trim());
  if (envConfigured || claimedAdminHash) {
    return res.status(409).json({ error: 'Hospital Admin passcode is already configured.' });
  }
  const { fullName, email, password } = req.body as {
    fullName?: string;
    email?: string;
    password?: string;
  };
  if (!password || typeof password !== 'string' || password.length < 8 || password.length > 100) {
    return res.status(400).json({ error: 'Admin password must be at least 8 characters.' });
  }
  const cleanEmail = (email || 'admin@sanjeevani.in').trim().toLowerCase();
  if (!isValidEmail(cleanEmail)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  const cleanName = (fullName || 'Hospital Administrator').trim().slice(0, 80);
  const { salt, hash } = hashPassword(password);
  claimedAdminHash = { salt, hash };

  const adminUser: StoredUser = {
    id: `usr-admin-${crypto.randomUUID().slice(0, 8)}`,
    fullName: cleanName,
    email: cleanEmail,
    role: 'hospital_admin',
    salt,
    passwordHash: hash,
    createdAt: new Date().toISOString(),
  };
  usersByEmail.set(cleanEmail, adminUser);

  const token = signToken({
    sub: adminUser.id,
    email: adminUser.email,
    fullName: adminUser.fullName,
    role: adminUser.role,
  });

  return res.status(201).json({
    token,
    user: {
      id: adminUser.id,
      fullName: adminUser.fullName,
      email: adminUser.email,
      role: adminUser.role,
    },
  });
});

// Register Patient or Doctor account
app.post('/api/auth/register', (req, res) => {
  const ip = req.ip || 'unknown';
  if (!checkRateLimit(ip, 20)) {
    return res.status(429).json({ error: 'Too many attempts. Please try again in a minute.' });
  }

  const { fullName, email, password, role } = req.body as {
    fullName?: string;
    email?: string;
    password?: string;
    role?: string;
  };

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2 || fullName.length > 80) {
    return res.status(400).json({ error: 'Please enter your full name (2–80 characters).' });
  }
  if (!email || typeof email !== 'string' || !isValidEmail(email.trim().toLowerCase())) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (!password || typeof password !== 'string' || password.length < 8 || password.length > 100) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (usersByEmail.has(normalizedEmail)) {
    return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
  }

  // Self-registration only permits patient or doctor roles (hospital_admin requires passcode/claim)
  const safeRole: UserRole = role === 'doctor' ? 'doctor' : 'patient';
  const { salt, hash } = hashPassword(password);

  const user: StoredUser = {
    id: `usr-${crypto.randomUUID().slice(0, 8)}`,
    fullName: fullName.trim(),
    email: normalizedEmail,
    role: safeRole,
    salt,
    passwordHash: hash,
    createdAt: new Date().toISOString(),
  };
  usersByEmail.set(normalizedEmail, user);

  const token = signToken({
    sub: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  });

  return res.status(201).json({
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  });
});

// Login with Email & Password (supports Patient, Doctor, and Admin passcode check)
app.post('/api/auth/login', (req, res) => {
  const ip = req.ip || 'unknown';
  if (!checkRateLimit(ip, 25)) {
    return res.status(429).json({ error: 'Too many login attempts. Please wait a minute.' });
  }

  const { email, password, role } = req.body as {
    email?: string;
    password?: string;
    role?: string;
  };

  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check Hospital Admin login via env ADMIN_PASSCODE or claimedAdminHash
  if (role === 'hospital_admin') {
    const envPass = process.env.ADMIN_PASSCODE?.trim();
    if (envPass) {
      const a = Buffer.from(password);
      const b = Buffer.from(envPass);
      if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
        const token = signToken({
          sub: 'usr-admin-env',
          email: normalizedEmail,
          fullName: 'Hospital Administrator',
          role: 'hospital_admin',
        });
        return res.json({
          token,
          user: {
            id: 'usr-admin-env',
            fullName: 'Hospital Administrator',
            email: normalizedEmail,
            role: 'hospital_admin' as UserRole,
          },
        });
      }
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }
    if (claimedAdminHash && verifyPassword(password, claimedAdminHash.salt, claimedAdminHash.hash)) {
      const existingAdmin = usersByEmail.get(normalizedEmail);
      const fullName = existingAdmin?.fullName || 'Hospital Administrator';
      const id = existingAdmin?.id || 'usr-admin-claimed';
      const token = signToken({ sub: id, email: normalizedEmail, fullName, role: 'hospital_admin' });
      return res.json({
        token,
        user: { id, fullName, email: normalizedEmail, role: 'hospital_admin' as UserRole },
      });
    }
  }

  const user = usersByEmail.get(normalizedEmail);
  if (!user || !verifyPassword(password, user.salt, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = signToken({
    sub: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  });

  return res.json({
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  });
});

// Instant Server-Signed Demo Account Access (Prototype Evaluation Mode)
app.post('/api/auth/demo', (req, res) => {
  const { role } = req.body as { role?: string };
  const safeRole: UserRole =
    role === 'doctor' ? 'doctor' : role === 'hospital_admin' ? 'hospital_admin' : 'patient';

  const demoProfiles: Record<UserRole, { id: string; fullName: string; email: string }> = {
    patient: {
      id: 'pat-ramesh-01',
      fullName: 'Ramesh Kumar Verma',
      email: 'ramesh.verma@aarogyacare.demo',
    },
    doctor: {
      id: 'doc-meera',
      fullName: 'Dr. Meera Sharma',
      email: 'dr.meera@sanjeevani.demo',
    },
    hospital_admin: {
      id: 'staff-admin-01',
      fullName: 'Rajiv Menon (Hospital Admin)',
      email: 'admin@sanjeevani.demo',
    },
  };

  const chosen = demoProfiles[safeRole];
  const token = signToken({
    sub: chosen.id,
    email: chosen.email,
    fullName: chosen.fullName,
    role: safeRole,
  });

  return res.json({
    token,
    user: {
      ...chosen,
      role: safeRole,
      isDemo: true,
    },
  });
});

app.get('/api/auth/me', (req, res) => {
  const session = extractBearerUser(req);
  if (!session) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  return res.json({
    user: {
      id: session.sub,
      fullName: session.fullName,
      email: session.email,
      role: session.role,
    },
  });
});

app.post('/api/auth/logout', (_req, res) => {
  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Low-Latency Gemini Client + In-Memory TTL Cache (Sub-Second Repeat Responses)
// ---------------------------------------------------------------------------
let cachedGenAIClient: GoogleGenAI | null | undefined = undefined;

function getGenAIClient(): GoogleGenAI | null {
  if (cachedGenAIClient !== undefined) return cachedGenAIClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    cachedGenAIClient = null;
    return null;
  }
  cachedGenAIClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
  return cachedGenAIClient;
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const aiResponseCache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes
const MAX_CACHE_ITEMS = 200;

function getCached<T>(key: string): T | null {
  const item = aiResponseCache.get(key);
  if (!item) return null;
  if (item.expiresAt < Date.now()) {
    aiResponseCache.delete(key);
    return null;
  }
  return item.value as T;
}

function setCached(key: string, value: unknown) {
  if (aiResponseCache.size >= MAX_CACHE_ITEMS) {
    const firstKey = aiResponseCache.keys().next().value;
    if (firstKey) aiResponseCache.delete(firstKey);
  }
  aiResponseCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

const LANGUAGE_NAME_MAP: Record<string, string> = {
  en: 'simple everyday English suitable for Indian patients',
  hi: 'simple everyday Hindi (Devanagari script, easy for elderly readers)',
  bn: 'simple everyday Bengali (বাংলা script)',
  mr: 'simple everyday Marathi (मराठी Devanagari script)',
  ta: 'simple everyday Tamil (தமிழ் script)',
  te: 'simple everyday Telugu (తెలుగు script)',
};

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, aiConfigured: Boolean(getGenAIClient()), cacheSize: aiResponseCache.size });
});

// 1. Dedicated AI Medical Assistant (RAG-style Grounded Wellness & Clinical Guide)
// Optimized with gemini-3.1-flash-lite + ThinkingLevel.MINIMAL + caching for low latency
app.post('/api/ai/health-assistant', async (req, res) => {
  try {
    const { question, language = 'en', patientContext } = req.body as {
      question?: string;
      language?: string;
      patientContext?: {
        age?: number;
        conditions?: string[];
        allergies?: string[];
        latestReportSummary?: string;
      };
    };

    if (!question || typeof question !== 'string' || question.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter a health question.' });
    }

    const trimmed = question.trim().slice(0, 600);
    const langDesc = LANGUAGE_NAME_MAP[language] || LANGUAGE_NAME_MAP.en;
    const cacheKey = `rag:${language}:${trimmed.toLowerCase()}:${patientContext?.latestReportSummary?.slice(0, 40) || ''}`;
    const hit = getCached<Record<string, unknown>>(cacheKey);
    if (hit) {
      return res.json({ ...hit, cached: true });
    }

    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured in Settings > Secrets.',
        code: 'AI_NOT_CONFIGURED',
      });
    }

    const systemInstruction = `You are Aarogya Care's AI Health Assistant for Indian patients and families.
Reply in ${langDesc}.

SAFETY & GROUNDING RULES:
- Provide clear, calm, practical guidance in 3–4 short bullet points.
- Never diagnose conditions, never prescribe prescription-only drugs or change doctor dosages.
- If the user describes severe red-flag symptoms (chest pain, difficulty breathing, sudden weakness, heavy bleeding, unconsciousness), immediately instruct them to call 108 / 112 or visit Emergency right away and set urgentWarning to true.
- Cite only standard public medical reference sources that match the topic (e.g., "WHO Guidelines", "ICMR Dietary Guidelines", "MoHFW India", "Mayo Clinic").
- Keep the response crisp and fast to read for elderly patients.`;

    const contextSummary = patientContext
      ? `Patient profile context: Age ${patientContext.age ?? 68}, Known conditions: ${(patientContext.conditions || []).join(', ') || 'None'}, Allergies: ${(patientContext.allergies || []).join(', ') || 'None'}. Latest report summary: ${patientContext.latestReportSummary || 'None'}.`
      : '';

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `${contextSummary}\n\nUser Question: ${trimmed}`,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intro: { type: Type.STRING, description: '1 short reassuring intro sentence.' },
            bullets: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 to 4 crisp practical points.',
            },
            sources: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2 to 3 trusted public medical reference labels.',
            },
            whenToSeeDoctor: {
              type: Type.STRING,
              description: '1 short sentence on when to consult a doctor.',
            },
            urgentWarning: {
              type: Type.BOOLEAN,
              description: 'True only if red-flag emergency symptoms are mentioned.',
            },
          },
          required: ['intro', 'bullets', 'sources', 'whenToSeeDoctor', 'urgentWarning'],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim());
    setCached(cacheKey, parsed);
    return res.json({ ...parsed, cached: false });
  } catch (err: unknown) {
    console.error('AI Health Assistant error:', err);
    const message = err instanceof Error ? err.message : 'Failed to generate health guidance.';
    return res.status(500).json({ error: message });
  }
});

// 2. AI Medical Report Q&A (Fast gemini-3.1-flash-lite + ThinkingLevel.MINIMAL + Cache)
app.post('/api/ai/report-qa', async (req, res) => {
  try {
    const { question, language = 'en', report, previousReport } = req.body as {
      question: string;
      language: string;
      report: {
        title: string;
        date: string;
        hospital: string;
        rawLines: { lineId: string; text: string }[];
        values: {
          parameter: string;
          value: string;
          unit: string;
          referenceRange: string;
          status: string;
          sourceLine: string;
        }[];
      };
      previousReport?: {
        title: string;
        date: string;
        values: {
          parameter: string;
          value: string;
          unit: string;
          referenceRange: string;
          status: string;
        }[];
      } | null;
    };

    if (!question || !report) {
      return res.status(400).json({ error: 'Missing question or report data.' });
    }

    const cacheKey = `rqa:${language}:${report.title}:${report.date}:${question.trim().toLowerCase()}`;
    const hit = getCached<Record<string, unknown>>(cacheKey);
    if (hit) return res.json({ ...hit, cached: true });

    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured in Settings > Secrets.',
        code: 'AI_NOT_CONFIGURED',
      });
    }

    const reportText = report.rawLines.map((l) => `[${l.lineId}] ${l.text}`).join('\n');
    const prevText = previousReport
      ? `\nPREVIOUS REPORT (${previousReport.title}, Date: ${previousReport.date}):\n` +
        previousReport.values
          .map(
            (v) =>
              `- ${v.parameter}: ${v.value} ${v.unit} (Ref: ${v.referenceRange}, Status: ${v.status})`
          )
          .join('\n')
      : '\nNo previous report provided.';

    const langDesc = LANGUAGE_NAME_MAP[language] || LANGUAGE_NAME_MAP.en;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `CURRENT REPORT (${report.title}, Date: ${report.date}, Facility: ${report.hospital}):\n${reportText}\n${prevText}\n\nPATIENT QUESTION: ${question.slice(0, 500)}`,
      config: {
        systemInstruction: `You are Aarogya Care's Medical Report Explanation Assistant.
Reply in ${langDesc}.
1. Answer ONLY using facts explicitly present in the provided CURRENT REPORT and PREVIOUS REPORT.
2. NEVER diagnose a disease, prescribe medicines, or recommend dosage changes.
3. If the question is unsupported by the report, politely say so and set isUnsupported to true.
4. Cite exact line IDs (like "L4", "L7") in citations whenever referencing a value.`,
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: { type: Type.STRING },
            citations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  lineId: { type: Type.STRING },
                  quote: { type: Type.STRING },
                },
              },
            },
            doctorQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            isUnsupported: { type: Type.BOOLEAN },
          },
          required: ['answer', 'citations', 'doctorQuestions', 'isUnsupported'],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim());
    setCached(cacheKey, parsed);
    return res.json({ ...parsed, cached: false });
  } catch (err: unknown) {
    console.error('Report QA error:', err);
    const message = err instanceof Error ? err.message : 'Failed to analyze report question.';
    return res.status(500).json({ error: message });
  }
});

// 3. AI Analyze Uploaded Medical Report (Multimodal PDF/Image via gemini-4-hydrogen LOW thinking)
app.post('/api/ai/analyze-report', async (req, res) => {
  try {
    const { fileName, mimeType, base64Data, textContent, language = 'en' } = req.body as {
      fileName: string;
      mimeType: string;
      base64Data?: string;
      textContent?: string;
      language?: string;
    };

    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured in Settings > Secrets.',
        code: 'AI_NOT_CONFIGURED',
      });
    }

    const parts: Array<{ inlineData?: { mimeType: string; data: string }; text?: string }> = [];
    if (base64Data && mimeType) {
      parts.push({ inlineData: { mimeType, data: base64Data } });
    }

    parts.push({
      text: `Analyze this medical document (filename: ${fileName}). ${
        textContent ? `\nDocument text:\n${textContent}\n` : ''
      }Extract readable lines, lab values with exact units & reference ranges written in the document, and write a simple patient-friendly summary in English and simple Hindi. Never diagnose or suggest dosage changes. Language hint: ${language}.`,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: { parts },
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            hospital: { type: Type.STRING },
            doctor: { type: Type.STRING },
            summaryEn: { type: Type.STRING },
            summaryHi: { type: Type.STRING },
            simpleExplanationEn: { type: Type.STRING },
            simpleExplanationHi: { type: Type.STRING },
            rawLines: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  lineId: { type: Type.STRING },
                  text: { type: Type.STRING },
                },
              },
            },
            values: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  parameter: { type: Type.STRING },
                  value: { type: Type.STRING },
                  unit: { type: Type.STRING },
                  referenceRange: { type: Type.STRING },
                  status: { type: Type.STRING },
                  sourceLine: { type: Type.STRING },
                },
              },
            },
          },
          required: [
            'title',
            'category',
            'summaryEn',
            'summaryHi',
            'simpleExplanationEn',
            'simpleExplanationHi',
            'rawLines',
            'values',
          ],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim());
    return res.json(parsed);
  } catch (err: unknown) {
    console.error('Report analysis error:', err);
    const message = err instanceof Error ? err.message : 'Could not analyze uploaded document.';
    return res.status(500).json({ error: message });
  }
});

// 4. Low-Latency Multilingual Voice Assistant (gemini-3.1-flash-lite + MINIMAL thinking + Cache)
app.post('/api/ai/voice-assist', async (req, res) => {
  try {
    const { query, language = 'en', patientContext } = req.body as {
      query: string;
      language?: string;
      patientContext: Record<string, unknown>;
    };

    if (!query) {
      return res.status(400).json({ error: 'Missing voice query.' });
    }

    const cacheKey = `voice:${language}:${query.trim().toLowerCase()}`;
    const hit = getCached<Record<string, unknown>>(cacheKey);
    if (hit) return res.json({ ...hit, cached: true });

    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured.',
        code: 'AI_NOT_CONFIGURED',
      });
    }

    const langDesc = LANGUAGE_NAME_MAP[language] || LANGUAGE_NAME_MAP.en;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `Patient live data:\n${JSON.stringify(patientContext)}\n\nUser spoke: "${query.slice(0, 300)}"`,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        systemInstruction: `You are Aarogya Care's voice helper for Indian patients.
Reply in 1–2 short spoken sentences in ${langDesc}.
Answer strictly from the patient live data provided. Never diagnose or suggest changing medicine doses. If emergency, instruct to call 108/112 and set navigateTo to "emergency".
Choose navigateTo from: dashboard, appointments, journey, navigation, reports, medicines, consult, emergency, family, timeline, ai-assistant, schemes, risk-assessment, health-tips, or none.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            navigateTo: { type: Type.STRING },
            actionLabel: { type: Type.STRING },
          },
          required: ['reply', 'navigateTo', 'actionLabel'],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim());
    setCached(cacheKey, parsed);
    return res.json({ ...parsed, cached: false });
  } catch (err: unknown) {
    console.error('Voice assist error:', err);
    const message = err instanceof Error ? err.message : 'Voice assistant request failed.';
    return res.status(500).json({ error: message });
  }
});

async function startServer() {
  const PORT = 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Long-lived static caching for generated images
  app.use(
    '/src/assets/images',
    express.static(path.resolve(__dirname, 'src/assets/images'), {
      maxAge: '7d',
      immutable: true,
    })
  );

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath, { maxAge: '1d' }));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Aarogya Care server running on http://localhost:${PORT}`);
  });
}

startServer();
