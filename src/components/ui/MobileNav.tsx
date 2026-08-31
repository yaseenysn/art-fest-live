import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  { name: 'Dash', href: '/admin', icon: LayoutDashboard },
  { name: 'Programs', href: '/admin/programs', icon: Trophy },
  { name: 'Teams', href: '/admin/teams', icon: Users },
  { name: 'Results', href: '/admin/results', icon: Award },
  { name: 'Display', href: '/admin/display', icon: MonitorPlay },
  { name: 'Media', href: '/admin/media', icon: ImageIcon },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-sidebar/90 backdrop-blur-xl border-t border-border-subtle pb-safe">
      <div className="flex items-center justify-between px-2 py-2 overflow-x-auto hide-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex flex-col items-center justify-center min-w-[4.5rem] py-1 transition-colors relative',
                isActive ? 'text-primary-purple' : 'text-text-muted hover:text-text-secondary'
              )}
            >
              {isActive && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary-purple rounded-b-full" />
              )}
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
