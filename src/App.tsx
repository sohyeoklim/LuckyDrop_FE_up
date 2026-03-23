import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { MainPage } from '@/components/MainPage';
import { LoginPage } from '@/components/LoginPage';
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
import { AdminPage } from '@/components/AdminPage';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { AuthProvider } from './contexts/AuthContext';


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/draws/:drawId" element={<DrawDetailPage />} />
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
      </BrowserRouter>
    </AuthProvider>
  );
}
