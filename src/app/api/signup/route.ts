import { db, users } from "@/db/schema";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	const body = await req.json();

	if (!body.email || !body.password)
		return NextResponse.json({ error: "Please fill out all fields" }, { status: 400 });

	if (body.password.length < 8)
		return NextResponse.json({ error: "Password must be longer than 8 characters" }, { status: 400 });

	const user = (
		await db.insert(users).values({
			email: body.email,
			password: await bcrypt.hash(body.password, 10),
		})
			.returning()
			.catch(e => [{ error: e.toString() }])
	)[0];

	return NextResponse.json(user);
}
