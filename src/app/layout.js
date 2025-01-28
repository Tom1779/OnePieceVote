import "./globals.css";
import { AuthProvider } from "../contexts/auth-context";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: "One Piece Character Voting",
  description: "Vote for your favorite One Piece characters",
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>{children}</AuthProvider>
        <SpeedInsights></SpeedInsights>
        <Analytics></Analytics>
      </body>
    </html>
  );
}
