import "./globals.css";
import RegisterSW from "./RegisterSW";

export const metadata = { title: "NKAP", manifest: "/manifest.json" };
export const viewport = { themeColor: "#15803d" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}