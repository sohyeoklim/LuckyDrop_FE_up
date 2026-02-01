import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainPage } from '@/app/components/MainPage';
import { LoginPage } from '@/app/components/LoginPage';
import { SignupPage } from '@/app/components/SignupPage';
import { DrawDetailPage } from '@/app/components/DrawDetailPage';
import { MyPage } from '@/app/components/MyPage';
import { MissionsPage } from '@/app/components/MissionsPage';
import { MyEntriesPage } from '@/app/components/MyEntriesPage';
import { MyLikedPage } from '@/app/components/MyLikedPage';
import { MyTicketsPage } from '@/app/components/MyTicketsPage';
import { DrawsListPage } from '@/app/components/DrawsListPage';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  return (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/draw/:id" element={<DrawDetailPage />} />
        <Route path="/draws" element={<DrawsListPage />} />
        <Route path="/my" element={<MyPage />} />
        <Route path="/my/entries" element={<MyEntriesPage />} />
        <Route path="/my/liked" element={<MyLikedPage />} />
        <Route path="/my/tickets" element={<MyTicketsPage />} />
        <Route path="/missions" element={<MissionsPage />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
  );
}