import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { MainPage } from '@/components/MainPage';
import { LoginPage } from '@/components/LoginPage';
import { GoogleOnboardingPage } from '@/components/GoogleOnboardingPage';
import { SignupPage } from '@/components/SignupPage';
import { ForgotPasswordPage } from '@/components/ForgotPasswordPage';
import { DrawDetailPage } from '@/components/draw/DrawDetailPage';
import { MyPage } from '@/components/MyPage';
import { EditProfile } from '@/components/EditProfile';
import { MissionsPage } from '@/components/MissionsPage';
import { MyEntriesPage } from '@/components/MyEntriesPage';
import { MyLikedPage } from '@/components/MyLikedPage';
import { MyTicketsPage } from '@/components/MyTicketsPage';
import { DrawsListPage } from '@/components/draw/DrawsListPage';
import { CreateDrawPage } from '@/components/draw/CreateDrawPage';
import { EditDrawPage } from '@/components/draw/EditDrawPage';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { AuthProvider } from './contexts/AuthContext';
import { LoginRequiredProvider } from '@/components/providers/LoginRequiredProvider';
import AdminPage from './components/AdminPage';
import { useDrawStatusEvents } from '@/hooks/useDrawStatusEvents';
import { useNotificationEvents } from '@/hooks/useNotificationEvents';
import { useAuth } from '@/contexts/AuthContext';
import { useLoginRequired } from '@/components/providers/LoginRequiredProvider';

function RealtimeDrawSync() {
  useDrawStatusEvents();
  useNotificationEvents();
  return null;
}

function ProtectedDrawDetail() {
  const { isAuthenticated, isLoading } = useAuth();
  const { requireLogin } = useLoginRequired();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      requireLogin(`${location.pathname}${location.search}`);
    }
  }, [isAuthenticated, isLoading, location.pathname, location.search, requireLogin]);

  if (isLoading || !isAuthenticated) return null;

  return <DrawDetailPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <LoginRequiredProvider>
          <RealtimeDrawSync />
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
                fontSize: '14px',
              },
              success: {
                duration: 2500,
                style: {
                  background: '#10b981',
                },
              },
              error: {
                duration: 4000,
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/onboarding" element={<GoogleOnboardingPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/draws/:drawId" element={<ProtectedDrawDetail />} />
            <Route path="/draws" element={<DrawsListPage />} />
            <Route path="/draws/create" element={<CreateDrawPage />} />
            <Route path="/draws/:drawId/edit" element={<EditDrawPage />} />
            <Route path="/my" element={<MyPage />} />
            <Route path="/my/edit" element={<EditProfile />} />
            <Route path="/my/entries" element={<MyEntriesPage />} />
            <Route path="/my/liked" element={<MyLikedPage />} />
            <Route path="/my/tickets" element={<MyTicketsPage />} />
            <Route path="/missions" element={<MissionsPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </LoginRequiredProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
