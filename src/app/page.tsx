"use client";

import Button, { ButtonLooks } from "@/components/primitives/Button";
import Divider from "@/components/primitives/Divider";
import { ChevronDown } from "lucide-react";
import { signIn } from "next-auth/react";

export function LandingDetail({ image, children, reverse }: { image: string, reverse?: boolean } & React.PropsWithChildren) {
	return <div className={`flex gap-10 mx-40 pb-20 *:w-full items-center ${reverse && "flex-row-reverse"}`}>
		<img src={image} className="border-5 border-ctp-blue-500 max-w-180" />
		<div className={reverse ? "text-right" : ""}>
			{children}
		</div>
	</div>;
}

export default function LandingPage() {
	const demo = process.env.NEXT_PUBLIC_IS_DEMO === "true";

	async function demoLogin() {
		const email = "demo@tungsten.app";
		const password = "demodemo";

		await signIn("credentials", { email, password, redirectTo: "/editor" });
	}

	return <main className="w-full h-full overflow-x-hidden">
		<div className="w-full h-screen bg-linear-to-br from-ctp-mantle to-ctp-surface0 relative">
			<div className="absolute-center text-center">
				<h1 className="flex gap-1 items-center w-full justify-center"><img src="/tungsten.svg" width={50} height={50} /> Tungsten</h1>
				{demo && <>
					<p>The self-hosted Obsidian alternative in your browser.<br />Fast and intuitive!</p>
					<Divider />
				</>}
				<div className="flex gap-2">
					{demo ? <>
						<Button look={ButtonLooks.SECONDARY} onClick={demoLogin}>Try the Demo</Button>
						<a href="https://github.com/mrdiamonddog/tungsten/tree/master/README.md" className="w-full">
							<Button>Get Started</Button>
						</a>
					</> : <>
						<a href="/auth" className="w-full">
							<Button>Log In</Button>
						</a>
					</>}
				</div>
			</div>
			{demo && <ChevronDown className="absolute left-1/2 bottom-5 -translate-x-1/2 animate-bounce" size={50} />}
		</div>
		{demo && <div className="w-full bg-linear-to-bl from-ctp-surface0 to-ctp-mantle">
			<LandingDetail image="/app-preview.png">
				<h2>WYSIWYG Markdown Editor</h2>
				<p>
					All the essentials: basic formatting, syntax-highlighted code blocks, KaTeX math editing,
					links between files, images, checklists, you name it.
				</p>
			</LandingDetail>
			<LandingDetail image="/sync.png" reverse>
				<h2>Syncing</h2>
				<p>
					Your account data will sync across devices using a local database stored on your hardware.
					This data is never sent anywhere outside of your hardware or the devices accessing your instance.
				</p>
			</LandingDetail>
			<LandingDetail image="/import-export.png">
				<h2>Easy Import/Export</h2>
				<p>
					Import your Obsidian vaults or other markdown files, export Tungsten files as markdown or HTML!
				</p>
			</LandingDetail>
			<LandingDetail image="/open-source.png" reverse>
				<h2>Free, Open Source, Forever</h2>
				<p>
					Tungsten does not have a hosted version. Your instance is completely private, and no telemetry is sent anywhere.
					You can even fork Tungsten to make it your own! Tungsten will always be open source and free.
				</p>
			</LandingDetail>
		</div>}
	</main>;
}
