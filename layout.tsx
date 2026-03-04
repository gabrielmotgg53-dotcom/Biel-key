import "./globals.css";

export const metadata = {
  title: "Admin Dashboard - BielMenu",
  description: "BielMenu Private Key System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
