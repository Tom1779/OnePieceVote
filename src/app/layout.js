import "./globals.css";
import { AuthProvider } from "../contexts/auth-context";

export const metadata = {
  title: "One Piece Character Voting",
  description: "Vote for your favorite One Piece characters",
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
