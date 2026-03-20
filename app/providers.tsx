"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes";
import { ImageKitProvider } from "@imagekit/next";
import { HeroUIProvider } from "@heroui/react";

export interface ProviderProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      {...themeProps}
    >
      <ImageKitProvider
        urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ""}
      >
        <HeroUIProvider>{children}</HeroUIProvider>
      </ImageKitProvider>
    </NextThemesProvider>
  );
}
