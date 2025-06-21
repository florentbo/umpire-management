import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { Link } from '@tanstack/react-router';

interface NavigationButtonProps {
  label: string;
  href: string;
  icon: LucideIcon;
  isActive: boolean;
  className?: string;
}

export function NavigationButton({ 
  label, 
  href, 
  icon: Icon, 
  isActive, 
  className 
}: NavigationButtonProps) {
  return (
    <Link to={href}>
      <Button
        variant={isActive ? "default" : "ghost"}
        size="lg"
        className={cn(
          "flex items-center space-x-3 transition-colors px-6 py-3 h-12",
          isActive 
            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md" 
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200",
          className
        )}
      >
        <Icon className="h-5 w-5" />
        <span className="font-medium">{label}</span>
      </Button>
    </Link>
  );
} 