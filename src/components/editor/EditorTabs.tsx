import { X } from "lucide-react";
import { useState } from "react";

export default function EditorTabs({
	tabs,
	selected,
	unsaved,
	onListChange,
	onSelectedChange,
}: {
	tabs: string[];
	selected: string;
	unsaved?: boolean;
	onListChange?: (tabs: string[]) => void,
	onSelectedChange?: (selected: string) => void,
}) {
	const [hovered, setHovered] = useState(false);

	return !!tabs.length ? (
		<div className="w-full border-b border-ctp-surface0 flex">
			{tabs.map(tab => (
				<div
					className={`
						${selected === tab ? "bg-ctp-surface0" : ""} hover:bg-ctp-surface0 px-4 py-2 cursor-pointer transition-colors
						flex gap-2 items-center
					`}
					onClick={() => onSelectedChange?.(tab)}
					onMouseOver={() => selected === tab && setHovered(true)}
					onMouseLeave={() => selected === tab && setHovered(false)}
					key={tab}
				>
					{tab}
					{(hovered || !unsaved || selected !== tab) &&
						<X className="size-4 text-ctp-subtext0 hover:bg-ctp-surface1 p-0.5 rounded-sm"
							onClick={e => {
								e.stopPropagation();
								onListChange?.(tabs.filter(t => t !== tab));
							}} />
					}
					{(!hovered && unsaved && selected === tab) && <div className="rounded-full bg-ctp-text size-1.5 p-0.5 ml-0.5" />}
				</div>
			))}
		</div>
	) : null;
}
