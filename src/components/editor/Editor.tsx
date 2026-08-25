"use client";

import { RealmProvider } from "@mdxeditor/editor";
import EditorTabs from "./EditorTabs";
import Sidebar from "./Sidebar";
import dynamic from "next/dynamic";
import EditorTitle from "./EditorTitle";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import Subtext from "../primitives/Subtext";
import LinkButton from "../primitives/LinkButton";

const MDEditor = dynamic(() => import("@/components/editor/MDEditor"), {
	ssr: false,
});

export default function TabbedEditor() {
	return (<div className="w-full h-full flex">
		<EditorTitle />
		<Sidebar />
		<div className="w-full h-full flex flex-col">
			<EditorTabs />
			<RealmProvider>
				<ErrorBoundary errorComponent={props => <>
					<Subtext>Something went wrong: {(props.error as any).toString()}</Subtext>
					<LinkButton onClick={props.retry}>Retry</LinkButton>
				</>}>
					<MDEditor />
				</ErrorBoundary>
			</RealmProvider>
		</div>
	</div>);
}
