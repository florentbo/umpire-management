import { cn } from '@/lib/utils';
import { ClipboardList, Calendar, Home } from 'lucide-react';
import { useLocation } from '@tanstack/react-router';
import { NavigationButton } from './NavigationButton';

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
    <nav className={cn("flex items-center space-x-3", className)}>
      {navigationItems.map((item) => (
        <NavigationButton
          key={item.href}
          label={item.label}
          href={item.href}
          icon={item.icon}
          isActive={item.isActive}
        />
      ))}
    </nav>
  );
}