import "./globals.css";

export const metadata = {
  title: "One Piece Character Voting",
  description: "Vote for your favorite One Piece characters",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
