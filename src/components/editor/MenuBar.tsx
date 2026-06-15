import { Dropdown, DropdownContent, DropdownItem, DropdownSeparator, DropdownTrigger } from "../primitives/Dropdown";

export function MenuBarItem({ name, ...props }: { name: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
	return <Dropdown>
		<DropdownTrigger asChild>
			<button {...props}
				className={`${props.className ?? ""} outline-none px-2 py-1 hover:bg-ctp-surface0
					transition-colors rounded-lg cursor-pointer`}>
				{name}
			</button>
		</DropdownTrigger>
		<DropdownContent>
			{props.children}
		</DropdownContent>
	</Dropdown>;
}

export default function MenuBar() {
	return (<div className="w-full p-1 border-b border-ctp-surface0 flex gap-1 items-center">
		<MenuBarItem name="File">
			<DropdownItem>Save</DropdownItem>
			<DropdownItem>Save As...</DropdownItem>
			<DropdownSeparator />
			<DropdownItem>Import</DropdownItem>
			<DropdownItem>Export</DropdownItem>
		</MenuBarItem>
		<MenuBarItem name="Edit">
			<DropdownItem>Preferences</DropdownItem>
		</MenuBarItem>
	</div>);
}
