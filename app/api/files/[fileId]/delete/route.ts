import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import ImageKit from "@imagekit/nodejs";
import { NextRequest, NextResponse } from "next/server";

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
});

export async function DELETE(
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

    if (!file.isFolder) {
      try {
        let imagekitFileId = null;

        if (file.fileUrl) {
          const urlWithoutQuery = file.fileUrl.split("?")[0];
          imagekitFileId = urlWithoutQuery.split("/").pop();
        }
        if (!imagekitFileId && file.path) {
          imagekitFileId = file.path.split("/").pop();
        }
        if (imagekitFileId) {
          try {
            const searchResults = await imagekit.assets.list({
              searchQuery: `name = \"${imagekitFileId}\"`,
              limit: 1,
              type: "file",
            });

            if (searchResults && searchResults.length > 0) {
              const firstResult = searchResults[0];
              if ("fileId" in firstResult && firstResult.fileId) {
                await imagekit.files.delete(firstResult.fileId);
              }
            }
          } catch (searchError) {
            console.error(`Error searching for file in imagekit:`, searchError);
          }
        }
      } catch (error) {
        console.error(`Error in deleting ${fileId} from imagekit`, error);
      }
    }

    const [deletedFile] = await db
      .delete(files)
      .where(and(eq(files.id, fileId), eq(files.userId, userId)))
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "file delted succesfull",
        deletedFile,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("error deleting file: ", error);
    return NextResponse.json(
      { error: "falied to delete file" },
      { status: 500 },
    );
  }
}
