import {
	ContextMenu as ContextMenuRoot,
	ContextMenuProps,
	ContextMenuContent as _ContextMenuContent,
	ContextMenuContentProps,
	ContextMenuPortal,
	ContextMenuSeparator as _ContextMenuSeparator,
	ContextMenuSeparatorProps,
	ContextMenuTrigger as _ContextMenuTrigger,
	ContextMenuTriggerProps,
	ContextMenuItem as _ContextMenuItem,
	ContextMenuItemProps,
} from "@radix-ui/react-context-menu";

export function ContextMenu(props: ContextMenuProps) {
	return (<ContextMenuRoot {...props}>
		{props.children}
	</ContextMenuRoot>);
}

export function ContextMenuTrigger(props: ContextMenuTriggerProps) {
	return (<_ContextMenuTrigger {...props}>
		{props.children}
	</_ContextMenuTrigger>);
}

export function ContextMenuContent(props: ContextMenuContentProps) {
	return (<ContextMenuPortal>
		<_ContextMenuContent {...props}
			className={`${props.className && ""} bg-ctp-mantle border border-ctp-surface0 p-2 min-w-40 shadow-md`}>
			{props.children}
		</_ContextMenuContent>
	</ContextMenuPortal>);
}

export function ContextMenuItem(props: ContextMenuItemProps) {
	return (<_ContextMenuItem {...props}
		className={`${props.className && ""} px-2 py-1 hover:bg-ctp-surface0 cursor-pointer outline-none transition-all`}>
		{props.children}
	</_ContextMenuItem>);
}

export function ContextMenuSeparator(props: ContextMenuSeparatorProps) {
	return (<_ContextMenuSeparator {...props} className={`${props.className && ""} border-t border-ctp-surface0 my-2`} />);
}
