export default function Input({ onChange, ...props }: { onChange?: (value: string) => void }
	& Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
	return <input {...props} onChange={e => onChange?.(e.target.value)} className={`${props.className ?? ""}
		outline-none p-2 border border-ctp-surface0 bg-ctp-mantle focus:border-ctp-surface1 transition-all`}>
	</input>;
}
