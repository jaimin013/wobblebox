"use client";

import type { File as FileType } from "@/lib/db/schema";
import { Image as IKImage } from "@imagekit/next";
import { FileText, Folder } from "lucide-react";

interface FileIconProps {
  file: FileType;
}
export default function FileIcon({ file }: FileIconProps) {
  if (file.isFolder) return <Folder className="h-5 w-5 text-blue-500" />;

  const FileType = file.type.split("/")[0];
  switch (FileType) {
    case "image":
      return (
        <div className="h-12 w-12 relative overflow-hidden rounded">
          <IKImage
            src={file.path}
            width={48}
            height={48}
            transformation={[
              {
                height: 48,
                width: 48,
                focus: "auto",
                quality: 80,
                dpr: 2,
              },
            ]}
            loading="lazy"
            alt={file.name}
            className="h-full w-full object-cover"
          />
        </div>
      );
    case "application":
      if (file.type.includes("pdf")) {
        return <FileText className="h-5 w-5 text-red-500" />;
      }
      return <FileText className="h-5 w-5 text-orange-500" />;

    case "video":
      return <FileText className="h-5 w-5 text-purple-500" />;

    default:
      return <FileText className="h-5 w-5 text-gray-500" />;
  }
  return <div></div>;
}
