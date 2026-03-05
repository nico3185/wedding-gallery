import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";

const ThemeToggle = dynamic(() => import("@/components/ThemeToggle").then(mod => ({ default: mod.ThemeToggle })), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "Aña & François",
  description: "5 mars 2026 · Elena & Bixente",
};

export const viewport: Viewport = {
  themeColor: "#FAFAF8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <ThemeProvider>
          <ThemeToggle />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
