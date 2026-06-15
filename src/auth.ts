import bcrypt from "bcryptjs";
import { db, users } from "./db/schema";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import { eq } from "drizzle-orm";

export const { handlers, auth, signIn, signOut } = NextAuth({
	adapter: DrizzleAdapter(db),
	providers: [
		Credentials({
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" },
			},
			authorize: async (credentials): Promise<Omit<typeof users.$inferSelect, "password"> | null> => {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				try {
					const user = (await db.select().from(users)
						.where(eq(users.email, credentials.email as string)))[0];

					if (!user || !user.password) {
						return null;
					}

					const isPasswordValid = await bcrypt.compare(
						credentials.password as string,
						user.password
					);

					if (!isPasswordValid) {
						return null;
					}

					return {
						id: user.id as string,
						email: user.email as string,
					};
				} catch (error) {
					console.error("Error during authentication:", error);
					return null;
				}
			},
		}),
	],
	secret: process.env.AUTH_SECRET,
	pages: {
		signIn: "/",
	},
	session: {
		strategy: "jwt",
	},
	callbacks: {
		async jwt({ token, user, trigger }) {
			if (trigger === "signUp" && process.env.ALLOW_SIGNUPS !== "true")
				return null;
			if (user) {
				token.id = user.id;
				token.email = user.email;
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
				session.user.email = token.email as string;
			}
			return session;
		},
	},
});
