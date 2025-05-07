import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { error } from "console";
import { eq, and, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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
    //query parameters def
    const searchParams = request.nextUrl.searchParams;
    const queryUserId = searchParams.get("userId");
    const parentId = searchParams.get("parentId");

    //verifying if user is requesting his own file
    if (!queryUserId || queryUserId !== userId) {
      return NextResponse.json(
        {
          error: "unauthorized",
        },
        { status: 401 }
      );
    }

    let userFiles;
    if (parentId) {
      userFiles = await db
        .select()
        .from(files)
        .where(and(eq(files.userId, userId), eq(files.parentId, parentId)));
    } else {
      userFiles = await db
        .select()
        .from(files)
        .where(and(eq(files.userId, userId), isNull(files.parentId)));
    }
    return NextResponse.json(userFiles);
  } catch (error) {
    console.error("error fetching files", error);
    return NextResponse.json({
      error: "failed to fetch filrs", 
    }, {status: 500})
  }
}
