import { User } from '@/types';

// User mapping data
let userMappingCache: Map<string, { id: string; name: string }> | null = null;
let userMappingPromise: Promise<Map<string, { id: string; name: string }>> | null = null;

async function loadUserMapping(): Promise<Map<string, { id: string; name: string }>> {
  if (userMappingCache) return userMappingCache;
  if (userMappingPromise) return userMappingPromise;

  userMappingPromise = fetch('/users/users.csv')
    .then(res => res.text())
    .then(text => {
      const mapping = new Map<string, { id: string; name: string }>();
      const lines = text.split('\n').filter(line => line.trim());
      
      lines.forEach(line => {
        const [id, email, name] = line.split(';');
        if (id && email && name) {
          mapping.set(email.trim(), { 
            id: id.trim(), 
            name: name.trim() 
          });
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
  return mapping.get(email)?.id || null;
}

export async function getUserNameFromEmail(email: string): Promise<string | null> {
  const mapping = await loadUserMapping();
  return mapping.get(email)?.name || null;
}

export async function getUserInfoFromEmail(email: string): Promise<{ id: string; name: string } | null> {
  const mapping = await loadUserMapping();
  return mapping.get(email) || null;
}

export async function createUserWithMapping(email: string, role: 'umpire_manager' | 'umpire'): Promise<User> {
  const userInfo = await getUserInfoFromEmail(email);
  
  if (!userInfo) {
    throw new Error(`No user found for email: ${email}`);
  }

  return {
    id: userInfo.id,
    name: userInfo.name,
    email: email,
    role,
  };
}