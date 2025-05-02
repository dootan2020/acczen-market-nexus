
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import router from './routes';

function App() {
  return (
    // TooltipProvider requires exactly one child element
    <TooltipProvider delayDuration={0}>
      {/* Wrap the application in a single React Fragment */}
      <>
        <RouterProvider router={router} />
        <Toaster />
      </>
    </TooltipProvider>
  );
}

export default App;
