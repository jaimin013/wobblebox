import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { error } from "console";
import { and, eq } from "drizzle-orm";
import ImageKit from "imagekit";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          error: "unauthorized",
        },
        { status: 401 }
      );
    }
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const formUserId = formData.get("userId") as string;
    const parentId = formData.get("parentId") as string;

    if (formUserId !== userId) {
      return NextResponse.json(
        {
          error: "unauthorized",
        },
        { status: 401 }
      );
    }
    if (!file) {
      return NextResponse.json(
        {
          error: "no file is provided",
        },
        { status: 401 }
      );
    }
    if (parentId) {
      const [parentFolder] = await db
        .select()
        .from(files)
        .where(
          and(
            eq(files.id, parentId),
            eq(files.userId, userId),
            eq(files.isFolder, true)
          )
        );
    }
    if (!parentId) {
      return NextResponse.json(
        {
          error: "directory not found/parent id not found",
        },
        { status: 401 }
      );
    }

    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      return NextResponse.json(
        {
          error: "only images and pdf are supported for upload",
        },
        { status: 401 }
      );
    }

    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);

    const folderPath = parentId ? `/wobblebox/${userId}/folder/${parentId}` : `/wobblebox/${userId}`

    const originalFilename = file.name;
    const allowedExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "pdf"];
    const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp"];

    const fileExtension= originalFilename.split(".").pop() || "";
    const fileMimeType = file.type;

   if(!allowedExtensions.includes(fileExtension) || !allowedMimeTypes.includes(fileMimeType)){
    return NextResponse.json({
      error: "only valid image and pdf extension are allowed"
    }, {status: 401})
   }
    const uniqueFilename = `${uuidv4()}.${fileExtension}`

   const uploadResponse = await imagekit.upload({
      file: fileBuffer,
      fileName: uniqueFilename,
      folder: folderPath,
      useUniqueFileName: false
    })

    const fileData = {
        name: originalFilename,
        path: uploadResponse.filePath,
        size: file.size,
        type: file.type,
        fileUrl: uploadResponse.url,
        thumbnailUrl: uploadResponse.thumbnailUrl || null,
        userId: userId,
        parentId:parentId,
        isFolder: false,
        isStarred: false,
        isTrash: false,
    }
   const [newFile] = await db.insert(files).values(fileData).returning();

   return NextResponse.json(newFile)
  } catch (error) {
    return NextResponse.json({
      error: "failed to upload file"
    }, {status: 401})
  }
}
