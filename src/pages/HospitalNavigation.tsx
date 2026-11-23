import React, { useEffect, useState } from 'react';
import {
  QrCode,
  ArrowRight,
  Volume2,
  MapPin,
  Accessibility,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface FloorRoom {
  id: string;
  floor: 'Ground Floor' | 'First Floor' | 'Second Floor';
  nameEn: string;
  nameHi: string;
  x: number;
  y: number;
  w: number;
  h: number;
  tone: 'teal' | 'blue' | 'red' | 'neutral';
  stepsFromRegistrationEn: string[];
  stepsFromRegistrationHi: string[];
}

const HOSPITAL_ROOMS: FloorRoom[] = [
  {
    id: 'registration',
    floor: 'Ground Floor',
    nameEn: 'Registration Desk',
    nameHi: 'रजिस्ट्रेशन डेस्क',
    x: 40,
    y: 45,
    w: 170,
    h: 85,
    tone: 'teal',
    stepsFromRegistrationEn: ['You are at the Main Registration Desk on the Ground Floor.'],
    stepsFromRegistrationHi: ['आप ग्राउंड फ्लोर के मुख्य रजिस्ट्रेशन डेस्क पर हैं।'],
  },
  {
    id: 'billing',
    floor: 'Ground Floor',
    nameEn: 'Billing Counter',
    nameHi: 'बिलिंग काउंटर',
    x: 240,
    y: 45,
    w: 160,
    h: 85,
    tone: 'neutral',
    stepsFromRegistrationEn: [
      'Walk straight ahead 12 meters from Registration Desk.',
      'Billing Counters 1 & 2 are on your left.',
    ],
    stepsFromRegistrationHi: [
      'रजिस्ट्रेशन डेस्क से 12 मीटर सीधे आगे बढ़ें।',
      'बाईं ओर बिलिंग काउंटर 1 और 2 हैं।',
    ],
  },
  {
    id: 'laboratory',
    floor: 'Ground Floor',
    nameEn: 'Diagnostic Laboratory',
    nameHi: 'डायग्नोस्टिक लैब',
    x: 430,
    y: 45,
    w: 190,
    h: 85,
    tone: 'blue',
    stepsFromRegistrationEn: [
      'Go straight from Registration Desk past Billing Counter.',
      'Turn left at the main corridor.',
      'Diagnostic Laboratory (Counter 4) is right beside the Pharmacy.',
    ],
    stepsFromRegistrationHi: [
      'रजिस्ट्रेशन डेस्क से सीधे जाएं और बिलिंग काउंटर पार करें।',
      'मुख्य गलियारे पर बाएं मुड़ें।',
      'फार्मेसी के ठीक बगल में डायग्नोस्टिक लैब (काउंटर 4) है।',
    ],
  },
  {
    id: 'pharmacy',
    floor: 'Ground Floor',
    nameEn: 'Hospital Pharmacy',
    nameHi: 'अस्पताल फार्मेसी',
    x: 430,
    y: 215,
    w: 190,
    h: 85,
    tone: 'teal',
    stepsFromRegistrationEn: [
      'Go straight along the Ground Floor corridor.',
      'Turn right after the Waiting Lounge.',
      'Hospital Pharmacy is directly opposite the Diagnostic Laboratory.',
    ],
    stepsFromRegistrationHi: [
      'ग्राउंड फ्लोर के गलियारे में सीधे चलें।',
      'वेटिंग एरिया के बाद दाएं मुड़ें।',
      'लैब के ठीक सामने अस्पताल फार्मेसी स्थित है।',
    ],
  },
  {
    id: 'emergency-er',
    floor: 'Ground Floor',
    nameEn: 'Emergency Dept (ER)',
    nameHi: 'इमरजेंसी विभाग',
    x: 40,
    y: 215,
    w: 170,
    h: 85,
    tone: 'red',
    stepsFromRegistrationEn: [
      'Turn right immediately from the Main Entrance ramp.',
      'Follow the red floor markings straight to Emergency Receiving Bay.',
    ],
    stepsFromRegistrationHi: [
      'मुख्य प्रवेश रैंप से तुरंत दाएं मुड़ें।',
      'लाल निशानों का पालन करते हुए सीधे इमरजेंसी विभाग पहुंचें।',
    ],
  },
  {
    id: 'radiology',
    floor: 'Ground Floor',
    nameEn: 'Radiology / X-Ray',
    nameHi: 'रेडियोलॉजी / एक्स-रे',
    x: 240,
    y: 215,
    w: 160,
    h: 85,
    tone: 'blue',
    stepsFromRegistrationEn: [
      'Walk straight 15 meters along the Ground Floor hallway.',
      'Radiology & X-Ray Wing is on your right, beside Emergency.',
    ],
    stepsFromRegistrationHi: [
      'ग्राउंड फ्लोर के गलियारे में 15 मीटर सीधे चलें।',
      'दाईं ओर रेडियोलॉजी और एक्स-रे कक्ष है।',
    ],
  },
  {
    id: 'opd-102',
    floor: 'First Floor',
    nameEn: 'General Medicine (OPD 102)',
    nameHi: 'सामान्य चिकित्सा (OPD 102)',
    x: 40,
    y: 45,
    w: 240,
    h: 95,
    tone: 'teal',
    stepsFromRegistrationEn: [
      'Take Wheelchair-Accessible Lift B near Registration to First Floor.',
      'Exit lift and turn left.',
      'OPD Room 102 (Dr. Meera Sharma) is the second door on the left.',
    ],
    stepsFromRegistrationHi: [
      'रजिस्ट्रेशन के पास लिफ्ट B से पहली मंजिल (First Floor) जाएं।',
      'लिफ्ट से निकलकर बाएं मुड़ें।',
      'दूसरा कमरा बाईं ओर ओपीडी 102 (डॉ. मीरा शर्मा) है।',
    ],
  },
  {
    id: 'pediatrics-104',
    floor: 'First Floor',
    nameEn: 'Pediatrics & Gynecology',
    nameHi: 'बाल व स्त्री रोग विभाग',
    x: 340,
    y: 45,
    w: 280,
    h: 95,
    tone: 'blue',
    stepsFromRegistrationEn: [
      'Take Lift B to First Floor.',
      'Walk straight across the Waiting Lounge to Rooms 104–106.',
    ],
    stepsFromRegistrationHi: [
      'लिफ्ट B से पहली मंजिल पर आएं।',
      'वेटिंग एरिया पार कर सीधे कमरा 104–106 जाएं।',
    ],
  },
  {
    id: 'nursing-1',
    floor: 'First Floor',
    nameEn: 'Vitals & Nursing Station',
    nameHi: 'बीपी जांच व नर्सिंग डेस्क',
    x: 40,
    y: 215,
    w: 240,
    h: 85,
    tone: 'neutral',
    stepsFromRegistrationEn: [
      'Take Lift B to First Floor.',
      'Vitals & BP Check Station is immediately on your right.',
    ],
    stepsFromRegistrationHi: [
      'लिफ्ट B से पहली मंजिल पर जाएं।',
      'लिफ्ट से निकलते ही दाईं ओर बीपी जांच व नर्सिंग डेस्क है।',
    ],
  },
  {
    id: 'cardiology-201',
    floor: 'Second Floor',
    nameEn: 'Cardiology & ECG (Room 201)',
    nameHi: 'हृदय रोग व ईसीजी (201)',
    x: 40,
    y: 45,
    w: 260,
    h: 95,
    tone: 'blue',
    stepsFromRegistrationEn: [
      'Take Lift B to Second Floor.',
      'Turn left past the Cardiac Waiting Lounge.',
      'Room 201 (Dr. Rajesh Nair) & ECG Unit are straight ahead.',
    ],
    stepsFromRegistrationHi: [
      'लिफ्ट B से दूसरी मंजिल (Second Floor) पर जाएं।',
      'वेटिंग लाउंज के बाद बाएं मुड़ें।',
      'सीधे आगे कमरा 201 (डॉ. राजेश नैयर) और ईसीजी कक्ष है।',
    ],
  },
  {
    id: 'ortho-202',
    floor: 'Second Floor',
    nameEn: 'Orthopedics (Room 202)',
    nameHi: 'हड्डी व जोड़ रोग (202)',
    x: 340,
    y: 45,
    w: 280,
    h: 95,
    tone: 'teal',
    stepsFromRegistrationEn: [
      'Take Lift B to Second Floor.',
      'Turn right along the wide wheelchair corridor to Room 202.',
    ],
    stepsFromRegistrationHi: [
      'लिफ्ट B से दूसरी मंजिल पर जाएं।',
      'व्हीलचेयर गलियारे से दाईं ओर कमरा 202 है।',
    ],
  },
];

const QR_CHECKPOINTS = [
  { id: 'qr-reg', labelEn: 'QR #01 — Registration Desk (Ground Floor)', labelHi: 'क्यूआर #01 — रजिस्ट्रेशन डेस्क (ग्राउंड फ्लोर)', floor: 'Ground Floor' as const, x: 125, y: 172 },
  { id: 'qr-lift', labelEn: 'QR #02 — Lift Lobby (First Floor)', labelHi: 'क्यूआर #02 — लिफ्ट लॉबी (पहली मंजिल)', floor: 'First Floor' as const, x: 310, y: 172 },
  { id: 'qr-er', labelEn: 'QR #03 — Main Entrance Ramp', labelHi: 'क्यूआर #03 — मुख्य प्रवेश द्वार', floor: 'Ground Floor' as const, x: 45, y: 172 },
];

export function HospitalNavigation() {
  const { language, navTargetRoom, setNavTargetRoom, pushToast } = useApp();

  const [floor, setFloor] = useState<'Ground Floor' | 'First Floor' | 'Second Floor'>('Ground Floor');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('laboratory');
  const [currentQr, setCurrentQr] = useState(QR_CHECKPOINTS[0]);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  useEffect(() => {
    if (navTargetRoom) {
      const found = HOSPITAL_ROOMS.find((r) => r.id === navTargetRoom);
      if (found) {
        setFloor(found.floor);
        setSelectedRoomId(found.id);
      }
      setNavTargetRoom(null);
    }
  }, [navTargetRoom, setNavTargetRoom]);

  const floorRooms = HOSPITAL_ROOMS.filter((r) => r.floor === floor);
  const destination =
    HOSPITAL_ROOMS.find((r) => r.id === selectedRoomId) || HOSPITAL_ROOMS[2];

  const speakDirections = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const lines =
      language === 'hi'
        ? destination.stepsFromRegistrationHi
        : destination.stepsFromRegistrationEn;
    const utter = new SpeechSynthesisUtterance(lines.join(' '));
    utter.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
  };

  const roomFill = (tone: FloorRoom['tone'], isSelected: boolean) => {
    if (isSelected) return tone === 'red' ? '#FEE2E2' : '#CCFBF1';
    if (tone === 'red') return '#FEF2F2';
    if (tone === 'blue') return '#EFF6FF';
    if (tone === 'teal') return '#F0FDFA';
    return '#F8FAFC';
  };

  const roomStroke = (tone: FloorRoom['tone'], isSelected: boolean) => {
    if (isSelected) return tone === 'red' ? '#DC2626' : '#0F766E';
    if (tone === 'red') return '#FCA5A5';
    return '#CBD5E1';
  };

  const destCenterX = destination.x + destination.w / 2;
  const destCenterY = destination.y + destination.h / 2;
  const startX = currentQr.floor === floor ? currentQr.x : 310;
  const startY = 172;

  return (
    <div className="space-y-6">
      {/* Header & QR Scan Prototype Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500">
            Sanjeevani Multi-Specialty Hospital ·{' '}
            {language === 'hi'
              ? 'प्रोटोटाइप फ़्लोर मैप (इंडोर जीपीएस नहीं)'
              : 'Prototype floor map & QR guidance (not live indoor GPS)'}
          </p>
          <h2 className="font-display text-2xl font-bold text-slate-900 mt-0.5">
            {language === 'hi' ? 'अस्पताल में रास्ता मार्गदर्शन' : 'Hospital Navigation'}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setQrModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold min-h-[46px] self-start sm:self-auto"
        >
          <QrCode className="w-5 h-5" />
          {language === 'hi' ? 'अस्पताल QR कोड स्कैन करें' : 'Scan Hospital QR Code'}
        </button>
      </div>

      {/* Current Recognized Location & Floor Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-teal-700 shrink-0" />
          <div>
            <p className="text-xs text-slate-500">
              {language === 'hi' ? 'आपकी वर्तमान जगह (QR से पहचानी गई)' : 'Your Current Location (QR Checkpoint)'}
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {language === 'hi' ? currentQr.labelHi : currentQr.labelEn}
            </p>
          </div>
        </div>

        <div className="flex items-center bg-slate-100 rounded-xl p-1 self-start">
          {(['Ground Floor', 'First Floor', 'Second Floor'] as const).map((fl) => (
            <button
              key={fl}
              type="button"
              onClick={() => {
                setFloor(fl);
                const firstOnFloor = HOSPITAL_ROOMS.find((r) => r.floor === fl);
                if (firstOnFloor) setSelectedRoomId(firstOnFloor.id);
              }}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap min-h-[38px] ${
                floor === fl ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              {fl}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout: Illustrated SVG Floor Map + Large-Arrow Elderly Directions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive Illustrated Map */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-800">{floor} Layout</span>
            <span className="inline-flex items-center gap-1">
              <Accessibility className="w-4 h-4 text-teal-700" />
              Wheelchair-friendly corridors & Lift B
            </span>
          </div>

          <div className="w-full overflow-x-auto rounded-xl border border-slate-100 bg-[#FAFBF9]">
            <svg
              viewBox="0 0 660 340"
              className="w-full h-auto min-w-[480px]"
              role="img"
              aria-label={`${floor} interactive map of Sanjeevani Hospital`}
            >
              {/* Main Corridor Strip */}
              <rect x="20" y="145" width="620" height="54" rx="8" fill="#E2E8F0" fillOpacity="0.45" />
              <text x="330" y="176" textAnchor="middle" fill="#64748B" fontSize="11" fontWeight="600">
                MAIN CORRIDOR · LIFT B (WHEELCHAIR ACCESSIBLE)
              </text>

              {/* Rooms */}
              {floorRooms.map((room) => {
                const isSelected = destination.id === room.id;
                return (
                  <g
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className="cursor-pointer"
                  >
                    <rect
                      x={room.x}
                      y={room.y}
                      width={room.w}
                      height={room.h}
                      rx="12"
                      fill={roomFill(room.tone, isSelected)}
                      stroke={roomStroke(room.tone, isSelected)}
                      strokeWidth={isSelected ? '3' : '1.5'}
                    />
                    <text
                      x={room.x + room.w / 2}
                      y={room.y + room.h / 2 - 4}
                      textAnchor="middle"
                      fill="#0F172A"
                      fontSize="13"
                      fontWeight="700"
                    >
                      {language === 'hi' ? room.nameHi : room.nameEn}
                    </text>
                    <text
                      x={room.x + room.w / 2}
                      y={room.y + room.h / 2 + 15}
                      textAnchor="middle"
                      fill="#475569"
                      fontSize="10.5"
                    >
                      {isSelected ? (language === 'hi' ? 'चयनित गंतव्य' : 'Selected Destination') : room.floor}
                    </text>
                  </g>
                );
              })}

              {/* Highlighted Path when destination is on current floor */}
              {destination.floor === floor && (
                <>
                  <path
                    d={`M ${startX} ${startY} L ${destCenterX} ${startY} L ${destCenterX} ${
                      destCenterY > startY ? destination.y : destination.y + destination.h
                    }`}
                    fill="none"
                    stroke="#0F766E"
                    strokeWidth="4"
                    strokeDasharray="8 6"
                    strokeLinecap="round"
                  />
                  {/* Start Marker */}
                  <circle cx={startX} cy={startY} r="9" fill="#0F766E" stroke="#FFFFFF" strokeWidth="3" />
                  <text x={startX} y={startY + 23} textAnchor="middle" fill="#0F766E" fontSize="10.5" fontWeight="700">
                    {language === 'hi' ? 'आप यहाँ हैं' : 'YOU ARE HERE'}
                  </text>
                </>
              )}
            </svg>
          </div>

          {/* Quick Destination Picker */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-600">
              {language === 'hi' ? 'कहाँ जाना है? (विभाग चुनें)' : 'Tap where you want to go:'}
            </p>
            <div className="flex flex-wrap gap-2">
              {HOSPITAL_ROOMS.map((room) => {
                const active = destination.id === room.id;
                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => {
                      setFloor(room.floor);
                      setSelectedRoomId(room.id);
                    }}
                    className={`px-3 py-2 rounded-xl border text-xs font-medium min-h-[38px] transition-colors ${
                      active
                        ? 'border-teal-700 bg-teal-700 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {language === 'hi' ? room.nameHi : room.nameEn}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Accessible Large-Arrow Step-by-Step Directions */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <p className="text-xs font-semibold text-teal-800">{destination.floor}</p>
              <h3 className="font-display text-xl font-bold text-slate-900 mt-0.5">
                {language === 'hi' ? destination.nameHi : destination.nameEn}
              </h3>
            </div>
            <button
              type="button"
              onClick={speakDirections}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 text-teal-800 hover:bg-teal-100 text-xs font-semibold min-h-[40px] whitespace-nowrap"
            >
              <Volume2 className="w-4 h-4" />
              {language === 'hi' ? 'सुनें' : 'Read Aloud'}
            </button>
          </div>

          <ol className="space-y-4">
            {(language === 'hi'
              ? destination.stepsFromRegistrationHi
              : destination.stepsFromRegistrationEn
            ).map((instruction, idx) => (
              <li key={idx} className="flex items-start gap-3.5">
                <span className="w-8 h-8 rounded-full bg-teal-700 text-white font-mono text-sm font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div className="pt-0.5">
                  <p className="text-base font-medium text-slate-900 leading-relaxed">
                    {instruction}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-sm text-slate-700">
            <ArrowRight className="w-5 h-5 text-teal-700 shrink-0" />
            <span>
              {language === 'hi'
                ? 'यदि चलने में कठिनाई हो, तो प्रवेश द्वार पर निःशुल्क व्हीलचेयर सहायता उपलब्ध है।'
                : 'Need assistance walking? Free wheelchair escort is available at Ground Floor Registration.'}
            </span>
          </div>
        </div>
      </div>

      {/* Prototype QR Scan Modal */}
      {qrModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
          onClick={() => setQrModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-slate-900">
                {language === 'hi' ? 'QR लोकेशन स्कैन (प्रोटोटाइप)' : 'Scan Hospital QR Code (Prototype)'}
              </h3>
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600">
              {language === 'hi'
                ? 'नीचे किसी भी अस्पताल QR स्टैंड को चुनें — ऐप तुरंत आपकी लोकेशन पहचानकर रास्ता दिखाएगा।'
                : 'Select a simulated hospital QR stand below to detect your current location and compute directions:'}
            </p>
            <div className="space-y-2.5">
              {QR_CHECKPOINTS.map((cp) => (
                <button
                  key={cp.id}
                  type="button"
                  onClick={() => {
                    setCurrentQr(cp);
                    setFloor(cp.floor);
                    setQrModalOpen(false);
                    pushToast(
                      language === 'hi'
                        ? `QR पहचाना गया: ${cp.labelHi}`
                        : `Location recognized: ${cp.labelEn}`
                    );
                  }}
                  className="w-full p-4 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/40 text-left flex items-center justify-between gap-3"
                >
                  <span className="text-sm font-semibold text-slate-900">
                    {language === 'hi' ? cp.labelHi : cp.labelEn}
                  </span>
                  <CheckCircle2 className="w-5 h-5 text-teal-700 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
