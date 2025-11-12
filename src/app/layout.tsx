import type { Metadata } from "next";
import "./globals.css";
import { Layout } from "@/component/layout/layout";
import { ContextProvider } from "@/component/context/context";
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
    <html lang="en" className="h-screen">
      <body
        style={{ scrollbarColor: "rgba(255, 255, 255, 0.1) transparent" }}
        className=" relative flex w-full h-full bg-gradient-to-bl from-gray-900 to-black"
      >
        <ContextProvider>
          <Layout>{children}</Layout>
          <GlobalFeedbackButton />
        </ContextProvider>
      </body>
    </html>
  );
}
