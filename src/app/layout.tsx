import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Suspense } from "react";
import Spinner from "@/components/primitives/Spinner";

const lexend = Lexend({
	variable: "--font-lexend",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Tungsten",
	description: "Cool",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${lexend.variable} h-full antialiased bg-ctp-base text-ctp-text`}
		>
			<body className="h-full dark">
				<SessionProvider>
					<Suspense fallback={<Spinner />}>
						{children}
					</Suspense>
				</SessionProvider>

				<div id="portal-root" />
			</body>
		</html>
	);
}
