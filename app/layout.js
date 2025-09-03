import "./globals.css";
import "../lib/wallet-config";
import { Providers } from "../components/Providers";

export const metadata = {
  title: "DROPS",
  description: "Scan and compare markets from Polymarket and Bet365",
  icons: {
    icon: "/drops_logo.png",
    shortcut: "/drops_logo.png",
    apple: "/drops_logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
