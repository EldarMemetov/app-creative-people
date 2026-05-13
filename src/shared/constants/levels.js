export const LEVELS = [
  { name: 'Новачок', min: 0, max: 50, color: '#8a9bb5' },
  { name: 'Креатор', min: 51, max: 150, color: '#a6b4ff' },
  { name: 'Професіонал', min: 151, max: 350, color: '#7a5bff' },
  { name: 'Майстер', min: 351, max: 700, color: '#c9b2ff' },
  { name: 'Легенда', min: 701, max: 99999, color: '#ffd700' },
];

export const LEVEL_FILTER_OPTIONS = [
  { label: 'Всі рівні', value: '' },
  { label: 'Новачок', value: '0-50' },
  { label: 'Креатор', value: '51-150' },
  { label: 'Професіонал', value: '151-350' },
  { label: 'Майстер', value: '351-700' },
  { label: 'Легенда', value: '701-99999' },
];

export const getLevel = (rating = 0) => {
  return LEVELS.find((l) => rating >= l.min && rating <= l.max) || LEVELS[0];
};
