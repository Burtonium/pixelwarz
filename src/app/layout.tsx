import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { TRPCReactProvider } from "~/trpc/react";
import WagmiProvider from "~/providers/wagmi";

export default function RootLayout({
  children,
  session,
}: Readonly<{ children: React.ReactNode; session: Session }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <WagmiProvider>
            <SessionProvider session={session} refetchInterval={0}>
              {children}
            </SessionProvider>
          </WagmiProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
