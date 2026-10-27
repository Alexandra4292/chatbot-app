import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tria · Tripodi värbamisassistent",
  description: "Tripodi värbamisassistent Tria vastab kandidaatide küsimustele.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="et">
      <body className="flex h-dvh flex-col">
        <div className="min-h-0 flex-1">{children}</div>
        <footer className="shrink-0 border-t bg-sidebar px-4 py-2 text-center text-xs text-muted-foreground">
          © 2026 Tripod. Built with Claude Code
        </footer>
      </body>
    </html>
  );
}
