"use client";

import Button from "@/components/primitives/Button";
import Divider from "@/components/primitives/Divider";
import Input from "@/components/primitives/Input";
import LinkButton from "@/components/primitives/LinkButton";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
	const searchParams = useSearchParams();

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(searchParams.has("error") ? "Invalid email or password." : "");

	const [mode, setMode] = useState<"signin" | "signup">("signin");

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	useEffect(() => {
		setError(searchParams.has("error") ? "Invalid email or password." : "");
		if (password !== confirmPassword && mode === "signup")
			return void setError("Passwords do not match");
	}, [password, confirmPassword]);

	async function login() {
		setLoading(true);

		await signIn("credentials", {
			redirect: true,
			redirectTo: "/editor",
			email,
			password,
		});
	}

	async function signup() {
		setError("");

		if (!email || !password || !confirmPassword)
			return void setError("Please fill out all fields");

		if (password !== confirmPassword)
			return void setError("Passwords do not match");

		if (password.length < 8)
			return void setError("Password must be longer than 8 characters");

		setLoading(true);

		await fetch("/api/signup", {
			method: "POST",
			body: JSON.stringify({ email, password }),
		}).then(res => res.json())
			.then(json => {
				if (json.error) {
					setLoading(false);
					setError(json.error);
					throw json.error;
				}
			})
			.catch(e => {
				setLoading(false);
				setError("Something went wrong. Please check the console.");
				throw e;
			});

		await signIn("credentials", {
			redirect: true,
			redirectTo: "/editor",
			email,
			password,
		});
	}

	return <main className="absolute-center border border-ctp-surface0 p-4 w-75">
		<h2>{mode === "signin" ? "Log In" : "Sign Up"}</h2>
		<Divider />
		<div className="flex flex-col gap-1">
			<Input placeholder="Email" type="email" onChange={setEmail} value={email} />
			<Input placeholder="Password" type="password" onChange={setPassword} value={password} />
			{mode === "signup" &&
				<Input placeholder="Confirm Password" type="password" onChange={setConfirmPassword} value={confirmPassword} />}
			{mode === "signin" ? <Button onClick={login} loading={loading}>Log In</Button> :
				<Button onClick={signup} loading={loading}>Sign Up</Button>}
			{error && <p className="text-ctp-red text-wrap overflow-hidden">{error}</p>}
		</div>
		{process.env.NEXT_PUBLIC_ALLOW_SIGNUPS !== "true" ? <p>The admin of the application has disabled sign ups.</p> :
			<LinkButton onClick={() => setMode(mode === "signup" ? "signin" : "signup")}>
				{mode === "signup" ? "Already have an account?" : "Don't have an account?"}
			</LinkButton>}
	</main>;
}
