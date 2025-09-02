import "./globals.css";
import "../lib/wallet-config";
import { Providers } from "../components/Providers";

export const metadata = {
  title: "Polymarket Scanner",
  description: "Scan and compare markets from Polymarket and Bet365",
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
