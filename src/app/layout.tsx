import type { Metadata } from "next";
import { ThemeProvider } from "@/shared/components/shell/theme-provider";
import "./globals.css";

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
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
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
            `,
          }}
        />
      </head>
      <body className="bg-slate-50 text-slate-900 dark:bg-[#090D16] dark:text-slate-100 min-h-screen">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
