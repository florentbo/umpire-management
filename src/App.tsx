import { RouterProvider, createRouter } from '@tanstack/react-router';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { routeTree } from './routeTree.gen';
import { ContainerProvider } from '@/infrastructure/di/ContainerContext';

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Removed: Create a client and QueryClientProvider

function App() {
  return (
    <ContainerProvider>
      <RouterProvider router={router} />
      <Toaster />
    </ContainerProvider>
  );
}

export default App;