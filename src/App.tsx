import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CatalogProvider } from './contexts/CatalogContext';
import AppShell from './components/AppShell';
import RequireAuth from './components/RequireAuth';
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
import CarePage from './pages/CarePage';
import ShelterMapPage from './pages/ShelterMapPage';
import JournalPage from './pages/JournalPage';
import ArticlePage from './pages/ArticlePage';
import PetPage from './pages/PetPage';
import AdminPage from './pages/AdminPage';
import InboxPage from './pages/InboxPage';
import { isMarketingHost } from './lib/hosts';

function Gate({ children }: { children: ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}

function RootIndex() {
  if (isMarketingHost()) return <WelcomePage />;
  return <Navigate to="/home" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <CatalogProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<RootIndex />} />
            <Route path="/welcome" element={<WelcomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/legal" element={<LegalPage />} />

            <Route path="/home" element={<Gate><HomePage /></Gate>} />
            <Route path="/discover" element={<Gate><DiscoverPage /></Gate>} />
            <Route path="/marketplace" element={<Gate><MarketplacePage /></Gate>} />
            <Route path="/marketplace/:id" element={<Gate><ProductPage /></Gate>} />
            <Route path="/care" element={<Gate><CarePage /></Gate>} />
            <Route path="/map" element={<ShelterMapPage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/journal/:id" element={<ArticlePage />} />
            <Route path="/rescue" element={<Gate><RescuePage /></Gate>} />
            <Route path="/animals/:id" element={<Gate><AnimalPage /></Gate>} />
            <Route path="/pets/:id" element={<Gate><PetPage /></Gate>} />
            <Route path="/inbox" element={<Gate><InboxPage /></Gate>} />
            <Route path="/admin" element={<Gate><AdminPage /></Gate>} />
            <Route path="/profile" element={<Gate><ProfilePage /></Gate>} />
            <Route path="/u/:handle" element={<Gate><PublicProfilePage /></Gate>} />
            <Route path="/join/business" element={<Gate><JoinBusinessPage /></Gate>} />
            <Route path="/join/rescue" element={<Gate><JoinRescuePage /></Gate>} />
            <Route path="/create" element={<Gate><CreatePage /></Gate>} />
            <Route path="/cart" element={<Gate><CartPage /></Gate>} />
            <Route path="/donate/:orgId" element={<Gate><DonatePage /></Gate>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </CatalogProvider>
    </AuthProvider>
  );
}
