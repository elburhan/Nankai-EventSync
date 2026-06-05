export const EVENT_CATEGORIES = ['Academic', 'Sports', 'Art and culture', 'Others'] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

const normalizedCategoryLookup = new Set<string>(EVENT_CATEGORIES);

const categoryKeywordMatchers: Array<{ category: EventCategory; keywords: string[] }> = [
  {
    category: 'Academic',
    keywords: ['academic', 'lecture', 'research', 'workshop', 'seminar', 'study', 'conference'],
  },
  {
    category: 'Sports',
    keywords: ['sport', 'sports', 'football', 'basketball', 'fitness', 'running', 'match'],
  },
  {
    category: 'Art and culture',
    keywords: ['art', 'culture', 'cultural', 'music', 'club', 'festival', 'performance', 'theatre'],
  },
];

export const normalizeEventCategory = (category: string): EventCategory => {
  const trimmedCategory = category.trim();

  if (normalizedCategoryLookup.has(trimmedCategory)) {
    return trimmedCategory as EventCategory;
  }

  const lowercaseCategory = trimmedCategory.toLowerCase();
  const matchedCategory = categoryKeywordMatchers.find(({ keywords }) =>
    keywords.some((keyword) => lowercaseCategory.includes(keyword)),
  );

  return matchedCategory?.category ?? 'Others';
};

export const getEventCategoryTranslationKey = (category: string): string => {
  switch (normalizeEventCategory(category)) {
    case 'Academic':
      return 'categories.academic';
    case 'Sports':
      return 'categories.sports';
    case 'Art and culture':
      return 'categories.artAndCulture';
    case 'Others':
    default:
      return 'categories.others';
  }
};
