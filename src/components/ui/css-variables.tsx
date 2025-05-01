
import { createContext, useContext, useEffect } from 'react';

// Define the default colors and variables
const defaultVariables = {
  primary: '#19C37D',
  primaryHover: '#15a76b',
  primaryActive: '#108a59',
  secondary: '#343541',
  secondaryHover: '#2a2b32',
  danger: '#FF4D4F',
  dangerHover: '#ff3336',
  warning: '#FAAD14',
  warningHover: '#E39C13',
  info: '#1890FF',
  infoHover: '#1683E8',
  success: '#19C37D',
  successHover: '#15a76b',
};

const ThemeVariablesContext = createContext(defaultVariables);

export const useThemeVariables = () => useContext(ThemeVariablesContext);

export function ThemeVariablesProvider({ 
  children, 
  variables = defaultVariables 
}: { 
  children: React.ReactNode, 
  variables?: typeof defaultVariables 
}) {
  useEffect(() => {
    // Set CSS variables on the document root
    const root = document.documentElement;
    
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
    
    return () => {
      // Clean up on unmount
      Object.keys(variables).forEach((key) => {
        root.style.removeProperty(`--${key}`);
      });
    };
  }, [variables]);

  return (
    <ThemeVariablesContext.Provider value={variables}>
      {children}
    </ThemeVariablesContext.Provider>
  );
}
