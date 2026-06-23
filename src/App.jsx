import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
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
import { getPublishedArticles, getCategoryIdBySlug } from './lib/supabase';
import { normalizeArticles } from './lib/normalize';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import CategoryPage from './pages/CategoryPage';
import EmiratePage from './pages/EmiratePage';
import OtherEmiratesPage from './pages/OtherEmiratesPage';
import PrayerTimesPage from './pages/PrayerTimesPage';
import CurrencyPage from './pages/CurrencyPage';
import ArticlePage from './pages/ArticlePage';
import AboutPage from './pages/AboutPage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import PressPage from './pages/PressPage';
import ReportComplaintPage from './pages/ReportComplaintPage';
import TermsPage from './pages/TermsPage';
import WorkWithUsPage from './pages/WorkWithUsPage';
import AdvertiseWithUsPage from './pages/AdvertiseWithUsPage';
import PlanTripPage from './pages/PlanTripPage';
import LoginPage from './pages/LoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPublishers from './pages/admin/AdminPublishers';
import AdminPosts from './pages/admin/AdminPosts';
import AdminAdvertisers from './pages/admin/AdminAdvertisers';
import PublisherLayout from './pages/publisher/PublisherLayout';
import PublisherHome from './pages/publisher/PublisherHome';
import PublisherPosts from './pages/publisher/PublisherPosts';
import ComposePage from './pages/publisher/ComposePage';
import ProfilePage from './pages/publisher/ProfilePage';
import PublisherAdvertisers from './pages/publisher/PublisherAdvertisers';
import './App.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function HomePage() {
  const [latest, setLatest]           = useState([]);
  const [stay, setStay]               = useState([]);
  const [food, setFood]               = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [insights, setInsights]       = useState([]);

  useEffect(() => {
    const load = async (slug, setter) => {
      const catId = slug ? await getCategoryIdBySlug(slug) : null;
      const { data } = await getPublishedArticles({ categoryId: catId, limit: 6 });
      setter(normalizeArticles(data));
    };
    load(null,          setLatest);       // newest across all categories
    load('stay',        setStay);
    load('eat-drink',   setFood);
    load('experiences', setExperiences);
    load('travel',      setInsights);
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
    </BrowserRouter>
  );
}
