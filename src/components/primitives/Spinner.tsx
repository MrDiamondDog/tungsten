export default function Spinner(props: React.ImgHTMLAttributes<HTMLImageElement>) {
	return <img {...props} src="/hourglass.gif" width={16} height={16} className={`${props.className ?? ""} pixelated`} />;
}
