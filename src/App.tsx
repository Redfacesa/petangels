import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CatalogProvider } from './contexts/CatalogContext';
import AppShell from './components/AppShell';
import WelcomePage from './pages/WelcomePage';
import HomePage from './pages/HomePage';
import DiscoverPage from './pages/DiscoverPage';
import MarketplacePage from './pages/MarketplacePage';
import ProductPage from './pages/ProductPage';
import RescuePage from './pages/RescuePage';
import AnimalPage from './pages/AnimalPage';
import ProfilePage from './pages/ProfilePage';
import PublicProfilePage from './pages/PublicProfilePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import JoinBusinessPage from './pages/JoinBusinessPage';
import JoinRescuePage from './pages/JoinRescuePage';
import CreatePage from './pages/CreatePage';
import CartPage from './pages/CartPage';
import DonatePage from './pages/DonatePage';
import LegalPage from './pages/LegalPage';

export default function App() {
  return (
    <AuthProvider>
      <CatalogProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/marketplace/:id" element={<ProductPage />} />
            <Route path="/rescue" element={<RescuePage />} />
            <Route path="/animals/:id" element={<AnimalPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/u/:handle" element={<PublicProfilePage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/join/business" element={<JoinBusinessPage />} />
            <Route path="/join/rescue" element={<JoinRescuePage />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/donate/:orgId" element={<DonatePage />} />
            <Route path="/legal" element={<LegalPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </CatalogProvider>
    </AuthProvider>
  );
}
