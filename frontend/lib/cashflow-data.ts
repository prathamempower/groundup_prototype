export const TODAY_INDEX = 11;

const MONTHS = [
  'Nov 25', 'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26', 'Jun 26', 'Jul 26', 'Aug 26', 'Sep 26', 'Oct 26',
  'Nov 26', 'Dec 26', 'Jan 27', 'Feb 27', 'Mar 27', 'Apr 27', 'May 27', 'Jun 27', 'Jul 27', 'Aug 27',
];

const PLANNED = [0.4, 0.9, 1.6, 2.4, 3.3, 4.3, 5.4, 6.5, 7.6, 8.7, 9.7, 10.6, 11.6, 12.6, 13.6, 14.6, 15.5, 16.3, 17.0, 17.6, 18.1, 18.4];
const SPEND = [0.45, 1.0, 1.75, 2.6, 3.4, 4.3, 5.2, 6.1, 7.0, 7.9, 8.8, 9.62, 10.6, 11.6, 12.6, 13.6, 14.6, 15.6, 16.6, 17.6, 18.5, 19.1];
const PROGRESS = [0.4, 0.92, 1.6, 2.45, 3.2, 4.05, 4.9, 5.7, 6.5, 7.4, 8.25, 9.02];
const FUNDING = [0.6, 1.5, 2.4, 3.2, 3.2, 4.1, 4.9, 5.6, 6.3, 7.0, 7.8, 8.6, 9.8, 10.9, 12.0, 13.1, 14.2, 15.2, 16.2, 17.1, 17.9, 18.4];
const ESTIMATE_AT_COMPLETION = [18.4, 18.4, 18.4, 18.45, 18.5, 18.5, 18.6, 18.6, 18.75, 18.85, 18.95, 19.1];

export const PROJECT_VALUE = 24.5;
export const UNDERWRITTEN_PROFIT = 6.1;

const isActual = (i: number) => i <= TODAY_INDEX;
const round = (n: number) => Math.round(n * 100) / 100;

export const COST_SERIES = MONTHS.map((month, i) => ({
  month,
  planned: PLANNED[i],
  spend: isActual(i) ? SPEND[i] : null,
  spendForecast: i >= TODAY_INDEX ? SPEND[i] : null,
  progress: isActual(i) ? PROGRESS[i] : null,
  funding: isActual(i) ? FUNDING[i] : null,
  fundingForecast: i >= TODAY_INDEX ? FUNDING[i] : null,
}));

export const CASH_SERIES = MONTHS.map((month, i) => ({
  month,
  position: round(FUNDING[i] - SPEND[i]),
  forecast: !isActual(i),
}));

export const PROFIT_SERIES = ESTIMATE_AT_COMPLETION.map((eac, i) => ({
  month: MONTHS[i],
  profit: round(PROJECT_VALUE - eac),
  underwritten: UNDERWRITTEN_PROFIT,
}));

export const SNAPSHOT = {
  month: MONTHS[TODAY_INDEX],
  planned: PLANNED[TODAY_INDEX],
  spend: SPEND[TODAY_INDEX],
  progress: PROGRESS[TODAY_INDEX],
  funding: FUNDING[TODAY_INDEX],
  forecastCost: SPEND[SPEND.length - 1],
  forecastFunding: FUNDING[FUNDING.length - 1],
  plannedFinish: 'Jun 27',
  forecastFinish: MONTHS[MONTHS.length - 1],
  peakShortfall: Math.min(...CASH_SERIES.map((d) => d.position)),
  projectedProfit: round(PROJECT_VALUE - ESTIMATE_AT_COMPLETION[TODAY_INDEX]),
};

export function formatMillions(value: number, signed = false) {
  const sign = signed ? (value > 0 ? '+' : value < 0 ? '-' : '') : value < 0 ? '-' : '';
  return `${sign}$${Math.abs(value).toFixed(2)}M`;
}
