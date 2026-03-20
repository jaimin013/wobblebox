"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Folder, Star, Trash, X, ExternalLink } from "lucide-react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Divider } from "@heroui/divider";
import { Tooltip } from "@heroui/tooltip";
import { Card } from "@heroui/card";
import { addToast } from "@heroui/toast";
import { formatDistanceToNow, format } from "date-fns";
import type { File as FileType } from "@/lib/db/schema";
import axios from "axios";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import FileEmptyState from "@/components/FileEmptyState";
import FileIcon from "@/components/FileIcon";
import FileActions from "@/components/FileActions";
import FileLoadingState from "@/components/FileLoadingState";
import FileTabs from "@/components/FileTabs";
import FolderNavigation from "@/components/FolderNavigation";
import FileActionButtons from "@/components/FileActionButton";

interface FileListProps {
  userId: string;
  refreshTrigger?: number;
  onFolderChange?: (folderId: string | null) => void;
}
export default function FileList({
  userId,
  refreshTrigger = 0,
  onFolderChange,
}: FileListProps) {
  const [files, setFiles] = useState<FileType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<
    Array<{ id: string; name: string }>
  >([]);

  const [deletedModalOpen, setDeletedModalOpen] = useState(false);
  const [emptyTrashModalOpen, setEmptyTrashModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/files?userId=${userId}`;
      if (currentFolder) {
        url += `&parentId=${currentFolder}`;
      }

      const response = await axios.get(url);
      setFiles(response.data);
    } catch (error) {
      console.error("Error fetching files:", error);
      addToast({
        title: "error loading files",
        description: "we could not load your files. Please try again",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  }, [userId, currentFolder]);

  //fetch file when folder refrestrigger or usedid change
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles, refreshTrigger]);

  // filter on based activetabs
  const filterdFiles = useMemo(() => {
    switch (activeTab) {
      case "starred":
        return files.filter((file) => file.isStarred && !file.isTrash);
      case "trash":
        return files.filter((file) => file.isTrash);
      case "all":
      default:
        return files.filter((file) => !file.isTrash);
    }
  }, [files, activeTab]);
  //count file in trash
  const trashCount = useMemo(() => {
    return files.filter((file) => file.isTrash).length;
  }, [files]);
  //count starred
  const starredCount = useMemo(() => {
    return files.filter((file) => file.isStarred && !file.isTrash).length;
  }, [files]);

  const handleStarFile = async (fileId: string) => {
    try {
      await axios.patch(`/api/files/${fileId}/star`);

      //update local statedata
      setFiles(
        files.map((file) =>
          file.id === fileId ? { ...file, isStarred: !file.isStarred } : file,
        ),
      );
      //show toast
      const file = files.find((f) => f.id === fileId);
      addToast({
        title: file?.isStarred ? "Remove from Starred" : "Added to Starred",
        description: `"${file?.name}" has been ${
          file?.isStarred ? "removed from" : "added to"
        } your starred files`,
        color: "success",
      });
    } catch (error) {
      console.error("Error starring file:", error);
      addToast({
        title: "Action Failed",
        description: "failed to update star status. Please try again.",
        color: "danger",
      });
    }
  };
  const handleTrashFile = async (fileId: string) => {
    try {
      const response = await axios.patch(`/api/files/${fileId}/trash`);
      const responseData = response.data;

      setFiles(
        files.map((file) =>
          file.id === fileId ? { ...file, isTrash: !file.isTrash } : file,
        ),
      );

      const file = files.find((f) => f.id === fileId);
      addToast({
        title: responseData.isTrash ? "Moved to Trash" : "Restored from Trash",
        description: `"${file?.name}" has been ${
          responseData.isTrash ? "moved to trash" : "restored"
        }`,
        color: "success",
      });
    } catch (error) {
      console.error("Error trashing file", error);
      addToast({
        title: "action failed",
        description: "failed to update file status. Please try again",
        color: "danger",
      });
    }
  };
  const handleDeleteFile = async (fileId: string) => {
    try {
      const fileToDelete = files.find((f) => f.id === fileId);
      const fileName = fileToDelete?.name || "File";

      const response = await axios.delete(`/api/files/${fileId}/delete`);

      if (response.data.success) {
        //remove from local state
        setFiles(files.filter((file) => file.id !== fileId));

        addToast({
          title: "file permanently deleted",
          description: `"${fileName}" has been permanently removed`,
          color: "success",
        });
        setDeletedModalOpen(false);
      } else {
        throw new Error(response.data.error || "Failed to delete file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      addToast({
        title: "deltetion of file failed",
        description: "failed to delete this file, Please try again.",
        color: "danger",
      });
    }
  };

  const handleEmptyTrash = async () => {
    try {
      await axios.delete(`/api/files/empty-trash`);
      setFiles(files.filter((file) => !file.isTrash));

      addToast({
        title: "trash emptied",
        description: `all ${trashCount} have been permanently removed`,
        color: "success",
      });
      setEmptyTrashModalOpen(false);
    } catch (error) {
      console.error("Error emptying trash:", error);
      addToast({
        title: "action failed",
        description: "failed tp empty trash, Please try again.",
        color: "danger",
      });
    }
  };
  //function for file download
  const handleDownloadFile = async (file: FileType) => {
    try {
      //will show loading toast
      addToast({
        title: "Preparing Download",
        description: `Getting "${file.name}" ready for download..`,
        color: "primary",
      });
      //for image using imagekit directurl
      if (file.type.startsWith("image/")) {
        const downloadUrl = `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}/tr:q-100,orig-true/${file.path}`;

        //imp
        const response = await fetch(downloadUrl);
        if (!response.ok) {
          throw new Error(`failed to download image: ${response.statusText}`);
        }
        //blog data
        const blob = await response.blob();

        //download link create
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = file.name;
        document.body.appendChild(link);

        addToast({
          title: "Download ready",
          description: `"${file.name}" is ready to download`,
          color: "success",
        });

        link.click();

        // clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } else {
        //other file type download
        const response = await fetch(file.fileUrl);
        if (!response.ok) {
          throw new Error(`failed to downlod file: ${response.statusText}`);
        }

        const blob = await response.blob();

        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = file.name;
        document.body.appendChild(link);

        addToast({
          title: "Download Ready",
          description: `"${file.name}" is ready to download.`,
          color: "success",
        });

        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      addToast({
        title: "Download Failed",
        description: "We couldn't download the file. Please try again later.",
        color: "danger",
      });
    }
  };
  const openImageViewer = (file: FileType) => {
    if (file.type.startsWith("image/")) {
      const optimizedUrl = `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}/tr:q-90,w-1600,fo-auto/${file.path}`;
      window.open(optimizedUrl, "_blank");
    }
  };

  const navigationFolder = (folderId: string, folderName: string) => {
    setCurrentFolder(folderId);
    setFolderPath([...folderPath, { id: folderId, name: folderName }]);

    if (onFolderChange) {
      onFolderChange(folderId);
    }
  };

  //navigate back to parent folder
  const navigateUp = () => {
    if (folderPath.length > 0) {
      const newPath = [...folderPath];
      newPath.pop();
      setFolderPath(newPath);
      const newFolderId =
        newPath.length > 0 ? newPath[newPath.length - 1].id : null;
      setCurrentFolder(newFolderId);

      if (onFolderChange) {
        onFolderChange(newFolderId);
      }
    }
  };
  const navigateToPathFolder = (index: number) => {
    if (index < 0) {
      setCurrentFolder(null);
      setFolderPath([]);

      if (onFolderChange) {
        onFolderChange(null);
      }
    } else {
      const newPath = folderPath.slice(0, index + 1);
      setFolderPath(newPath);
      const newFolderId = newPath[newPath.length - 1].id;
      setCurrentFolder(newFolderId);

      if (onFolderChange) {
        onFolderChange(newFolderId);
      }
    }
  };
  const handleItemClick = (file: FileType) => {
    if (file.isFolder) {
      navigationFolder(file.id, file.name);
    } else if (file.type.startsWith("image/")) {
      openImageViewer(file);
    }
  };
  if (loading) {
    return <FileLoadingState />;
  }
  return (
    <div className="space-y-6">
      <FileTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        files={files}
        starredCount={starredCount}
        trashCount={trashCount}
      />

      {/* folder navigation  */}
      {activeTab === "all" && (
        <FolderNavigation
          folderPath={folderPath}
          navigateUp={navigateUp}
          navigateToPathFolder={navigateToPathFolder}
        />
      )}
      {/* action btns */}
      <FileActionButtons
        activeTab={activeTab}
        trashCount={trashCount}
        folderPath={folderPath}
        onRefresh={fetchFiles}
        onEmptyTrash={() => setEmptyTrashModalOpen(true)}
      />
      <Divider className="my-4" />

      {/* files table  */}
      {filterdFiles.length === 0 ? (
        <FileEmptyState activeTab={activeTab} />
      ) : (
        <Card
          shadow="sm"
          className="border border-default-200 bg-default-50 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <Table
              aria-label="Files Table"
              isStriped
              color="default"
              selectionMode="none"
              classNames={{
                base: "min-w-full",
                th: "bg-default-100 text-default-800 font-medium text-sm",
                td: "py-4",
              }}
            >
              <TableHeader>
                <TableColumn>Name</TableColumn>
                <TableColumn className="hidden sm:table-cell">
                  Types
                </TableColumn>
                <TableColumn className="hidden md:table-cell">Size</TableColumn>
                <TableColumn className="hidden sm:table-cell">
                  Added
                </TableColumn>
                <TableColumn width={240}>Actions</TableColumn>
              </TableHeader>
              <TableBody>
                {filterdFiles.map((file) => (
                  <TableRow
                    key={file.id}
                    className={`hover:bg-default-100 transition-colors ${
                      file.isFolder || file.type.startsWith("image/")
                        ? "cursor-pointer"
                        : ""
                    }`}
                    onClick={() => handleItemClick(file)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <FileIcon file={file} />
                        <div>
                          <div className="font-medium flex items-center gap-2 text-default-800">
                            <span className="truncate max-w-[150px] sm:max-w-[200px] md:max-w-[300px]:">
                              {file.name}
                            </span>
                            {file.isStarred && (
                              <Tooltip content="Starred">
                                <Star
                                  className="h-4 w-4 text-yellow-400"
                                  fill="currentColor"
                                />
                              </Tooltip>
                            )}
                            {file.isFolder && (
                              <Tooltip content="Folder">
                                <Folder className="h-3 w-3 text-default-400" />
                              </Tooltip>
                            )}
                            {file.type.startsWith("image/") && (
                              <Tooltip content="Click to view image">
                                <ExternalLink className="h-3 w-3 text-default-400" />
                              </Tooltip>
                            )}
                          </div>
                          <div className="text-xs text-default-500 sm:hidden">
                            {formatDistanceToNow(new Date(file.createdAt), {
                              addSuffix: true,
                            })}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="text-default-700">
                        {file.isFolder ? "Folder" : file.type}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-default-700">
                        {file.isFolder
                          ? "-"
                          : file.size < 1024
                            ? `${file.size} B`
                            : file.size < 1024 * 1024
                              ? `${(file.size / 1024).toFixed(1)} KB`
                              : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div>
                        <div className="text-default-700">
                          {formatDistanceToNow(new Date(file.createdAt), {
                            addSuffix: true,
                          })}
                        </div>
                        <div className="text-xs text-default-500 mt-1">
                          {format(new Date(file.createdAt), "MMMM d, yyyy")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <FileActions
                        file={file}
                        onStar={handleStarFile}
                        onTrash={handleTrashFile}
                        onDelete={(file) => {
                          setSelectedFile(file);
                          setDeletedModalOpen(true);
                        }}
                        onDownload={handleDownloadFile}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* delete ConfirmationModal */}
      <ConfirmationModal
        isOpen={deletedModalOpen}
        onOpenChange={setDeletedModalOpen}
        title="confirm permanent deletion"
        description={`Are you sure you want to permanently delete this file`}
        icon={X}
        iconColor="text-danger"
        confirmText="Delete Permanently"
        confirmColor="danger"
        onConfirm={() => {
          if (selectedFile) {
            handleDeleteFile(selectedFile.id);
          }
        }}
        isDangerous={true}
        warningMessage={`You are about to permanently delete "${selectedFile?.name}". This file will be permanently removed from your account and cannot be recovered`}
      />

      {/* delete ConfirmationModal */}
      <ConfirmationModal
        isOpen={emptyTrashModalOpen}
        onOpenChange={setEmptyTrashModalOpen}
        title="Empty Trash"
        description={`Are you sure you want to empty the trash?`}
        icon={Trash}
        iconColor="text-danger"
        confirmText="Empty Trash"
        onConfirm={handleEmptyTrash}
        isDangerous={true}
        warningMessage={`You are about to permanently delete all ${trashCount} items in your trash.These files will be permanently removed from your account and cannot be recovered.`}
      />
    </div>
  );
}
