"use client";

import { WagmiProvider } from "wagmi";
import * as chains from "viem/chains";
import { http } from "viem";
import { env } from "~/env";
import { createConfig } from "wagmi";

const config = createConfig({
  chains: [chains.sepolia],
  transports: {
    [chains.sepolia.id]: http(
      `https://eth-sepolia.g.alchemy.com/v2/${env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    ),
  },
});

export default function WagmiProviderWrapper({
  children,
}: React.PropsWithChildren) {
  return <WagmiProvider config={config}>{children}</WagmiProvider>;
}
