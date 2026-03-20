import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import ImageKit from "@imagekit/nodejs";
import { toFile } from "@imagekit/nodejs";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
});

export async function POST(request: NextRequest) {
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
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const formUserId = formData.get("userId") as string;
    const parentId = (formData.get("parentId") as string) || null;

    if (
      !process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ||
      !process.env.IMAGEKIT_PRIVATE_KEY ||
      !process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
    ) {
      return NextResponse.json(
        {
          error: "imagekit environment variables are not configured",
        },
        { status: 500 },
      );
    }

    if (formUserId !== userId) {
      return NextResponse.json(
        {
          error: "forbidden",
        },
        { status: 403 },
      );
    }
    if (!file) {
      return NextResponse.json(
        {
          error: "no file is provided",
        },
        { status: 400 },
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: "file size exceeds 5mb limit",
        },
        { status: 413 },
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
            eq(files.isFolder, true),
          ),
        );

      if (!parentFolder) {
        return NextResponse.json(
          {
            error: "parent folder not found",
          },
          { status: 404 },
        );
      }
    }

    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      return NextResponse.json(
        {
          error: "only images and pdf are supported for upload",
        },
        { status: 415 },
      );
    }

    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);

    const folderPath = parentId
      ? `/wobblebox/${userId}/folder/${parentId}`
      : `/wobblebox/${userId}`;

    const originalFilename = file.name;
    const allowedExtensions = [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "bmp",
      "webp",
      "pdf",
    ];
    const allowedMimeTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/webp",
    ];

    const fileExtension = (
      originalFilename.split(".").pop() || ""
    ).toLowerCase();
    const fileMimeType = file.type;

    if (
      !allowedExtensions.includes(fileExtension) ||
      !allowedMimeTypes.includes(fileMimeType)
    ) {
      return NextResponse.json(
        {
          error: "only valid image and pdf extension are allowed",
        },
        { status: 415 },
      );
    }
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;

    let uploadResponse;
    try {
      const uploadableFile = await toFile(fileBuffer, uniqueFilename);
      uploadResponse = await imagekit.files.upload({
        file: uploadableFile,
        fileName: uniqueFilename,
        folder: folderPath,
        useUniqueFileName: false,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "ImageKit upload failed";
      console.error("ImageKit upload failure", error);
      return NextResponse.json(
        {
          error: "upload provider failed",
          stage: "imagekit_upload",
          details: message,
        },
        { status: 502 },
      );
    }

    const fileData = {
      name: originalFilename,
      path: uploadResponse.filePath || `${folderPath}/${uniqueFilename}`,
      size: file.size,
      type: file.type,
      fileUrl:
        uploadResponse.url ||
        `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ""}${uploadResponse.filePath || `${folderPath}/${uniqueFilename}`}`,
      thumbnailUrl: uploadResponse.thumbnailUrl || null,
      userId: userId,
      parentId: parentId || null,
      isFolder: false,
      isStarred: false,
      isTrash: false,
    };
    let newFile;
    try {
      [newFile] = await db.insert(files).values(fileData).returning();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Database insert failed";
      console.error("Database insert failure", error);
      return NextResponse.json(
        {
          error: "failed to save uploaded file metadata",
          stage: "db_insert",
          details: message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(newFile, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown upload error";
    console.error("Failed to upload file", error);
    return NextResponse.json(
      {
        error: "failed to upload file",
        details: message,
      },
      { status: 500 },
    );
  }
}
