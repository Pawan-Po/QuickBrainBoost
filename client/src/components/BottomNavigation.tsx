import { Link, useLocation } from 'wouter';
import { LayoutDashboard, Package, ShoppingCart, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/inventory', icon: Package, label: 'Inventory' },
    { path: '/pos', icon: ShoppingCart, label: 'POS' },
    { path: '/reports', icon: BarChart3, label: 'Reports' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around py-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location === path;
            
            return (
              <Link key={path} href={path}>
                <a className={cn(
                  "flex flex-col items-center py-2 px-3 rounded-lg transition-colors",
                  isActive
                    ? "text-blue-600"
                    : "text-gray-400 hover:text-gray-600"
                )}>
                  <Icon className="h-5 w-5" />
                  <span className="text-xs mt-1">{label}</span>
                </a>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
