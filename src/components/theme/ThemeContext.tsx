"use client";

import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";

export type Theme = "mocha" | "macchiato" | "frappe" | "latte";

export const ThemeContext = createContext<{ theme: Theme, setTheme: Dispatch<SetStateAction<Theme>> }>({
	theme: "mocha",
	setTheme: () => { },
});

export function useTheme() {
	return useContext(ThemeContext);
}

export function ThemeProvider({ children }: React.PropsWithChildren) {
	const [theme, setTheme] = useState(localStorage?.getItem("theme") as Theme ?? "mocha");

	useEffect(() => {
		localStorage.setItem("theme", theme);
	}, [theme]);

	return <ThemeContext value={{ theme, setTheme }}>
		{children}
	</ThemeContext>;
}
