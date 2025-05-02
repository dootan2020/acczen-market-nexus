
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import router from './routes';

function App() {
  return (
    <TooltipProvider delayDuration={0}>
      {/* Pass a single div element as the TooltipProvider child */}
      <div className="app-container">
        <RouterProvider router={router} />
        <Toaster />
      </div>
    </TooltipProvider>
  );
}

export default App;
