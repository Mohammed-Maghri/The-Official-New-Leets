import type { Metadata } from "next";
import "./globals.css";
import { Layout } from "@/component/layout/layout";
import { ContextProvider } from "@/component/context/context";
import { ThemeProvider } from "@/component/context/ThemeContext";
import GlobalFeedbackButton from "@/component/feedback/GlobalFeedbackButton";

export const metadata: Metadata = {
  title: "1337Leets",
  description:
    "Check your progress, find peers, and use various tools to enhance your 1337Leets experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-screen overflow-hidden" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var s = localStorage.getItem('1337leets-theme');
                  if (s) {
                    var t = JSON.parse(s);
                    document.documentElement.setAttribute('data-theme-color', t.themeColor || 'rose');
                    document.documentElement.setAttribute('data-theme-mode', t.themeMode || 'dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        style={{ scrollbarColor: "rgba(255, 255, 255, 0.1) transparent" }}
        className="relative flex w-full h-full bg-gradient-to-bl from-black via-gray-950 to-black overflow-hidden"
      >
        <ContextProvider>
          <ThemeProvider>
            <Layout>{children}</Layout>
            <GlobalFeedbackButton />
          </ThemeProvider>
        </ContextProvider>
      </body>
    </html>
  );
}
