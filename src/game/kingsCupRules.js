import { DEFAULT_KINGS_CUP_RULES } from '../constants.js';

export function getRuleForCard(card, customRules) {
  if (customRules && customRules[card.rank]) {
    return customRules[card.rank];
  }
  return DEFAULT_KINGS_CUP_RULES[card.rank] || { title: '???', desc: 'No rule defined.' };
}

export function mergeWithDefaults(customRules) {
  const merged = {};
  for (const rank of Object.keys(DEFAULT_KINGS_CUP_RULES)) {
    if (customRules && customRules[rank]) {
      merged[rank] = {
        title: customRules[rank].title || DEFAULT_KINGS_CUP_RULES[rank].title,
        desc: customRules[rank].desc || DEFAULT_KINGS_CUP_RULES[rank].desc,
      };
    } else {
      merged[rank] = { ...DEFAULT_KINGS_CUP_RULES[rank] };
    }
  }
  return merged;
}
