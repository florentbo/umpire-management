import { Button } from '@/components/ui/button';
import { LogOut, Menu, ArrowLeft, Award } from 'lucide-react';
import { authService } from '@/lib/auth';
import { useRouter } from '@tanstack/react-router';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { Navigation } from './Navigation';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  title: string;
  showMenu?: boolean;
  onMenuClick?: () => void;
  showNavigation?: boolean;
  showBackButton?: boolean;
  backButtonText?: string;
  onBackClick?: () => void;
}

export function Header({ 
  title, 
  showMenu, 
  onMenuClick, 
  showNavigation = true,
  showBackButton = false,
  backButtonText = "Retour au Reporting",
  onBackClick
}: HeaderProps) {
  const router = useRouter();
  const user = authService.getCurrentUser();
  const { t } = useTranslation('common');

  const handleLogout = () => {
    authService.logout();
    router.navigate({ to: '/login' });
  };

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.navigate({ to: '/manager/reporting' });
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            {showMenu && (
              <Button variant="ghost" size="sm" onClick={onMenuClick}>
                <Menu className="h-5 w-5" />
              </Button>
            )}
            
            {/* Back Button */}
            {showBackButton && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleBackClick}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{backButtonText}</span>
              </Button>
            )}
            
            <div className="flex items-center space-x-2">
              <Award className="h-6 w-6 text-blue-600" />
              <h1 className="font-bold text-lg text-gray-800 truncate">{title}</h1>
            </div>
          </div>
          
          {showNavigation && user?.role === 'umpire_manager' && (
            <Navigation className="hidden md:flex" />
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <LanguageSwitcher />
          <span className="text-sm text-gray-600 hidden sm:block">{user?.name}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout} title={t('buttons.logout')}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {showNavigation && user?.role === 'umpire_manager' && (
        <div className="md:hidden mt-3 pt-3 border-t border-gray-100">
          <Navigation />
        </div>
      )}
    </header>
  );
}