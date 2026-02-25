import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { MainPage } from '@/app/components/MainPage';
import { LoginPage } from '@/app/components/LoginPage';
import { SignupPage } from '@/app/components/SignupPage';
import { ForgotPasswordPage } from '@/app/components/ForgotPasswordPage';
import { DrawDetailPage } from '@/app/components/DrawDetailPage';
import { MyPage } from '@/app/components/MyPage';
import { EditProfile } from '@/app/components/EditProfile';
import { MissionsPage } from '@/app/components/MissionsPage';
import { MyEntriesPage } from '@/app/components/MyEntriesPage';
import { MyLikedPage } from '@/app/components/MyLikedPage';
import { MyTicketsPage } from '@/app/components/MyTicketsPage';
import { DrawsListPage } from '@/app/components/DrawsListPage';
import { CreateDrawPage } from '@/app/components/CreateDrawPage';
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
          <Route path="/draw/:id" element={<DrawDetailPage />} />
          <Route path="/draws" element={<DrawsListPage />} />
          <Route path="/draws/create" element={<CreateDrawPage />} />
          <Route path="/my" element={<MyPage />} />
          <Route path="/my/edit" element={<EditProfile />} />
          <Route path="/my/entries" element={<MyEntriesPage />} />
          <Route path="/my/liked" element={<MyLikedPage />} />
          <Route path="/my/tickets" element={<MyTicketsPage />} />
          <Route path="/missions" element={<MissionsPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
