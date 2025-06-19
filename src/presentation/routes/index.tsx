import { createFileRoute, redirect } from '@tanstack/react-router';
import { authService } from '@/lib/auth';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const user = authService.getCurrentUser();
    if (!user) {
      throw redirect({ to: '/login' });
    }
    
    // Redirect based on role
    if (user.role === 'umpire_manager') {
      throw redirect({ to: '/manager/dashboard' });
    } else {
      throw redirect({ to: '/umpire/dashboard' });
    }
  },
  component: () => null,
});