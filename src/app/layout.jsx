import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "ProjectHub",
  description: "Project management application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
