import type { Metadata } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans, Space_Mono } from "next/font/google";
import { ThemeProvider } from "@/shared/components/shell/theme-provider";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ruang Pintar",
  description: "School Digital Operating Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${jakarta.variable} ${spaceMono.variable}`}
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function() {
              try {
                var theme = localStorage.getItem('rp-theme') || 'auto';
                var isDark = false;
                if (theme === 'dark') {
                  isDark = true;
                } else if (theme === 'light') {
                  isDark = false;
                } else {
                  var hour = new Date().getHours();
                  isDark = hour >= 18 || hour < 6;
                }
                if (isDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            })();
          `}
        </Script>
      </head>
      <body className="bg-slate-50 text-slate-900 dark:bg-[#090D16] dark:text-slate-100 min-h-screen font-sans antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
