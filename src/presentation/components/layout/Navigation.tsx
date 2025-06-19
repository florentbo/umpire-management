import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ClipboardList, Calendar, Home } from 'lucide-react';
import { Link, useLocation } from '@tanstack/react-router';

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const location = useLocation();

  const navigationItems = [
    {
      label: 'Dashboard',
      href: '/manager/dashboard',
      icon: Home,
      isActive: location.pathname === '/manager/dashboard'
    },
    {
      label: 'Reporting',
      href: '/manager/reporting',
      icon: ClipboardList,
      isActive: location.pathname.startsWith('/manager/reporting')
    },
    {
      label: 'Availability',
      href: '/manager/availability',
      icon: Calendar,
      isActive: location.pathname.startsWith('/manager/availability')
    }
  ];

  return (
    <nav className={cn("flex items-center space-x-1", className)}>
      {navigationItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.href} to={item.href}>
            <Button
              variant={item.isActive ? "default" : "ghost"}
              size="sm"
              className={cn(
                "flex items-center space-x-2 transition-colors",
                item.isActive 
                  ? "bg-blue-600 text-white hover:bg-blue-700" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}