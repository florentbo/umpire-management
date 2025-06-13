import { Button } from '@/components/ui/button';
import { LogOut, Menu } from 'lucide-react';
import { authService } from '@/lib/auth';
import { useRouter } from '@tanstack/react-router';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  title: string;
  showMenu?: boolean;
  onMenuClick?: () => void;
}

export function Header({ title, showMenu, onMenuClick }: HeaderProps) {
  const router = useRouter();
  const user = authService.getCurrentUser();
  const { t } = useTranslation('common');

  const handleLogout = () => {
    authService.logout();
    router.navigate({ to: '/login' });
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {showMenu && (
          <Button variant="ghost" size="sm" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <h1 className="font-bold text-lg text-gray-800 truncate">{title}</h1>
      </div>
      
      <div className="flex items-center space-x-2">
        <LanguageSwitcher />
        <span className="text-sm text-gray-600 hidden sm:block">{user?.name}</span>
        <Button variant="ghost" size="sm" onClick={handleLogout} title={t('buttons.logout')}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}