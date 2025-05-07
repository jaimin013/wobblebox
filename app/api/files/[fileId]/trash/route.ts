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
   const [updatedFiles] = await db
      .update(files)
      .set({ isTrash: !file.isTrash })
      .where(and(eq(files.id, fileId), eq(files.userId, userId)))
      .returning();
    
      const action = updatedFiles.isTrash ? "moved to trash" : "restored";

      return NextResponse.json({
        ...updatedFiles,
        message: `File is ${action} succesfully`
      })
  } catch (error) {
    return NextResponse.json(
      {
        error: "failed to update trash your file status",
      },
      { status: 401 }
    );
  }
}