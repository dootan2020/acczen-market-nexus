
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import router from './routes';

function App() {
  return (
    <React.StrictMode>
      <TooltipProvider delayDuration={0}>
        <div className="app-container">
          <RouterProvider router={router} />
        </div>
      </TooltipProvider>
      <Toaster />
    </React.StrictMode>
  );
}

export default App;
