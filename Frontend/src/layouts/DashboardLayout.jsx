import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  Wallet, 
  LogOut, 
  Menu,
  X,
  Sun,
  Moon,
  Bell
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getFullUrl } from '../utils/url';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Tasks', icon: CheckSquare, path: '/dashboard/tasks' },
  { label: 'Budget', icon: Wallet, path: '/dashboard/budget' },
  { label: 'Users', icon: Users, path: '/dashboard/users' },
];

const DashboardLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg-main)] text-[var(--color-text-main)] transition-colors duration-300">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-[var(--color-bg-surface)] border-r border-[var(--color-border-subtle)] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between h-16 w-full px-6 border-b border-[var(--color-border-subtle)]">
          <span className="text-2xl font-black bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
            MTMS
          </span>
          <button onClick={toggleSidebar} className="lg:hidden text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {NAV_ITEMS.filter(item => {
            if (item.path === '/dashboard/users') return user?.role === 'emperor';
            if (item.path === '/dashboard/budget') return ['admin', 'emperor'].includes(user?.role);
            return true;
          }).map((item) => (
             <NavLink
             key={item.path}
             to={item.path}
             end={item.path === '/dashboard'} // exact match for base path
             className={({ isActive }) => 
               `flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                 isActive 
                   ? 'bg-[var(--color-primary)] text-white shadow-md' 
                   : 'text-[var(--color-text-muted)] hover:bg-[var(--color-border-subtle)] hover:text-[var(--color-text-main)]'
               }`
             }
           >
             <item.icon size={20} className="mr-3" />
             <span className="font-medium">{item.label}</span>
           </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[var(--color-border-subtle)]">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content wrapper */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-[var(--color-bg-surface)] border-b border-[var(--color-border-subtle)] z-10 shrink-0 shadow-sm">
          <div className="flex items-center">
            <button onClick={toggleSidebar} className="lg:hidden mr-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors">
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-[var(--color-text-main)] hidden sm:block">
              {/* Could be dynamically set based on route */}
              Dashboard
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            
            {/* Notifications */}
            <button className="p-2 rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-border-subtle)] hover:text-[var(--color-text-main)] transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[var(--color-bg-surface)]"></span>
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full bg-[var(--color-bg-main)] border border-[var(--color-border-subtle)] text-[var(--color-text-main)] hover:bg-[var(--color-border-subtle)] transition-all duration-300"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* User Avatar Placeholder */}
            <div className="flex items-center pl-2 ml-2 border-l border-[var(--color-border-subtle)] cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-[var(--color-bg-surface)] uppercase overflow-hidden">
                {user?.photo ? (
                  <img src={getFullUrl(user.photo)} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  user?.username ? user.username.charAt(0) : 'U'
                )}
              </div>
              <div className="ml-3 hidden md:block">
                <p className="text-sm font-semibold text-[var(--color-text-main)] w-max max-w-[150px] truncate">{user?.username || 'User'}</p>
                <p className="text-xs text-[var(--color-text-muted)] capitalize">{user?.role || 'Guest'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
