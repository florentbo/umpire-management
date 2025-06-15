import { User } from '@/types';
import { createUserWithMapping } from './user-mapping';
import { supabase } from './supabase';

class AuthService {
  private currentUser: User | null = null;

  async login(email: string, password: string, role: 'umpire_manager' | 'umpire'): Promise<User> {
    try {
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Authentication failed');
      }

      // Create user with mapping and include Supabase user ID
      const user = await createUserWithMapping(email, role);
      user.id = data.user.id; // Set the Supabase user ID
      
      this.currentUser = user;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
    this.currentUser = null;
    localStorage.removeItem('user');
  }

  async getCurrentUser(): Promise<User | null> {
    // First check if we have a cached user
    if (this.currentUser) {
      // Verify the session is still valid
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        return this.currentUser;
      } else {
        // Session expired, clear cached user
        this.currentUser = null;
        localStorage.removeItem('user');
        return null;
      }
    }
    
    // Check localStorage
    const stored = localStorage.getItem('user');
    if (stored) {
      const user = JSON.parse(stored);
      // Verify the session is still valid
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user.id === user.id) {
        this.currentUser = user;
        return user;
      } else {
        // Session expired or user mismatch, clear stored user
        localStorage.removeItem('user');
        return null;
      }
    }

    // Check if there's an active Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      // Try to reconstruct user from session
      // Note: This is a fallback - in a real app you'd want to store user role in the database
      const user: User = {
        id: session.user.id,
        email: session.user.email || '',
        role: 'umpire_manager', // Default role - should be fetched from database
        name: session.user.user_metadata?.name || session.user.email || '',
      };
      this.currentUser = user;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    }

    return null;
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  // Synchronous version for backward compatibility
  getCurrentUserSync(): User | null {
    const stored = localStorage.getItem('user');
    if (stored) {
      return JSON.parse(stored);
    }
    return this.currentUser;
  }

  isAuthenticatedSync(): boolean {
    return this.getCurrentUserSync() !== null;
  }
}

export const authService = new AuthService();