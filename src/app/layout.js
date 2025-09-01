import "./globals.css";
import { AuthProvider } from "../contexts/auth-context";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: "One Piece Character Voting",
  description: "Vote for your favorite One Piece characters",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/favicon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    other: [
      {
        url: "/favicon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  },
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
      <head>
        <script async src='https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}'></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-NEMVW3V3Z1');
</script>
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
        <SpeedInsights></SpeedInsights>
        <Analytics></Analytics>
      </body>
    </html>
  );
}
