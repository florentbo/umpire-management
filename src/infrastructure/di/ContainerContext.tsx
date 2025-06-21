import React, { createContext, useContext, useMemo } from 'react';
import { DIContainer } from './Container';
import { supabase } from '@/lib/supabase';

const ContainerContext = createContext<DIContainer | null>(null);

export const ContainerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const container = useMemo(() => {
    return new DIContainer({ useSupabase: true, supabaseClient: supabase });
  }, []);

  return (
    <ContainerContext.Provider value={container}>
      {children}
    </ContainerContext.Provider>
  );
};

export const useContainer = (): DIContainer => {
  const container = useContext(ContainerContext);
  if (!container) {
    throw new Error('useContainer must be used within a ContainerProvider');
  }
  return container;
}; 