import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AuthCallback from './pages/AuthCallback';
import Jobs from './pages/Jobs';
import Interview from './pages/Interview';
import Progress from './pages/Progress';
import CoverLetter from './pages/CoverLetter';
import Company from './pages/Company';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/cover-letter" element={<CoverLetter />} />
        <Route path="/company/:name" element={<Company />} />
      </Routes>
    </BrowserRouter>
  );
}