"use client";

import { ChevronDown, ChevronRight, File, Folder } from "lucide-react";
import { useState } from "react";

export function SidebarButton({
  children,
  folder,
  selected,
  ...props
}: { selected?: boolean; folder?: boolean } & React.PropsWithChildren &
  React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${selected ? "bg-ctp-surface0" : "hover:bg-ctp-surface0"} w-full rounded-lg text-left px-2 py-1 cursor-pointer transition-colors flex gap-1 items-center`}
      {...props}
    >
      {folder ? (
        <ChevronRight
          size={18}
          className={`${selected ? "rotate-90" : ""} transition-transform`}
        />
      ) : (
        <File size={18} />
      )}{" "}
      {children}
    </button>
  );
}

export function SidebarFolder({
  name,
  children,
}: { name: string } & React.PropsWithChildren) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <SidebarButton folder selected={open} onClick={() => setOpen(!open)}>
        {name}
      </SidebarButton>
      {open && (
        <div className="pl-1 ml-3 flex flex-col gap-1 mt-1 border-l border-ctp-surface0">
          {children}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  return (
    <div className="w-fit min-w-60 h-full p-2 border-r border-ctp-surface0 flex flex-col gap-1">
      <SidebarButton>File1</SidebarButton>
      <SidebarFolder name="Folder 1">
        <SidebarButton>File2</SidebarButton>
        <SidebarButton>File3</SidebarButton>
        <SidebarButton>File4</SidebarButton>
      </SidebarFolder>
    </div>
  );
}
