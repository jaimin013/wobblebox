import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ fileId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          error: "unauthorized",
        },
        { status: 401 },
      );
    }
    const { fileId } = await props.params;
    if (!fileId) {
      return NextResponse.json(
        {
          error: "file id is required",
        },
        { status: 400 },
      );
    }

    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.id, fileId), eq(files.userId, userId)));

    if (!file) {
      return NextResponse.json(
        {
          error: "file not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(file);
  } catch (error) {
    console.error("Error fetching file", error);
    return NextResponse.json(
      {
        error: "failed to fetch file",
      },
      { status: 500 },
    );
  }
}
