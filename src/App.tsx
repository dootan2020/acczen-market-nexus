
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from 'sonner';
import router from './routes';

function App() {
  return (
    <TooltipProvider>
      <div>
        <RouterProvider router={router} />
        <Toaster />
      </div>
    </TooltipProvider>
  );
}

export default App;
