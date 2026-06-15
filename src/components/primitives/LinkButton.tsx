export default function LinkButton({ children, onClick }: { onClick?: () => void } & React.PropsWithChildren) {
	return <p className="text-ctp-blue-700 hover:underline cursor-pointer" onClick={onClick}>{children}</p>;
}
