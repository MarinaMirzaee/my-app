import "./globals.css";

export const metadata = {
  title: "ProjectHub",
  description: "Project management application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
