import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Wallet, History, Settings, LogOut, Zap, Shield, Code } from 'lucide-react';
import { useGlobal } from '../App';

const Layout = () => {
  const { logout, user } = useGlobal();
  const navigate = useNavigate();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { path: '/transactions', icon: History, label: 'Transactions' },
    { path: '/wallet', icon: Wallet, label: 'Crypto Assets' },
    { path: '/cards', icon: CreditCard, label: 'Cards' },
    { path: '/compliance', icon: Shield, label: 'Compliance' }, // New Page
    { path: '/developer', icon: Code, label: 'Developer API' }, // New Page
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex min-h-screen bg-black text-slate-200 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-20 lg:w-72 fixed h-full z-30 border-r border-white/10 bg-black/50 backdrop-blur-xl flex flex-col">
        {/* Logo Area */}
        <div className="h-24 flex items-center justify-center lg:justify-start gap-4 px-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] shrink-0">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div className="hidden lg:block">
            <h2 className="font-bold text-lg text-white tracking-tight">Global<span className="text-blue-500">ATM</span></h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Enterprise Edition</p>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 space-y-1 mt-2">
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden
                ${isActive ? 'text-white bg-white/5 shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/5' : 'text-slate-500 hover:text-white hover:bg-white/5'}
              `}
            >
              <item.icon className={`w-5 h-5 shrink-0 transition-colors ${({isActive}) => isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-white'}`} />
              <span className="hidden lg:block font-medium text-sm z-10 relative">{item.label}</span>
              {/* Glowing Indicator for Active State */}
              {({ isActive }) => isActive && (
                 <div className="absolute left-0 top-0 w-1 h-full bg-blue-500 shadow-[0_0_15px_#3b82f6]"></div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-white/10">
           <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="hidden lg:block font-medium">Log Out</span>
           </button>
        </div>
      </aside>

      {/* CONTENT AREA */}
      <main className="flex-1 ml-20 lg:ml-72 p-6 lg:p-10 relative">
        {/* Background Ambience */}
        <div className="fixed top-0 left-0 w-full h-[800px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
           <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;