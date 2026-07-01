import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    try {
      // URL se token nikalo
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      console.log('Full URL:', window.location.href);
      console.log('Token found:', token ? 'YES' : 'NO');
      console.log('Token value:', token);

      if (token && token.length > 10) {
        localStorage.setItem('token', token);
        setStatus('Login successful! Redirecting...');
        setTimeout(() => navigate('/dashboard'), 500);
      } else {
        setStatus('No token found. Redirecting to home...');
        setTimeout(() => navigate('/'), 1000);
      }
    } catch (err) {
      console.error('Callback error:', err);
      navigate('/');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-gray-400">{status}</p>
      </div>
    </div>
  );
}