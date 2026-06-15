"use client";

import {
	codeBlockPlugin,
	headingsPlugin,
	listsPlugin,
	markdownShortcutPlugin,
	MDXEditor,
	quotePlugin,
	thematicBreakPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

export default function MDEditor({ markdown }: { markdown: string }) {
	return (
		<div className="w-full h-full">
			<MDXEditor
				contentEditableClassName="text-ctp-text! h-full"
				markdown={markdown}
				plugins={[
					headingsPlugin(),
					quotePlugin(),
					listsPlugin(),
					codeBlockPlugin(),
					thematicBreakPlugin(),
					markdownShortcutPlugin(),
				]}
			/>
		</div>
	);
}
