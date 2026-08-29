import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Trophy, 
  Award, 
  MonitorPlay,
  Users,
  Image as ImageIcon
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Programs', href: '/admin/programs', icon: Trophy },
  { name: 'Teams', href: '/admin/teams', icon: Users },
  { name: 'Results Entry', href: '/admin/results', icon: Award },
  { name: 'Display Control', href: '/admin/display', icon: MonitorPlay },
  { name: 'Media Control', href: '/admin/media', icon: ImageIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white tracking-wider">
          MADRASA <span className="text-amber-500">LIVE</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Admin Control</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                isActive 
                  ? 'bg-amber-500 text-white font-medium shadow-md shadow-amber-500/20' 
                  : 'hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-3">
        <Link
          href="/tv"
          target="_blank"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 w-full justify-center"
        >
          <MonitorPlay className="w-5 h-5" />
          <span className="font-semibold">OPEN TV</span>
        </Link>
        
        <button
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
          }}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors w-full justify-center border border-slate-700"
        >
          <span className="font-medium tracking-wide">Logout</span>
        </button>
      </div>
    </aside>
  );
}
