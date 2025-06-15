import { User } from '@/types';

// User mapping data
let userMappingCache: Map<string, string> | null = null;
let userMappingPromise: Promise<Map<string, string>> | null = null;

async function loadUserMapping(): Promise<Map<string, string>> {
  if (userMappingCache) return userMappingCache;
  if (userMappingPromise) return userMappingPromise;

  userMappingPromise = fetch('/users/users.csv')
    .then(res => res.text())
    .then(text => {
      const mapping = new Map<string, string>();
      const lines = text.split('\n').filter(line => line.trim());
      
      lines.forEach(line => {
        const [id, email] = line.split(';');
        if (id && email) {
          mapping.set(email.trim(), id.trim());
        }
      });
      
      userMappingCache = mapping;
      return mapping;
    })
    .catch(error => {
      console.error('Failed to load user mapping:', error);
      userMappingCache = new Map();
      return userMappingCache;
    });

  return userMappingPromise;
}

export async function getUserIdFromEmail(email: string): Promise<string | null> {
  const mapping = await loadUserMapping();
  return mapping.get(email) || null;
}

export async function createUserWithMapping(email: string, role: 'umpire_manager' | 'umpire'): Promise<User> {
  const userId = await getUserIdFromEmail(email);
  
  if (!userId) {
    throw new Error(`No user ID found for email: ${email}`);
  }

  return {
    id: userId,
    name: email.split('@')[0],
    email: email,
    role,
  };
}