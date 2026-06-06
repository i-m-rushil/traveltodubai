import { heroSlides, recentArticles, categoryArticles, analysisArticles, popularArticles } from './mockData';

const raw = [
  ...heroSlides.map(a => ({ ...a, source: 'hero', readTime: a.readTime || '6 min read' })),
  ...recentArticles.map(a => ({ ...a, source: 'recent' })),
  ...categoryArticles.map(a => ({ ...a, source: 'category' })),
  ...analysisArticles.map(a => ({ ...a, source: 'analysis', categoryColor: '#e43d30', tag: a.category })),
  ...popularArticles.map(a => ({
    ...a, source: 'popular',
    category: 'Popular', categoryColor: '#C9A050',
    excerpt: 'An essential guide for anyone exploring the incredible city of Dubai.',
    readTime: '5 min read', author: 'Travel to Dubai Team',
  })),
];

export const allArticles = raw.map((a, i) => ({ ...a, uid: i + 1 }));

export function getArticle(uid) {
  return allArticles.find(a => a.uid === Number(uid));
}

export function getRelatedArticles(article, count = 3) {
  const same = allArticles.filter(a => a.uid !== article.uid && a.category === article.category);
  const other = allArticles.filter(a => a.uid !== article.uid && a.category !== article.category);
  return [...same, ...other].slice(0, count);
}

export function getArticleUid(title) {
  return allArticles.find(a => a.title === title)?.uid;
}

export const CATEGORIES = [
  { slug: 'all', label: 'All Articles', color: '#e43d30' },
  { slug: 'travel', label: 'Travel', color: '#e43d30' },
  { slug: 'attractions', label: 'Attractions', color: '#e43d30' },
  { slug: 'food', label: 'Food & Dining', color: '#ea580c' },
  { slug: 'lifestyle', label: 'Lifestyle', color: '#e43d30' },
  { slug: 'culture', label: 'Culture', color: '#7c3aed' },
  { slug: 'beaches', label: 'Beaches', color: '#0891b2' },
  { slug: 'shopping', label: 'Shopping', color: '#059669' },
  { slug: 'nightlife', label: 'Nightlife', color: '#7c3aed' },
  { slug: 'wellness', label: 'Wellness', color: '#C9A050' },
  { slug: 'family', label: 'Family', color: '#e43d30' },
];

export function filterBySlug(slug) {
  if (!slug || slug === 'all') return allArticles;
  return allArticles.filter(a =>
    a.category?.toLowerCase().replace(/[^a-z0-9]/g, '').includes(slug.replace(/-/g, '').toLowerCase())
  );
}

export const POPULAR_TAGS = [
  'Desert Safari', 'Burj Khalifa', 'Palm Jumeirah', 'Luxury Hotels',
  'Food Guide', 'Budget Travel', 'Family Fun', 'Beaches',
  'Shopping', 'Nightlife', 'Culture', 'Metro Guide', 'Visa Tips', 'Adventure',
];

export const CATEGORY_DESCRIPTIONS = {
  all: 'Explore our complete collection of Dubai travel stories, guides, and insider tips — everything you need for an unforgettable journey.',
  travel: 'In-depth travel guides covering every aspect of your Dubai trip — planning, budgeting, transport, and accommodation.',
  attractions: 'Dubai\'s most iconic landmarks, hidden gems, and must-visit experiences from the Burj Khalifa to the ancient souks of Deira.',
  food: 'The best of Dubai\'s extraordinary food scene: Emirati street food, Michelin-starred restaurants, and everything in between.',
  lifestyle: 'Live like a local — Dubai\'s neighbourhoods, culture, wellness scene, and the lifestyle that makes this city unlike any other.',
  culture: 'Discover Dubai\'s rich Emirati heritage, traditional arts, museums, and cultural experiences that run deeper than the skyline.',
  beaches: 'Sun, sea, and sand — Dubai\'s best beaches, beach clubs, water sports, and coastal experiences ranked and reviewed.',
  shopping: 'From mega-malls to traditional souks — the definitive guide to shopping in the world\'s retail capital.',
  nightlife: 'Dubai after dark: the best rooftop bars, beach clubs, live music venues, and licensed lounges in the city.',
  wellness: 'Desert spas, hammam retreats, yoga on the beach — Dubai\'s world-class wellness and relaxation scene.',
  family: 'Dubai with children: theme parks, family beaches, kid-friendly activities, and how to make the most of a family trip.',
};
