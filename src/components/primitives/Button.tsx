import Spinner from "./Spinner";

export enum ButtonLooks {
	PRIMARY = "bg-ctp-blue-700 hover:bg-ctp-blue-800 disabled:bg-ctp-blue-900 text-ctp-crust",
	SECONDARY = "bg-ctp-surface1 hover:bg-ctp-surface0 disabled:bg-ctp-surface0 text-ctp-text"
}

export default function Button({ loading, look, ...props }:
	{ loading?: boolean, look?: ButtonLooks } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
	return <button {...props} disabled={props.disabled || loading} className={`${props.className ?? ""}
		${look ?? ButtonLooks.PRIMARY}
		w-full p-2 enabled:cursor-pointer transition-all flex gap-1 justify-center items-center`}>
		{loading ? <Spinner /> : props.children}
	</button>;
}
