"use client";

import { Button, insertJsx$, JsxComponentDescriptor, usePublisher } from "@mdxeditor/editor";
import { MathfieldElement, renderMathInDocument } from "mathlive";
import { useEffect, useRef } from "react";

declare global {
	namespace JSX {
		interface IntrinsicElements {
			"math-field": React.DetailedHTMLProps<React.HTMLAttributes<MathfieldElement>, MathfieldElement>;
		}
	}
}

export const mathEditorDescriptor: JsxComponentDescriptor = {
	name: "MathEditor",
	kind: "text",
	props: [{ type: "string", name: "value" }],
	Editor: ({ mdastNode }) => <MathEditor value={mdastNode.attributes[0].value as string ?? ""} onChange={v => {
		mdastNode.attributes[0].value = v;
	}} />,
};

export function InsertMathButton() {
	const insertJsx = usePublisher(insertJsx$);

	return <Button
		onClick={() => insertJsx({
			name: "MathEditor",
			kind: "text",
			props: { value: "" },
		})}
	>
		Math
	</Button>;
}

export default function MathEditor({ focused, onChange, value }:
	{ focused?: boolean, onChange?: (value: string) => void, value?: string }) {
	const ref = useRef<MathfieldElement>(null);

	useEffect(() => {
		if (!ref.current)
			return;

		ref.current.mathModeSpace = "\\:";
		renderMathInDocument();
	}, [ref.current]);

	// @ts-ignore idk why it wont work but this element is declared
	return (<math-field onInput={e => onChange?.(e.target.value)} value={value} focused={focused} ref={ref}>{value}</math-field>);
}
