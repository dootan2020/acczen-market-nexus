
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from 'sonner';
import router from './routes';

function App() {
  // Wrap everything in a Fragment to ensure a single root element
  return (
    <React.Fragment>
      <TooltipProvider>
        <RouterProvider router={router} />
        <Toaster />
      </TooltipProvider>
    </React.Fragment>
  );
}

export default App;
