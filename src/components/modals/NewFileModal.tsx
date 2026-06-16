"use client";

import { useState } from "react";
import Button from "../primitives/Button";
import Divider from "../primitives/Divider";
import Input from "../primitives/Input";
import Modal, { ModalFooter, ModalProps } from "../primitives/Modal";
import { createFile } from "@/actions/files";
import { useEditorDispatch } from "../editor/EditorContext";

export default function NewFileModal(props: ModalProps) {
	const dispatch = useEditorDispatch();

	const [name, setName] = useState("");

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	async function create() {
		setError("");

		if (!name)
			return void setError("Please fill out all fields");

		setLoading(true);

		const res = await createFile(name);

		if (res.error) {
			setError(res.error);
			setLoading(false);
			return;
		}

		props.onClose?.();
		dispatch?.({ type: "create-file", file: res.data! });

		setLoading(false);
	}

	return <Modal {...props} title="New File">
		<Divider />
		<Input placeholder="Name" value={name} onChange={setName} />
		<ModalFooter error={error}>
			<Button loading={loading} onClick={create}>Create</Button>
		</ModalFooter>
	</Modal>;
}
