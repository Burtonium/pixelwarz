"use client";

import { getCsrfToken, signIn, useSession } from "next-auth/react";
import { SiweMessage } from "siwe";
import {
  useAccount,
  useConnect,
  useConfig,
  useSignMessage,
  injected,
} from "wagmi";
import { useCallback } from "react";

function Home() {
  const { signMessageAsync } = useSignMessage();
  const config = useConfig();
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { data: session } = useSession();

  const handleLogin = useCallback(async () => {
    try {
      const callbackUrl = "/protected";
      const message = new SiweMessage({
        domain: window.location.host,
        address: address,
        statement: "Sign in with Ethereum to the app.",
        uri: window.location.origin,
        version: "1",
        chainId: config.state.chainId,
        nonce: await getCsrfToken(),
      });
      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      });

      return signIn("credentials", {
        message: JSON.stringify(message),
        redirect: false,
        signature,
        callbackUrl,
      });
    } catch (error) {
      window.alert(error);
    }
  }, [address, config.state.chainId, signMessageAsync]);

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          if (!isConnected) {
            void connect({
              connector: injected(),
            });
          } else {
            void handleLogin();
          }
        }}
      >
        Sign-in
      </button>
    </>
  );
}

export default Home;
