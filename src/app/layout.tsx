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
	description: "Self-hostable Obsidian alternative.",
	icons: [
		{
			url: "/tungsten-96.png",
			sizes: "96x96",
			type: "image/png",
		},
		{
			url: "/tungsten.svg",
			type: "image/svg+xml",
		},
		{
			url: "/tungsten.ico",
			rel: "shortcut icon",
		},
		{
			url: "/apple-touch-icon.png",
			rel: "apple-touch-icon",
			sizes: "180x180",
		},
	],
	applicationName: "Tungsten",
	appleWebApp: {
		capable: false,
	},
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
