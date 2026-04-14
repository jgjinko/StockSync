import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";

// Use ComponentProps instead of importing from dist/types
type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

export function ModeThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
