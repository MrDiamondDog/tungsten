import { auth } from "@/auth";
import { readFileSync } from "fs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, ctx: RouteContext<"/api/image/[filename]">) {
	const user = await auth();

	if (!user?.user)
		return new NextResponse("Not authenticated");

	const { filename } = await ctx.params;

	if (!filename)
		return new NextResponse("Not found", { status: 404 });

	return new NextResponse(readFileSync(`./images/${user.user.id}/${filename}`));
}
