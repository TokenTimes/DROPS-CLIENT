"use client";

import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mainnet, arbitrum, polygon } from "@reown/appkit/networks";

// 1. Get projectId from https://cloud.reown.com
const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  "737aa0f223832ad056c6a74e4644d9a2";

// 2. Set up Wagmi adapter
const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet, arbitrum, polygon],
  projectId,
});

// 3. Configure the metadata
const metadata = {
  name: "DROPS",
  description: "Scan and compare markets from Polymarket and Bet365",
  url: "https://polymarket-scanner.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

// 4. Create AppKit instance
const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet, arbitrum, polygon],
  projectId,
  metadata,
  features: {
    analytics: true,
    email: false,
    socials: false,
    emailShowWallets: false,
    onramp: false,
    swaps: false,
  },
  themeMode: "dark",
  themeVariables: {
    "--w3m-color-mix": "#00D4AA",
    "--w3m-color-mix-strength": 20,
    "--w3m-z-index": "999999",
    "--w3m-accent": "#007bff",
    "--w3m-background-color": "#1a1a1a",
    "--w3m-foreground-color": "#2a2a2a",
  },
});

export { wagmiAdapter, modal };
