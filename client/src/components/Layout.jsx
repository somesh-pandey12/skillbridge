import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import SomuChat from './SomuChat';
import api from '../lib/api';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
    api.get('/auth/me')
      .then(res => setUser(res.data))
      .catch(() => { localStorage.removeItem('token'); navigate('/'); });
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-violet-600 opacity-8 rounded-full blur-[120px]"/>
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-blue-600 opacity-8 rounded-full blur-[120px]"/>
      </div>

      <Sidebar user={user} />

      {/* Main content */}
      <main className="flex-1 ml-64 min-h-screen relative z-10">
        {children}
      </main>

      <SomuChat />
    </div>
  );
}