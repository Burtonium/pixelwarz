import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { SiweMessage } from "siwe";
import { db } from "~/server/db";
import { z } from "zod";
import { env } from "~/env";
import cookie from "cookie";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
      },
      authorize: async ({ message = "{}", signature = "" }, req) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          const siwe = new SiweMessage(JSON.parse(z.string().parse(message)));
          const nextAuthUrl = new URL(env.NEXTAUTH_URL);

          const cookies = cookie.parse(req.headers.get("cookie") ?? "");
          const result = await siwe.verify({
            signature: z.string().parse(signature) || "",
            domain: nextAuthUrl.host,
            nonce: cookies["next-auth.csrf-token"],
          });

          return result.success ? { id: siwe.address } : null;
        } catch (e) {
          console.error(e);
          return null;
        }
      },
    }),
  ],
  adapter: PrismaAdapter(db),
  callbacks: {
    async session({ session, token }) {
      session.user.id = z.string().parse(token.sub);
      return session;
    },
  },
} satisfies NextAuthConfig;
