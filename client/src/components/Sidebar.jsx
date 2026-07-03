import { NavLink, useNavigate } from 'react-router-dom';

const links = [
  { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/jobs', icon: '💼', label: 'Job Matches' },
  { path: '/interview', icon: '🎯', label: 'Interview Prep' },
  { path: '/progress', icon: '📈', label: 'Progress' },
  { path: '/cover-letter', icon: '✉️', label: 'Cover Letter' },
  { path: '/company/google', icon: '🏢', label: 'Companies' },
];

export default function Sidebar({ user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0d0d18] border-r border-white/8 flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
            <span className="text-white font-bold text-sm">CL</span>
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
            CareerLens AI
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(link => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                isActive
                  ? 'bg-violet-500/15 text-violet-400 border border-violet-500/20'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`
            }
          >
            <span className="text-lg">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/8">
        <div className="flex items-center gap-3 mb-3">
          {user?.avatar ? (
            <img src={user.avatar} className="w-8 h-8 rounded-full ring-2 ring-violet-500/30" />
          ) : (
            <div className="w-8 h-8 bg-violet-500/20 rounded-full flex items-center justify-center text-violet-400 font-bold text-sm">
              {user?.name?.[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-600 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left text-xs text-gray-600 hover:text-red-400 transition px-2 py-1.5 rounded-lg hover:bg-red-500/10"
        >
          → Logout
        </button>
      </div>
    </aside>
  );
}