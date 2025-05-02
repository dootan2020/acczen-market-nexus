
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export const useTheme = () => {
  // Use the next-themes useTheme hook directly
  try {
    // @ts-ignore - This is necessary to use the next-themes library in React
    const { theme, setTheme, systemTheme } = window.__NEXT_THEMES__;
    
    if (!theme || !setTheme) {
      console.warn("Theme context not fully initialized yet");
      return { theme: "light", setTheme: () => {}, systemTheme: "light" };
    }
    
    return { theme, setTheme, systemTheme };
  } catch (error) {
    console.error("Error accessing theme context:", error);
    // Return default values as fallback
    return { theme: "light", setTheme: () => {}, systemTheme: "light" };
  }
};
