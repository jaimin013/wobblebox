"use client";
import React from "react";
import type { File as FileType } from "../lib/db/schema";
import { Button } from "@heroui/button";
import { ArrowUpFromLine, Download, Star, Trash, X } from "lucide-react";

interface FileActionsProps {
  file: FileType;
  onStar: (id: string) => void;
  onTrash: (id: string) => void;
  onDelete: (file: FileType) => void;
  onDownload: (file: FileType) => void;
}

export default function FileActions({
  file,
  onStar,
  onTrash,
  onDelete,
  onDownload,
}: FileActionsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-end">
      {!file.isTrash && !file.isFolder && (
        <Button
          variant="flat"
          size="sm"
          onClick={() => onDownload(file)}
          className="min-w-0 px-2"
          startContent={<Download className="h-4 w-4" />}
        >
          <span className="hidden sm:inline">Download</span>
        </Button>
      )}

      {/* star button  */}
      {!file.isTrash && (
        <Button
          variant="flat"
          size="sm"
          onClick={() => onStar(file.id)}
          className="min-w-0 px-2"
          startContent={
            <Star
              className={`h-4 w-4 px-2 ${
                file.isStarred
                  ? "text-yellow-400 fill-current"
                  : "text-gray-400"
              }`}
            >
              <span className="hidden sm:inline">
                {file.isStarred ? "Unstar" : "Star"}
              </span>
            </Star>
          }
        ></Button>
      )}

      <Button
      variant="flat"
      size="sm"
      onClick={() => onTrash(file.id)}
      className="min-w-0 px-2"
      color={file.isTrash ? "success" : "default"}
      startContent={
        file.isTrash ? (
          <ArrowUpFromLine className="h-4 w-4"/>
        ) : (
          <Trash className="h-4 w-4"/>
        )
      }
      >
        <span className="hidden sm:inline">
          {file.isTrash ? "Restore" : "Delete"}
        </span>
      </Button>

      {/* permanent delete btn */}
      {file.isTrash && (
        <Button
        variant="flat"
        size="sm"
        color="danger"
        onClick={() => onDelete(file)}  
        className="min-w-0 px-2"
        startContent={<X className="h-4 w-4"/>}
        >
          <span className="hidden sm:inline">Remove</span>
        </Button>
      )}
    </div>
  );
}
