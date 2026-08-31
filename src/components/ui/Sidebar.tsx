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

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-sidebar border-r border-border-card min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-purple to-primary-pink tracking-tight">
          MADRASA LIVE
        </h1>
        <p className="text-xs text-text-muted mt-1 uppercase tracking-widest font-semibold">Admin Control</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors relative',
                isActive 
                  ? 'bg-card text-white' 
                  : 'text-text-secondary hover:bg-card-secondary hover:text-white'
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-purple rounded-r-full" />
              )}
              <item.icon className={clsx("w-5 h-5", isActive ? "text-primary-purple" : "text-text-muted")} />
              <span className={clsx("font-medium", isActive && "text-white")}>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border-card space-y-3">
        <Link
          href="/tv"
          target="_blank"
          className="flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-lg bg-gradient-to-r from-primary-purple to-primary-indigo text-white font-bold tracking-wide shadow-lg shadow-primary-purple/20 hover:shadow-primary-purple/40 transition-all"
        >
          <MonitorPlay className="w-5 h-5" />
          <span>OPEN TV</span>
        </Link>
        
        <button
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
          }}
          className="flex items-center justify-center w-full px-4 py-3 rounded-lg bg-card border border-border-card text-text-secondary hover:text-white hover:bg-row transition-colors"
        >
          <span className="font-medium tracking-wide">Logout</span>
        </button>
      </div>
    </aside>
  );
}
