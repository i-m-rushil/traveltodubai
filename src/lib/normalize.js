const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80&fit=crop';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return '';
  }
}

export function normalizeArticle(a) {
  if (!a) return null;
  return {
    id: a.id,
    slug: a.slug,
    uid: a.slug,
    title: a.title || 'Untitled',
    excerpt: a.excerpt || '',
    content: a.content || '',
    image: a.featured_image || DEFAULT_IMAGE,
    category: a.category?.label || 'Travel',
    categoryColor: a.category?.color || '#e43d30',
    categorySlug: a.category?.slug || 'travel',
    author: a.author?.name || 'Travel to Dubai',
    authorAvatar: a.author?.avatar_url || null,
    date: formatDate(a.published_at),
    readTime: a.read_time ? `${a.read_time} min read` : '5 min read',
    views: a.views ? `${Number(a.views).toLocaleString()} views` : '',
    comments: a.comments_count || 0,
    tag: a.tag_label || null,
    tagColor: '#e43d30',
    badge: `📍 Dubai`,
    is_featured: a.is_featured,
  };
}

export function normalizeArticles(arr) {
  return (arr || []).map(normalizeArticle).filter(Boolean);
}
