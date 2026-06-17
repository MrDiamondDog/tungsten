import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuContentProps,
	DropdownMenuItem,
	DropdownMenuItemProps,
	DropdownMenuPortal,
	DropdownMenuProps,
	DropdownMenuSeparator,
	DropdownMenuSeparatorProps,
	DropdownMenuTrigger,
	DropdownMenuTriggerProps,
} from "@radix-ui/react-dropdown-menu";

export function Dropdown(props: DropdownMenuProps) {
	return (<DropdownMenu {...props}>
		{props.children}
	</DropdownMenu>);
}

export function DropdownTrigger(props: DropdownMenuTriggerProps) {
	return (<DropdownMenuTrigger {...props}>
		{props.children}
	</DropdownMenuTrigger>);
}

export function DropdownContent(props: DropdownMenuContentProps) {
	return (<DropdownMenuPortal>
		<DropdownMenuContent {...props}
			className={`${props.className && ""} bg-ctp-mantle border border-ctp-surface0 p-2 min-w-40 shadow-md`}>
			{props.children}
		</DropdownMenuContent>
	</DropdownMenuPortal>);
}

export function DropdownItem(props: DropdownMenuItemProps) {
	return (<DropdownMenuItem {...props}
		className={`${props.className && ""} px-2 py-1 hover:bg-ctp-surface0 cursor-pointer outline-none transition-all`}>
		{props.children}
	</DropdownMenuItem>);
}

export function DropdownSeparator(props: DropdownMenuSeparatorProps) {
	return (<DropdownMenuSeparator {...props} className={`${props.className && ""} border-t border-ctp-surface0 my-2`} />);
}
