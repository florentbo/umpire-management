import { ReactNode } from 'react';
import { useLocation } from '@tanstack/react-router';
import { Header } from './Header';

interface ManagerLayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  onBackClick?: () => void;
}

export function ManagerLayout({ 
  children, 
  title,
  showBackButton = false,
  backButtonText,
  onBackClick
}: ManagerLayoutProps) {
  const location = useLocation();

  // Use static title "OfficialHub" for all views
  const getPageTitle = () => {
    return title || 'OfficialHub';
  };

  // Determine if we should show navigation based on the route
  const shouldShowNavigation = () => {
    const pathname = location.pathname;
    
    // Show navigation on main manager pages
    if (pathname === '/manager/dashboard' || 
        pathname === '/manager/reporting' || 
        pathname === '/manager/availability') {
      return true;
    }
    
    // Hide navigation on detail pages like assessment
    if (pathname.startsWith('/manager/assessment/')) {
      return false;
    }
    
    return true;
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <Header 
        title={getPageTitle()}
        showNavigation={shouldShowNavigation()}
        showBackButton={showBackButton}
        backButtonText={backButtonText}
        onBackClick={onBackClick}
      />
      <div className="w-full px-4 py-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="w-full max-w-none space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
} 