import Spinner from "./Spinner";

export default function Button({ loading, ...props }: { loading?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
	return <button {...props} disabled={props.disabled || loading} className={`${props.className ?? ""}
		bg-ctp-blue-700 hover:bg-ctp-blue-800 disabled:bg-ctp-blue-900
		w-full p-2 rounded-lg text-ctp-crust enabled:cursor-pointer transition-all flex gap-1 justify-center items-center`}>
		{loading ? <Spinner /> : props.children}
	</button>;
}
