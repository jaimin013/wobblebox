import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { error } from "console";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ fileId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          error: "unauthrized",
        },
        { status: 401 }
      );
    }

    const { fileId } = await props.params;
    if (!fileId) {
      return NextResponse.json(
        {
          error: "fileid is required",
        },
        { status: 401 }
      );
    }
    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.id, fileId), eq(files.userId, userId)));

    if (!file) {
      return NextResponse.json(
        {
          error: "id not found",
        },
        { status: 401 }
      );
    }
   const updatedFiles = await db
      .update(files)
      .set({ isStarred: !file.isStarred })
      .where(and(eq(files.id, fileId), eq(files.userId, userId)))
      .returning();
    const updatedFile = updatedFiles[0];

    return NextResponse.json(updatedFile)
  } catch (error) {
    return NextResponse.json(
      {
        error: "failed to update/ starring your file",
      },
      { status: 401 }
    );
  }
}
