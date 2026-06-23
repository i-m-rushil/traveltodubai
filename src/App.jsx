import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
// Eager: layout chrome + homepage sections (the landing experience — keep on the critical path)
import TopBar from './components/TopBar';
import Header from './components/Header';
import HeroSlider from './components/HeroSlider';
import BreakingNews from './components/BreakingNews';
import FeaturedGridSection from './components/FeaturedGridSection';
import RecentSection from './components/RecentSection';
import PlanTripPromo from './components/PlanTripPromo';
import OtherEmiratesSection from './components/OtherEmiratesSection';
import AdBanner from './components/AdBanner';
import NewsletterPopup from './components/NewsletterPopup';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import { getPublishedArticles, getAllCategories } from './lib/supabase';
import { normalizeArticles } from './lib/normalize';
import './App.css';

// Lazy: every routed page is split into its own chunk and fetched on demand.
// This keeps the heavy admin/publisher portals out of the public bundle.
const CategoryPage        = lazy(() => import('./pages/CategoryPage'));
const EmiratePage         = lazy(() => import('./pages/EmiratePage'));
const OtherEmiratesPage   = lazy(() => import('./pages/OtherEmiratesPage'));
const PrayerTimesPage     = lazy(() => import('./pages/PrayerTimesPage'));
const CurrencyPage        = lazy(() => import('./pages/CurrencyPage'));
const ArticlePage         = lazy(() => import('./pages/ArticlePage'));
const AboutPage           = lazy(() => import('./pages/AboutPage'));
const FAQPage             = lazy(() => import('./pages/FAQPage'));
const ContactPage         = lazy(() => import('./pages/ContactPage'));
const PrivacyPolicyPage   = lazy(() => import('./pages/PrivacyPolicyPage'));
const PressPage           = lazy(() => import('./pages/PressPage'));
const ReportComplaintPage = lazy(() => import('./pages/ReportComplaintPage'));
const TermsPage           = lazy(() => import('./pages/TermsPage'));
const WorkWithUsPage      = lazy(() => import('./pages/WorkWithUsPage'));
const AdvertiseWithUsPage = lazy(() => import('./pages/AdvertiseWithUsPage'));
const PlanTripPage        = lazy(() => import('./pages/PlanTripPage'));
const LoginPage           = lazy(() => import('./pages/LoginPage'));
const AdminLayout         = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard      = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminPublishers     = lazy(() => import('./pages/admin/AdminPublishers'));
const AdminPosts          = lazy(() => import('./pages/admin/AdminPosts'));
const AdminAdvertisers    = lazy(() => import('./pages/admin/AdminAdvertisers'));
const PublisherLayout     = lazy(() => import('./pages/publisher/PublisherLayout'));
const PublisherHome       = lazy(() => import('./pages/publisher/PublisherHome'));
const PublisherPosts      = lazy(() => import('./pages/publisher/PublisherPosts'));
const ComposePage         = lazy(() => import('./pages/publisher/ComposePage'));
const ProfilePage         = lazy(() => import('./pages/publisher/ProfilePage'));
const PublisherAdvertisers = lazy(() => import('./pages/publisher/PublisherAdvertisers'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function RouteFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%',
        border: '3px solid var(--border, #e5e5e5)', borderTopColor: 'var(--brand, #e43d30)',
        animation: 'ttd-spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes ttd-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function HomePage() {
  const [latest, setLatest]           = useState([]);
  const [stay, setStay]               = useState([]);
  const [food, setFood]               = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [insights, setInsights]       = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      // One round-trip for the slug→id map, then all section queries fire in parallel
      // (previously each section did its own category lookup before fetching).
      const { data: cats } = await getAllCategories();
      const idBySlug = new Map((cats || []).map(c => [c.slug, c.id]));
      const fetchSection = (slug) =>
        getPublishedArticles({ categoryId: slug ? idBySlug.get(slug) ?? null : null, limit: 6 });

      const [latestR, stayR, foodR, expR, insightsR] = await Promise.all([
        fetchSection(null), fetchSection('stay'), fetchSection('eat-drink'),
        fetchSection('experiences'), fetchSection('travel'),
      ]);
      if (!active) return;
      setLatest(normalizeArticles(latestR.data));
      setStay(normalizeArticles(stayR.data));
      setFood(normalizeArticles(foodR.data));
      setExperiences(normalizeArticles(expR.data));
      setInsights(normalizeArticles(insightsR.data));
    })();
    return () => { active = false; };
  }, []);

  return (
    <>
      <HeroSlider />
      <BreakingNews />
      <FeaturedGridSection />
      {/* 1. Latest */}
      <RecentSection title="Latest"          articles={latest}      viewAllLink="/category/all"         categorySlug="all" />
      <AdBanner />
      {/* 2. Plan your trip */}
      <PlanTripPromo />
      {/* 3. Stay */}
      <RecentSection title="Stay"            articles={stay}        viewAllLink="/category/stay"        categorySlug="stay" />
      <AdBanner />
      {/* 4. Food & Drink */}
      <RecentSection title="Food & Drink"    articles={food}        viewAllLink="/category/eat-drink"   categorySlug="eat-drink" />
      <AdBanner />
      {/* 5. Things to do */}
      <RecentSection title="Things to do"    articles={experiences} viewAllLink="/category/experiences" categorySlug="experiences" />
      <AdBanner />
      {/* 6. Insights */}
      <RecentSection title="Insights"        articles={insights}    viewAllLink="/category/travel"      categorySlug="travel" />
      <AdBanner />
      {/* 7. Other Emirates */}
      <OtherEmiratesSection />
      <AdBanner />
    </>
  );
}

function SiteLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopBar />
      <Header />
      <main>
        <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/"                  element={<HomePage />} />
          <Route path="/category/:slug"    element={<CategoryPage />} />
          <Route path="/other-emirates"    element={<OtherEmiratesPage />} />
          <Route path="/emirate/:slug"     element={<EmiratePage />} />
          <Route path="/prayer-times"      element={<PrayerTimesPage />} />
          <Route path="/currency"          element={<CurrencyPage />} />
          <Route path="/article/:slug"     element={<ArticlePage />} />
          <Route path="/about"             element={<AboutPage />} />
          <Route path="/faq"               element={<FAQPage />} />
          <Route path="/contact"           element={<ContactPage />} />
          <Route path="/privacy-policy"    element={<PrivacyPolicyPage />} />
          <Route path="/press"             element={<PressPage />} />
          <Route path="/report-complaint"  element={<ReportComplaintPage />} />
          <Route path="/terms"             element={<TermsPage />} />
          <Route path="/work-with-us"      element={<WorkWithUsPage />} />
          <Route path="/advertise"         element={<AdvertiseWithUsPage />} />
          <Route path="/plan-trip"         element={<PlanTripPage />} />
          <Route path="*"                  element={<HomePage />} />
        </Routes>
        </Suspense>
      </main>
      <Footer />
      <CookieBanner />
      <NewsletterPopup />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="publishers" element={<AdminPublishers />} />
          <Route path="posts" element={<AdminPosts />} />
          <Route path="advertisers" element={<AdminAdvertisers />} />
        </Route>
        <Route path="/dashboard" element={<PublisherLayout />}>
          <Route index element={<PublisherHome />} />
          <Route path="posts" element={<PublisherPosts />} />
          <Route path="compose" element={<ComposePage />} />
          <Route path="compose/:id" element={<ComposePage />} />
          <Route path="advertisers" element={<PublisherAdvertisers />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        <Route path="/*" element={<SiteLayout />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
