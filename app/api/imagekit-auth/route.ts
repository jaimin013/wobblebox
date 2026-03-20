import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Imagekit from "@imagekit/nodejs";

const imagekit = new Imagekit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
});

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authParams = imagekit.helper.getAuthenticationParameters();

    return NextResponse.json(authParams);
  } catch (error) {
    console.error("Failed to generate ImageKit auth params", error);
    return NextResponse.json(
      { error: "Failed to generate auth parameters for imagekit" },
      { status: 500 },
    );
  }
}
