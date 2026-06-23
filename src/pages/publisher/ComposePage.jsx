import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useIsMobile } from '../../hooks/useIsMobile'
import {
  getAllCategories, getArticleForEdit, saveArticle, setArticleTags,
  uploadImage, logActivity,
} from '../../lib/supabase'
import { emirates } from '../../data/mockData'
import { DUBAI_AREAS } from '../../data/areas'

function calcScore(p) {
  const titleLen = p.title.length
  const titleScore = titleLen >= 50 && titleLen <= 70 ? 95 : titleLen >= 35 ? 78 : titleLen >= 20 ? 62 : titleLen > 0 ? 45 : 0
  const words = p.content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length
  const readability = words >= 800 ? 92 : words >= 500 ? 78 : words >= 300 ? 65 : words >= 100 ? 52 : words > 0 ? 38 : 0
  const seo = (p.metaDesc.length >= 140 ? 40 : p.metaDesc.length > 0 ? 25 : 0) + (p.featuredImage ? 30 : 0) + (p.tags ? 20 : 0) + (p.excerpt.length > 50 ? 10 : 0)
  const overall = Math.round((titleScore + readability + Math.min(seo, 100)) / 3)
  return { title: titleScore, readability, seo: Math.min(seo, 100), overall }
}

function scoreColor(s) {
  return s >= 80 ? '#10b981' : s >= 60 ? '#f59e0b' : 'var(--brand)'
}

function ScoreBar({ label, score }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-mid)' }}>
        <span>{label}</span>
        <span style={{ fontWeight: 600, color: scoreColor(score) }}>{score}</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: '#e2e8f0', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, borderRadius: 3, background: scoreColor(score), transition: 'width 0.5s ease' }} />
      </div>
    </div>
  )
}

function ScoreCircle({ score }) {
  const r = 32
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const color = scoreColor(score)
  return (
    <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 16px' }}>
      <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="40" cy="40" r={r} fill="none" stroke="#e2e8f0" strokeWidth="7" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="7" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.5s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-ui)', fontSize: 20, fontWeight: 700, color }}>
        {score}
      </div>
    </div>
  )
}

// Renders the content exactly like the public ArticlePage, including Instagram embeds
function LivePreview({ html }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!html.includes('instagram-media')) return
    if (window.instgrm?.Embeds) {
      window.instgrm.Embeds.process()
    } else if (!document.querySelector('script[src*="instagram.com/embed.js"]')) {
      const s = document.createElement('script')
      s.src = 'https://www.instagram.com/embed.js'
      s.async = true
      document.body.appendChild(s)
    }
  }, [html])
  return <div ref={ref} className="article-content" dangerouslySetInnerHTML={{ __html: html }} />
}

export default function ComposePage() {
  const { id } = useParams()
  const isMobile = useIsMobile()
  const isEdit = !!id

  const auth = JSON.parse(localStorage.getItem('ttd_auth') || '{}')

  const [post, setPost] = useState({
    title: '', slug: '', categoryId: '', emirate: '', area: '', tags: '', excerpt: '',
    featuredImage: '', content: '', status: 'draft', metaDesc: ''
  })
  const [articleId, setArticleId] = useState(id || null)
  const [categories, setCategories] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [publishSuccess, setPublishSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [aiScore, setAiScore] = useState({ title: 0, readability: 0, seo: 0, overall: 0 })
  const [activeTab, setActiveTab] = useState('write')
  const [insertModal, setInsertModal] = useState(null) // 'featured' | 'image' | 'instagram' | 'html'
  const [insertUrl, setInsertUrl] = useState('')
  const [insertCode, setInsertCode] = useState('')
  const [uploading, setUploading] = useState(false)
  const [scheduleOn, setScheduleOn] = useState(false)

  const autoSaveTimer = useRef(null)
  const textareaRef = useRef(null)
  const slugTouched = useRef(isEdit)
  const fileInputRef = useRef(null)
  const publishedDate = useRef(null)

  // Load categories
  useEffect(() => {
    getAllCategories().then(({ data }) => {
      if (data?.length) {
        setCategories(data)
        setPost(prev => prev.categoryId ? prev : { ...prev, categoryId: data[0].id })
      }
    })
  }, [])

  // Load article when editing
  useEffect(() => {
    if (!isEdit) return
    getArticleForEdit(id).then(({ data, error }) => {
      if (error || !data) {
        setErrorMsg('Could not load this post. It may have been deleted.')
        return
      }
      publishedDate.current = data.published_at
      setPost({
        title: data.title || '',
        slug: data.slug || '',
        categoryId: data.category_id || '',
        emirate: data.emirate || '',
        area: data.area || '',
        tags: (data.tags || []).map(t => t.tag?.name).filter(Boolean).join(', '),
        excerpt: data.excerpt || '',
        featuredImage: data.featured_image || '',
        content: data.content || '',
        status: data.status || 'draft',
        metaDesc: data.meta_description || '',
      })
    })
  }, [id, isEdit])

  useEffect(() => {
    setAiScore(calcScore(post))
  }, [post])

  // Autosave drafts 3s after the last change (never auto-pushes published edits live)
  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    setSaved(false)
    autoSaveTimer.current = setTimeout(() => {
      if (post.title.trim() && post.status === 'draft' && !saving) {
        persist('draft', { silent: true })
      }
    }, 3000)
    return () => clearTimeout(autoSaveTimer.current)
  }, [post])

  function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  function updatePost(field, value) {
    setErrorMsg('')
    setPublishSuccess(false)
    setPost(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'title' && !slugTouched.current) next.slug = slugify(value)
      if (field === 'slug') slugTouched.current = true
      return next
    })
  }

  async function persist(status, { silent = false } = {}) {
    if (!post.title.trim()) {
      if (!silent) setErrorMsg('Please add a title before saving.')
      return
    }
    if (!silent) { setSaving(true); setErrorMsg('') }
    const { data, error } = await saveArticle({
      id: articleId,
      title: post.title,
      slug: post.slug || slugify(post.title) || `post-${Math.random().toString(36).slice(2, 8)}`,
      excerpt: post.excerpt,
      content: post.content,
      featuredImage: post.featuredImage,
      categoryId: post.categoryId || null,
      emirate: post.emirate || null,
      area: post.area || null,
      status,
      metaDescription: post.metaDesc,
      seoScore: aiScore.overall,
    })
    if (error) {
      if (!silent) {
        setSaving(false)
        setErrorMsg(error.message || 'Saving failed — please try again.')
      }
      return
    }
    if (!articleId && data?.id) {
      setArticleId(data.id)
      window.history.replaceState(null, '', `/dashboard/compose/${data.id}`)
    }
    if (data?.slug && data.slug !== post.slug) {
      setPost(prev => ({ ...prev, slug: data.slug }))
    }
    const targetId = articleId || data?.id
    if (targetId) await setArticleTags(targetId, post.tags.split(','))
    // Returning the same object when status is unchanged lets React bail out,
    // so the silent autosave doesn't retrigger itself in a loop.
    setPost(prev => (prev.status === status ? prev : { ...prev, status }))
    setSaved(true)
    if (!silent) {
      setSaving(false)
      if (status === 'published') {
        setPublishSuccess(true)
        logActivity({
          actionType: 'article_published',
          entityType: 'article',
          entityId: targetId,
          message: `${auth.name || 'A publisher'} published "${post.title}"`,
        })
      } else {
        logActivity({
          actionType: 'article_updated',
          entityType: 'article',
          entityId: targetId,
          message: `${auth.name || 'A publisher'} saved a draft of "${post.title}"`,
        })
      }
    }
  }

  function insertAtCursor(prefix, suffix = '') {
    const ta = textareaRef.current
    if (!ta) {
      updatePost('content', post.content + prefix + suffix)
      return
    }
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const sel = ta.value.slice(start, end)
    const newVal = ta.value.slice(0, start) + prefix + sel + suffix + ta.value.slice(end)
    updatePost('content', newVal)
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(start + prefix.length, start + prefix.length + sel.length)
    }, 0)
  }

  function instagramEmbedHtml(url) {
    const clean = url.split('?')[0].replace(/\/?$/, '/')
    return `\n<blockquote class="instagram-media" data-instgrm-permalink="${clean}" data-instgrm-version="14" style="margin: 28px auto; max-width: 540px; width: 100%;"><a href="${clean}" target="_blank" rel="noopener noreferrer">View this post on Instagram</a></blockquote>\n`
  }

  function handleInsert() {
    if (insertModal === 'featured') {
      if (insertUrl) updatePost('featuredImage', insertUrl)
    } else if (insertModal === 'image') {
      if (insertUrl) insertAtCursor(`\n<img src="${insertUrl}" alt="" loading="lazy" />\n`)
    } else if (insertModal === 'instagram') {
      if (insertUrl.includes('instagram.com')) {
        insertAtCursor(instagramEmbedHtml(insertUrl))
      } else {
        setErrorMsg('Please paste a valid Instagram post URL (instagram.com/p/… or /reel/…).')
        return
      }
    } else if (insertModal === 'html') {
      if (insertCode) insertAtCursor(`\n${insertCode}\n`)
    }
    setInsertModal(null)
    setInsertUrl('')
    setInsertCode('')
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const { data, error } = await uploadImage(file, insertModal === 'featured' ? 'featured' : 'posts')
    setUploading(false)
    if (error) {
      setErrorMsg(error.message || 'Upload failed — please try again.')
      return
    }
    setInsertUrl(data.url)
    e.target.value = ''
  }

  const wordCount = post.content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length
  const titleLen = post.title.length

  function titleCountColor() {
    if (titleLen >= 50 && titleLen <= 70) return '#10b981'
    if (titleLen >= 35) return '#f59e0b'
    return titleLen > 0 ? 'var(--brand)' : 'var(--text-light)'
  }

  function getLowestScoreTip() {
    const scores = [
      { key: 'title', val: aiScore.title, tip: 'Aim for a title between 50–70 characters for best SEO.' },
      { key: 'readability', val: aiScore.readability, tip: 'Write at least 500 words for strong readability.' },
      { key: 'seo', val: aiScore.seo, tip: 'Add a meta description, featured image, and tags.' }
    ]
    scores.sort((a, b) => a.val - b.val)
    return scores[0].tip
  }

  const seoChecks = [
    { label: 'Title between 50–70 characters', pass: titleLen >= 50 && titleLen <= 70 },
    { label: 'Meta description filled (140–160 chars)', pass: post.metaDesc.length >= 140 && post.metaDesc.length <= 160 },
    { label: 'Featured image set', pass: !!post.featuredImage },
    { label: 'Tags added', pass: !!post.tags.trim() },
    { label: 'Content over 500 words', pass: wordCount >= 500 }
  ]

  const displayDate = (publishedDate.current ? new Date(publishedDate.current) : new Date())
    .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const cardStyle = { background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: '20px 24px', marginBottom: 20 }
  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontFamily: 'var(--font-ui)', fontSize: 13, outline: 'none', boxSizing: 'border-box', color: 'var(--text-dark)' }
  const labelStyle = { display: 'block', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: 'var(--text-light)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 6 }
  const toolbarBtnStyle = { width: 32, height: 32, border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13, color: 'var(--text-dark)', flexShrink: 0 }

  const tabItems = [
    { key: 'write', label: 'Write' },
    { key: 'preview', label: 'Preview' },
    { key: 'seo', label: 'SEO' }
  ]

  const modalTitles = {
    featured: 'Set Featured Image',
    image: 'Insert Image',
    instagram: 'Embed Instagram Post',
    html: 'Insert HTML Block',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: 'var(--font-ui)' }}>
      {/* INSERT MODAL */}
      {insertModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 28, width: 440, maxWidth: '90vw', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 16, color: 'var(--text-dark)', marginBottom: 18 }}>
              {modalTitles[insertModal]}
            </div>
            {(insertModal === 'image' || insertModal === 'featured') && (
              <>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  style={{ width: '100%', border: '2px dashed #e2e8f0', borderRadius: 10, padding: '18px 16px', textAlign: 'center', cursor: uploading ? 'wait' : 'pointer', background: '#f8fafc', marginBottom: 14, fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--text-mid)' }}
                >
                  {uploading ? 'Uploading…' : '⬆ Upload from your device'}
                </button>
                <div style={{ textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-light)', marginBottom: 14, letterSpacing: '0.5px' }}>— OR PASTE A URL —</div>
                <label style={labelStyle}>Image URL</label>
                <input
                  style={{ ...inputStyle, marginBottom: 14 }}
                  value={insertUrl}
                  onChange={e => setInsertUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                {insertUrl && (
                  <img src={insertUrl} alt="preview" loading="lazy" decoding="async" onError={e => e.target.style.display = 'none'} style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 14 }} />
                )}
              </>
            )}
            {insertModal === 'instagram' && (
              <>
                <label style={labelStyle}>Instagram Post URL</label>
                <input
                  style={{ ...inputStyle, marginBottom: 10 }}
                  value={insertUrl}
                  onChange={e => setInsertUrl(e.target.value)}
                  placeholder="https://www.instagram.com/p/ABC123…"
                />
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-light)', lineHeight: 1.5, marginBottom: 14 }}>
                  Paste the link of any Instagram post or reel. It will render as a live embed in the article — check the Preview tab to see it.
                </div>
              </>
            )}
            {insertModal === 'html' && (
              <>
                <label style={labelStyle}>HTML Code</label>
                <textarea
                  style={{ ...inputStyle, height: 120, resize: 'vertical', fontFamily: 'monospace', marginBottom: 14 }}
                  value={insertCode}
                  onChange={e => setInsertCode(e.target.value)}
                  placeholder="<div>Your HTML here...</div>"
                />
              </>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => { setInsertModal(null); setInsertUrl(''); setInsertCode('') }} style={{ background: '#fff', color: 'var(--text-dark)', border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 18px', fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleInsert} disabled={uploading} style={{ background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13, cursor: 'pointer', opacity: uploading ? 0.6 : 1 }}>Insert</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '16px 14px' : '28px 32px' }}>
        {/* TOP BAR */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <Link to="/dashboard/posts" style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--text-mid)', textDecoration: 'none' }}>
            <BackArrowIcon /> Back to Posts
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            {saved && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-ui)', fontSize: 12, color: '#10b981' }}>
                <CheckIcon size={14} color="#10b981" /> Autosaved
              </span>
            )}
            {/* Tab switcher */}
            <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: 8, padding: 3, gap: 2 }}>
              {tabItems.map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  style={{
                    fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 6, padding: '6px 16px', cursor: 'pointer',
                    background: activeTab === t.key ? '#fff' : 'transparent',
                    color: activeTab === t.key ? 'var(--text-dark)' : 'var(--text-mid)',
                    boxShadow: activeTab === t.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexDirection: isMobile ? 'column' : 'row' }}>
          {/* LEFT COLUMN */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* WRITE TAB */}
            {activeTab === 'write' && (
              <>
                {/* Featured Image */}
                <div style={cardStyle}>
                  {post.featuredImage ? (
                    <>
                      <img src={post.featuredImage} alt="featured" loading="lazy" decoding="async" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 10, display: 'block', marginBottom: 12 }} />
                      <button onClick={() => setInsertModal('featured')} style={{ background: '#fff', color: 'var(--text-dark)', border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 16px', fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Change Image</button>
                    </>
                  ) : (
                    <div
                      style={{ border: '2px dashed #e2e8f0', borderRadius: 10, padding: 32, textAlign: 'center', cursor: 'pointer' }}
                      onClick={() => setInsertModal('featured')}
                    >
                      <ImageInsertIcon size={40} color="#c5cdd8" />
                      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-light)', marginTop: 10, marginBottom: 14 }}>No featured image set</div>
                      <button
                        onClick={e => { e.stopPropagation(); setInsertModal('featured') }}
                        style={{ background: '#fff', color: 'var(--text-dark)', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 18px', fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
                      >Add Featured Image</button>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div style={cardStyle}>
                  <input
                    value={post.title}
                    onChange={e => updatePost('title', e.target.value)}
                    placeholder="Enter your post title..."
                    style={{ width: '100%', fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-ui)', border: 'none', borderBottom: '2px solid #e2e8f0', outline: 'none', padding: '8px 0', color: 'var(--text-dark)', background: 'transparent', boxSizing: 'border-box' }}
                  />
                  <div style={{ marginTop: 6, fontFamily: 'var(--font-ui)', fontSize: 12, color: titleCountColor(), textAlign: 'right' }}>
                    {titleLen} / 70
                  </div>
                </div>

                {/* Toolbar + Content */}
                <div style={cardStyle}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    <button title="Bold" style={toolbarBtnStyle} onClick={() => insertAtCursor('<strong>', '</strong>')}><BoldIcon /></button>
                    <button title="Italic" style={toolbarBtnStyle} onClick={() => insertAtCursor('<em>', '</em>')}><ItalicIcon /></button>
                    <button title="Heading 2" style={{ ...toolbarBtnStyle, width: 'auto', padding: '0 8px', fontSize: 11, fontWeight: 700 }} onClick={() => insertAtCursor('\n<h2>', '</h2>\n')}>H2</button>
                    <button title="Heading 3" style={{ ...toolbarBtnStyle, width: 'auto', padding: '0 8px', fontSize: 11, fontWeight: 700 }} onClick={() => insertAtCursor('\n<h3>', '</h3>\n')}>H3</button>
                    <button title="Paragraph" style={{ ...toolbarBtnStyle, width: 'auto', padding: '0 8px', fontSize: 11, fontWeight: 700 }} onClick={() => insertAtCursor('\n<p>', '</p>\n')}>P</button>
                    <button title="Bullet List" style={{ ...toolbarBtnStyle, width: 'auto', padding: '0 8px', fontSize: 11, fontWeight: 700 }} onClick={() => insertAtCursor('\n<ul>\n  <li>', '</li>\n</ul>\n')}>• List</button>
                    <button title="Link" style={{ ...toolbarBtnStyle, width: 'auto', padding: '0 8px', fontSize: 11, fontWeight: 700 }} onClick={() => insertAtCursor('<a href="https://">', '</a>')}>Link</button>
                    <button title="Quote" style={toolbarBtnStyle} onClick={() => insertAtCursor('\n<blockquote>', '</blockquote>\n')}><QuoteIcon /></button>
                    <button title="Divider" style={{ ...toolbarBtnStyle, width: 'auto', padding: '0 8px', fontSize: 11 }} onClick={() => insertAtCursor('\n<hr />\n', '')}>—</button>
                    <button title="Insert Image" style={toolbarBtnStyle} onClick={() => setInsertModal('image')}><ImageInsertIcon size={16} /></button>
                    <button title="Embed Instagram Post" style={{ ...toolbarBtnStyle, width: 'auto', padding: '0 8px' }} onClick={() => setInsertModal('instagram')}><InstagramIcon /><span style={{ marginLeft: 5, fontSize: 11 }}>IG</span></button>
                    <button title="Insert HTML" style={toolbarBtnStyle} onClick={() => setInsertModal('html')}><CodeIcon /></button>
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={post.content}
                    onChange={e => updatePost('content', e.target.value)}
                    placeholder="Start writing your post content here... Use the toolbar to add headings, images, Instagram embeds and custom HTML — then check the Preview tab."
                    style={{ width: '100%', minHeight: 400, fontFamily: 'monospace', fontSize: 15, lineHeight: 1.8, border: '1px solid #e2e8f0', borderRadius: 10, padding: 20, resize: 'vertical', outline: 'none', color: 'var(--text-dark)', boxSizing: 'border-box' }}
                  />
                  <div style={{ marginTop: 8, fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-light)' }}>{wordCount} words</div>
                </div>

                {/* Excerpt */}
                <div style={cardStyle}>
                  <label style={labelStyle}>Excerpt</label>
                  <textarea
                    value={post.excerpt}
                    onChange={e => updatePost('excerpt', e.target.value)}
                    placeholder="A short summary of your post..."
                    style={{ ...inputStyle, height: 80, resize: 'vertical' }}
                  />
                </div>

                {/* Tags */}
                <div style={cardStyle}>
                  <label style={labelStyle}>Tags</label>
                  <input
                    value={post.tags}
                    onChange={e => updatePost('tags', e.target.value)}
                    placeholder="Add tags separated by commas (e.g. dubai, travel, luxury)"
                    style={inputStyle}
                  />
                </div>
              </>
            )}

            {/* PREVIEW TAB */}
            {activeTab === 'preview' && (
              <div style={cardStyle}>
                {post.featuredImage && (
                  <img src={post.featuredImage} alt="featured" loading="lazy" decoding="async" style={{ width: '100%', height: 280, objectFit: 'cover', borderRadius: 10, marginBottom: 24, display: 'block' }} />
                )}
                {post.title ? (
                  <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: 30, fontWeight: 800, color: 'var(--text-dark)', marginBottom: 20, lineHeight: 1.3 }}>{post.title}</h1>
                ) : (
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-light)', fontStyle: 'italic', marginBottom: 16 }}>No title yet</div>
                )}
                {post.content ? (
                  <div style={{ maxWidth: 680 }}>
                    <LivePreview html={post.content} />
                  </div>
                ) : (
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-light)', fontStyle: 'italic' }}>Preview of your post content — start writing in the Write tab.</div>
                )}
              </div>
            )}

            {/* SEO TAB */}
            {activeTab === 'seo' && (
              <div>
                <div style={cardStyle}>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 15, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 18 }}>SEO & Meta</div>

                  <label style={labelStyle}>URL Slug</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
                    <span style={{ padding: '10px 12px', background: '#f8fafc', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-light)', borderRight: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>/article/</span>
                    <input
                      value={post.slug}
                      onChange={e => updatePost('slug', e.target.value)}
                      style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 12px', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-dark)' }}
                    />
                  </div>

                  <label style={labelStyle}>Meta Description</label>
                  <textarea
                    value={post.metaDesc}
                    onChange={e => updatePost('metaDesc', e.target.value)}
                    maxLength={200}
                    placeholder="Write a compelling meta description (140–160 characters)..."
                    style={{ ...inputStyle, height: 90, resize: 'vertical', marginBottom: 4 }}
                  />
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: post.metaDesc.length > 160 ? 'var(--brand)' : 'var(--text-light)', textAlign: 'right', marginBottom: 16 }}>
                    {post.metaDesc.length} / 160
                  </div>

                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 14 }}>SEO Checklist</div>
                  {seoChecks.map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontFamily: 'var(--font-ui)', fontSize: 13, color: c.pass ? '#059669' : 'var(--text-mid)' }}>
                      <span style={{ width: 20, height: 20, borderRadius: '50%', background: c.pass ? 'rgba(16,185,129,0.1)' : 'rgba(0,0,0,0.05)', border: `1px solid ${c.pass ? 'rgba(16,185,129,0.3)' : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {c.pass ? <CheckIcon size={11} color="#059669" /> : <span style={{ fontSize: 10, color: '#c5cdd8', fontWeight: 700 }}>✕</span>}
                      </span>
                      {c.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ width: isMobile ? '100%' : 320, flexShrink: 0 }}>
            <div style={{ position: isMobile ? 'static' : 'sticky', top: 28 }}>

              {/* AI Score */}
              <div style={{ ...cardStyle, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 700, color: 'var(--text-dark)' }}>AI Content Score</span>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, background: 'var(--gold)', color: 'var(--midnight)', borderRadius: 4, padding: '2px 7px', letterSpacing: '0.5px' }}>BETA</span>
                </div>
                <ScoreCircle score={aiScore.overall} />
                <ScoreBar label="Title Quality" score={aiScore.title} />
                <ScoreBar label="Readability" score={aiScore.readability} />
                <ScoreBar label="SEO Score" score={aiScore.seo} />
                <div style={{ marginTop: 14, padding: '10px 12px', background: '#f8fafc', borderRadius: 8, fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-mid)', lineHeight: 1.5, borderLeft: '3px solid var(--gold)' }}>
                  {getLowestScoreTip()}
                </div>
              </div>

              {/* Publish Settings */}
              <div style={cardStyle}>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 18 }}>Publish Settings</div>

                <label style={labelStyle}>Category</label>
                <select
                  value={post.categoryId}
                  onChange={e => updatePost('categoryId', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontFamily: 'var(--font-ui)', fontSize: 13, outline: 'none', marginBottom: 16, color: 'var(--text-dark)', background: '#fff' }}
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>

                <label style={labelStyle}>Emirate</label>
                <select
                  value={post.emirate}
                  onChange={e => updatePost('emirate', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontFamily: 'var(--font-ui)', fontSize: 13, outline: 'none', marginBottom: 16, color: 'var(--text-dark)', background: '#fff' }}
                >
                  <option value="">Dubai (main site)</option>
                  {emirates.map(em => (
                    <option key={em.slug} value={em.label}>{em.label}</option>
                  ))}
                </select>

                <label style={labelStyle}>Area / Location</label>
                <select
                  value={post.area}
                  onChange={e => updatePost('area', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontFamily: 'var(--font-ui)', fontSize: 13, outline: 'none', marginBottom: 16, color: 'var(--text-dark)', background: '#fff' }}
                >
                  <option value="">No specific area</option>
                  {DUBAI_AREAS.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>

                <label style={labelStyle}>Status</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  {[
                    { val: 'draft', label: 'Draft', color: '#d97706', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
                    { val: 'published', label: 'Published', color: '#059669', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' }
                  ].map(s => (
                    <div
                      key={s.val}
                      style={{
                        flex: 1, fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, borderRadius: 20, padding: '6px 0', textAlign: 'center', transition: 'all 0.15s',
                        background: post.status === s.val ? s.bg : '#f8fafc',
                        color: post.status === s.val ? s.color : 'var(--text-mid)',
                        border: `1px solid ${post.status === s.val ? s.border : '#e2e8f0'}`
                      }}
                    >{s.label}</div>
                  ))}
                </div>

                {/* Schedule toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, padding: '10px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-mid)' }}>Schedule</span>
                  <div
                    onClick={() => setScheduleOn(p => !p)}
                    style={{ width: 40, height: 22, borderRadius: 11, background: scheduleOn ? 'var(--brand)' : '#e2e8f0', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}
                  >
                    <div style={{ position: 'absolute', top: 3, left: scheduleOn ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </div>
                </div>

                <div style={{ marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-light)', marginBottom: 4 }}>
                    <span>Author</span><span style={{ color: 'var(--text-mid)', fontWeight: 500 }}>{auth.name || 'Publisher'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-light)' }}>
                    <span>Date</span><span style={{ color: 'var(--text-mid)', fontWeight: 500 }}>{displayDate}</span>
                  </div>
                </div>

                {errorMsg && (
                  <div style={{ marginTop: 14, padding: '10px 12px', background: 'rgba(228,61,48,0.07)', border: '1px solid rgba(228,61,48,0.25)', borderRadius: 8, fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--brand)', lineHeight: 1.5 }}>
                    {errorMsg}
                  </div>
                )}

                <div style={{ marginTop: 20 }}>
                  <button
                    onClick={() => persist('draft')}
                    disabled={saving}
                    style={{ width: '100%', background: '#fff', color: 'var(--text-dark)', border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 18px', fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, minHeight: 44, opacity: saving ? 0.7 : 1 }}
                  >
                    <SaveIcon />{saving ? 'Saving...' : saved && !publishSuccess ? 'Saved!' : 'Save Draft'}
                  </button>
                  <button
                    onClick={() => persist('published')}
                    disabled={saving}
                    style={{ width: '100%', background: publishSuccess ? '#10b981' : 'var(--brand)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, minHeight: 44, transition: 'background 0.3s', opacity: saving ? 0.8 : 1 }}
                  >
                    {publishSuccess ? <><CheckIcon size={15} color="#fff" /> Published!</> : saving ? 'Publishing...' : <><SendIcon /> Publish Now</>}
                  </button>
                  {publishSuccess && post.slug && (
                    <a
                      href={`/article/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'block', textAlign: 'center', marginTop: 12, fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--brand)', textDecoration: 'none' }}
                    >
                      View live article →
                    </a>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── SVG ICONS ─────────────────────────────────────────────────────────────────

function BoldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
    </svg>
  )
}

function ItalicIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="4" x2="10" y2="4"/>
      <line x1="14" y1="20" x2="5" y2="20"/>
      <line x1="15" y1="4" x2="9" y2="20"/>
    </svg>
  )
}

function QuoteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
    </svg>
  )
}

function ImageInsertIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  )
}

function CodeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/>
      <polyline points="8 6 2 12 8 18"/>
    </svg>
  )
}

function BackArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/>
      <polyline points="12 19 5 12 12 5"/>
    </svg>
  )
}

function CheckIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function SaveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/>
      <polyline points="7 3 7 8 15 8"/>
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  )
}
