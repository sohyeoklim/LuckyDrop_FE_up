import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainPage } from '@/app/components/MainPage';
import { LoginPage } from '@/app/components/LoginPage';
import { SignupPage } from '@/app/components/SignupPage';
import { AuthProvider } from '@/app/contexts/AuthContext';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}