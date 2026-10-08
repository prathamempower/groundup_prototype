import { SitePhoto } from './types';

export const SITE_PHOTOS: SitePhoto[] = [
  {
    id: 'photo-1',
    title: 'Front elevation · framing',
    time: 'Apr 25 · 8:12a',
    tags: [
      { label: 'Framing 80%', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      { label: 'Roof trusses set', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    ],
    aiConfidence: 0.98,
  },
  {
    id: 'photo-2',
    title: 'Rear · sheathing',
    time: 'Apr 25 · 8:14a',
    tags: [{ label: 'OSB 100%', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }],
    aiConfidence: 0.99,
  },
  {
    id: 'photo-3',
    title: 'Interior · 2nd floor',
    time: 'Apr 25 · 8:18a',
    tags: [
      { label: 'Studs complete', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      { label: 'MEP not started', color: 'bg-slate-100 text-slate-600 border-slate-200' },
    ],
    aiConfidence: 0.96,
  },
  {
    id: 'photo-4',
    title: 'Roof framing & trusses',
    time: 'Apr 25 · 8:20a',
    tags: [
      { label: 'Trusses 100%', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      { label: 'Tie-downs inspected', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    ],
    aiConfidence: 0.97,
  },
  {
    id: 'photo-5',
    title: 'Window rough openings',
    time: 'Apr 25 · 8:25a',
    tags: [{ label: 'Rough-in complete', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }],
    aiConfidence: 0.95,
  },
  {
    id: 'photo-6',
    title: 'Electrical pre-wire prep',
    time: 'Apr 25 · 8:30a',
    tags: [{ label: 'Prepped for MEP', color: 'bg-blue-50 text-blue-700 border-blue-200' }],
    aiConfidence: 0.94,
  },
];
