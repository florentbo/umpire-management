import { User } from '@/types';
import { createUserWithMapping } from './user-mapping';

class AuthService {
  private currentUser: User | null = null;

  async login(email: string, _password: string, role: 'umpire_manager' | 'umpire'): Promise<User> {
    // Simulate API call
    return new Promise(async (resolve, reject) => {
      setTimeout(async () => {
        try {
          const user = await createUserWithMapping(email, role);
          this.currentUser = user;
          localStorage.setItem('user', JSON.stringify(user));
          resolve(user);
        } catch (error) {
          reject(error);
        }
      }, 1000);
    });
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    if (this.currentUser) return this.currentUser;
    
    const stored = localStorage.getItem('user');
    if (stored) {
      this.currentUser = JSON.parse(stored);
    }
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}

export const authService = new AuthService();