import React, { useState } from 'react';
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sun,
  Heart,
  Droplets,
  Footprints,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HealthTip {
  id: string;
  category: 'Diet & Nutrition' | 'Diabetes & BP' | 'Senior Mobility' | 'Hydration & Seasonal';
  titleEn: string;
  titleHi: string;
  summaryEn: string;
  summaryHi: string;
  actionSteps: string[];
  source: string;
}

const HEALTH_TIPS: HealthTip[] = [
  {
    id: 'tip-1',
    category: 'Diet & Nutrition',
    titleEn: 'Eat fresh seasonal fruits and fiber-rich dal every day',
    titleHi: 'रोज़ाना ताज़े मौसमी फल और फाइबर युक्त दाल-सब्ज़ी खाएं',
    summaryEn:
      'A balanced Indian thali with leafy greens, whole grains, and seasonal fruits supports steady energy, gut health, and healthy hemoglobin levels.',
    summaryHi:
      'हरी सब्ज़ियां, दाल, साबुत अनाज और मौसमी फल शरीर की रोग प्रतिरोधक क्षमता और हीमोग्लोबिन बनाए रखते हैं।',
    actionSteps: [
      'Include one bowl of dal, chana, or sprouts at lunch.',
      'Pair iron-rich foods (palak, roasted chana) with a squeeze of lemon (Vitamin C).',
      'Avoid tea or coffee immediately after meals to improve iron absorption.',
    ],
    source: 'ICMR-NIN Dietary Guidelines for Indians',
  },
  {
    id: 'tip-2',
    category: 'Diabetes & BP',
    titleEn: 'Take a gentle 15–20 minute walk after meals',
    titleHi: 'खाना खाने के बाद 15–20 मिनट आराम से टहलें',
    summaryEn:
      'Light walking 15 minutes after lunch or dinner helps smooth post-meal blood glucose spikes without straining joints.',
    summaryHi:
      'भोजन के 15 मिनट बाद हल्की सैर करने से ब्लड शुगर अचानक नहीं बढ़ता और पाचन बेहतर रहता है।',
    actionSteps: [
      'Wear cushioned, non-slip walking shoes indoors or in a park.',
      'Keep water nearby and rest immediately if you feel dizzy.',
      'Aim for consistency rather than fast speed.',
    ],
    source: 'WHO Physical Activity Guidelines for Older Adults',
  },
  {
    id: 'tip-3',
    category: 'Hydration & Seasonal',
    titleEn: 'Stay hydrated steadily throughout the day',
    titleHi: 'दिनभर थोड़ा-थोड़ा पानी पीते रहें',
    summaryEn:
      'Elderly adults often feel less thirst even when mildly dehydrated. Sipping water regularly prevents fatigue and dizziness.',
    summaryHi:
      'बुजुर्गों को कई बार प्यास कम महसूस होती है। समय-समय पर पानी पीने से कमजोरी और चक्कर से बचाव होता है।',
    actionSteps: [
      'Keep a filled 500 ml bottle near your chair or bedside.',
      'Include unsweetened chaas (buttermilk) or nimbu pani in warm weather.',
      'Check with your doctor if you have fluid restrictions for heart/kidney care.',
    ],
    source: 'MoHFW India Preventive Care',
  },
  {
    id: 'tip-4',
    category: 'Senior Mobility',
    titleEn: 'Protect joints with 5-minute morning stretching',
    titleHi: 'सुबह 5 मिनट हल्के व्यायाम से जोड़ों को लचीला रखें',
    summaryEn:
      'Gentle seated ankle rotations, shoulder rolls, and slow standing practice improve balance and reduce fall risk at home.',
    summaryHi:
      'कुर्सी पर बैठकर टखनों और कंधों की हल्की कसरत संतुलन बेहतर करती है और गिरने का खतरा कम करती है।',
    actionSteps: [
      'Hold onto a sturdy chair back while doing gentle calf raises.',
      'Keep bathroom and hallway floors dry and well-lit at night.',
      'Stop any movement that causes sharp pain.',
    ],
    source: 'National Programme for Health Care of the Elderly (NPHCE)',
  },
];

export function HealthTips() {
  const { language, pushToast } = useApp();
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [filter, setFilter] = useState<string>('All');
  const [savedIds, setSavedIds] = useState<string[]>(['tip-1']);

  const featured = HEALTH_TIPS[featuredIdx];
  const filteredTips =
    filter === 'All' ? HEALTH_TIPS : HEALTH_TIPS.filter((t) => t.category === filter);

  const toggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    pushToast('Updated your saved health tips.', 'info');
  };

  const categoryIcon = (cat: HealthTip['category']) => {
    if (cat === 'Diet & Nutrition') return <Sun className="w-5 h-5 text-amber-600" />;
    if (cat === 'Diabetes & BP') return <Heart className="w-5 h-5 text-teal-700" />;
    if (cat === 'Hydration & Seasonal') return <Droplets className="w-5 h-5 text-blue-700" />;
    return <Footprints className="w-5 h-5 text-emerald-700" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900">
          {language === 'hi' ? 'स्वास्थ्य सुझाव और रोज़ाना देखभाल' : 'Health Tips & Daily Insights'}
        </h2>
        <p className="text-sm text-slate-600 mt-0.5">
          Practical, culturally relevant preventive guidance curated for Indian families and seniors.
        </p>
      </div>

      {/* Featured Tip Carousel Card (Panel #14 inspiration) */}
      <section className="bg-gradient-to-br from-teal-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-semibold text-teal-200">
            Featured Daily Insight · {featured.category}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setFeaturedIdx((i) => (i === 0 ? HEALTH_TIPS.length - 1 : i - 1))
              }
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Previous tip"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setFeaturedIdx((i) => (i + 1) % HEALTH_TIPS.length)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Next tip"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h3 className="font-display text-2xl sm:text-3xl font-bold text-balance leading-snug">
          {language === 'hi' ? featured.titleHi : featured.titleEn}
        </h3>
        <p className="text-sm sm:text-base text-teal-50/90 max-w-2xl leading-relaxed">
          {language === 'hi' ? featured.summaryHi : featured.summaryEn}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {featured.actionSteps.map((step) => (
            <div
              key={step}
              className="p-3.5 rounded-xl bg-white/10 border border-white/10 text-xs sm:text-sm text-white flex items-start gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
              <span>{step}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-teal-200/80">Reference: {featured.source}</p>
      </section>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {['All', 'Diet & Nutrition', 'Diabetes & BP', 'Senior Mobility', 'Hydration & Seasonal'].map(
          (cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium min-h-[40px] transition-colors ${
                filter === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          )
        )}
      </div>

      {/* Tips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredTips.map((tip) => {
          const isSaved = savedIds.includes(tip.id);
          return (
            <article
              key={tip.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    {categoryIcon(tip.category)}
                    <span>{tip.category}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSave(tip.id)}
                    className={`p-2 rounded-lg min-w-[38px] min-h-[38px] flex items-center justify-center ${
                      isSaved ? 'bg-teal-50 text-teal-700' : 'text-slate-400 hover:bg-slate-100'
                    }`}
                    aria-label="Bookmark tip"
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <h4 className="font-display text-lg font-bold text-slate-900">
                  {language === 'hi' ? tip.titleHi : tip.titleEn}
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {language === 'hi' ? tip.summaryHi : tip.summaryEn}
                </p>

                <ul className="space-y-1.5 pt-2 text-xs sm:text-sm text-slate-700">
                  {tip.actionSteps.map((st) => (
                    <li key={st} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-xs text-slate-400 pt-3 border-t border-slate-100">
                Source: {tip.source}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
