import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Suspense } from "react";
import Spinner from "@/components/primitives/Spinner";
import { PublicEnv } from "@/public-env";
import { ThemeProvider } from "@/components/theme/ThemeContext";
import { Toaster } from "sonner";
import { CheckCircle2, CircleAlert, Info } from "lucide-react";

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
						<PublicEnv />
						<ThemeProvider>
							{children}
						</ThemeProvider>
					</Suspense>
				</SessionProvider>

				<Toaster
					className="toaster group"
					theme="dark"
					richColors
					style={{
						"--normal-bg": "var(--catppuccin-color-surface0)",
						"--normal-text": "var(--catppuccin-color-text)",
						"--normal-border": "var(--catppuccin-color-surface1)",
					} as React.CSSProperties}
					visibleToasts={5}
					position="top-center"
					icons={{
						success: <CheckCircle2 size={20} />,
						error: <CircleAlert size={20} />,
						info: <Info size={20} />,
					}}
				/>

				<div id="portal-root" />
			</body>
		</html>
	);
}
