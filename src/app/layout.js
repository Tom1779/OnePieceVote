import "./globals.css";
import { AuthProvider } from "../contexts/auth-context";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import BrowserDetection from "./components/BrowserDetection";

export const metadata = {
  title: "One Piece Character Voting",
  description: "Vote for your favorite One Piece characters",
  openGraph: {
    title: "One Piece Character Voting",
    description: "Vote for your favorite One Piece characters",
    url: "https://www.onepiecevoting.com/",
    siteName: "One Piece Voting",
    images: [
      {
        url: "https://www.onepiecevoting.com/previews/home.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "One Piece Character Voting",
    description: "Vote for your favorite One Piece characters",
    images: ["https://www.onepiecevoting.com/previews/home.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <BrowserDetection></BrowserDetection>
        <AuthProvider>{children}</AuthProvider>
        <SpeedInsights></SpeedInsights>
        <Analytics></Analytics>
      </body>
    </html>
  );
}
