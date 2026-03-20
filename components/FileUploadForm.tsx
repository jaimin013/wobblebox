"use client";

import React, { useRef, useState } from "react";
import axios from "axios";
import {
  addToast,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Progress,
} from "@heroui/react";
import {
  AlertTriangle,
  ArrowRight,
  FileUp,
  FolderPlus,
  Upload,
  X,
} from "lucide-react";

interface FileUploadFormProps {
  userId: string;
  onUploadSucess?: () => void;
  currentFolder?: string | null;
}

export default function FileUploadForm({
  userId,
  onUploadSucess,
  currentFolder = null,
}: FileUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  //folder creation
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File sixe exceeds 5mb limit");
        return;
      }

      setFile(selectedFile);
      setError(null); //null
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];

      if (droppedFile.size > 5 * 1024 * 1024) {
        setError("file size exceeds 5mb limit");
        return;
      }
      setFile(droppedFile);
      setError(null); //null
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);
    if (currentFolder) {
      formData.append("parentId", currentFolder);
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      await axios.post("/api/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (ProgressEvent) => {
          if (ProgressEvent.total) {
            const percentCompleted =
              Math.round(ProgressEvent.loaded * 100) / ProgressEvent.total;

            setProgress(percentCompleted);
          }
        },
      });

      addToast({
        title: "uplaoded succesfully",
        description: `${file.name} has been uploaded succesufully`,
        color: "success",
      });

      clearFile();

      if (onUploadSucess) {
        onUploadSucess();
      }
    } catch (error: unknown) {
      console.error("error uploading file:", error);
      const apiErrorData = axios.isAxiosError(error)
        ? error.response?.data
        : null;
      console.error("upload api response:", apiErrorData);
      const detailsMessage =
        typeof apiErrorData === "object" &&
        apiErrorData !== null &&
        "details" in apiErrorData &&
        typeof (apiErrorData as { details?: unknown }).details === "string"
          ? (apiErrorData as { details: string }).details
          : undefined;
      const errorMessage =
        typeof apiErrorData === "object" &&
        apiErrorData !== null &&
        "error" in apiErrorData &&
        typeof (apiErrorData as { error?: unknown }).error === "string"
          ? (apiErrorData as { error: string }).error
          : undefined;
      const apiMessage =
        detailsMessage ||
        errorMessage ||
        "failed to upload file please try again";
      setError(apiMessage);
      addToast({
        title: "upload failed",
        description: apiMessage,
        color: "danger",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      addToast({
        title: "invalid folder name",
        description: "please enter a valid folder name",
        color: "danger",
      });
      return;
    }

    setCreatingFolder(true);

    try {
      await axios.post("/api/folders/create", {
        name: folderName.trim(),
        userId: userId,
        parentId: currentFolder,
      });
      addToast({
        title: "folder created success",
        description: `Folder "${folderName}" has been created succesfully`,
        color: "success",
      });

      setFolderName("");
      setFolderModalOpen(false);

      if (onUploadSucess) {
        onUploadSucess();
      }
    } catch (error) {
      console.error("error creating folder", error);
      addToast({
        title: "folder creation failed",
        description: "we couldn't create folder please try again",
        color: "danger",
      });
    } finally {
      setCreatingFolder(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* action btns */}
      <div className="flex gap-2 mb-2">
        <Button
          color="primary"
          variant="flat"
          startContent={<FolderPlus className="h-4 w-4" />}
          onClick={() => setFolderModalOpen(true)}
          className="flex-1"
        >
          New Folder
        </Button>
        <Button
          color="primary"
          variant="flat"
          startContent={<FileUp className="h-4 w-4" />}
          onClick={() => fileInputRef.current?.click()}
          className="flex-1"
        >
          Add Image
        </Button>
      </div>

      {/* file drop area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          error
            ? "border-danger/30 bg-danger/5"
            : file
              ? "border-primary/30 bg-primary/5"
              : "border-default-300 hover:border-primary/5"
        }`}
      >
        {!file ? (
          <div className="space-y-3">
            <FileUp className="h-12 w-12 mx-auto text-primary/70" />
            <div>
              <p className="text-default-600">
                Drage and drop your image here, or{" "}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary cursor-pointer font-medium inline bg-transparent border-0 p-0 m-0"
                >
                  Browse
                </button>
              </p>
              <p className="text-xs text-default-500 mt-1:">Image up to 5mb</p>
            </div>
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-md">
                  <FileUp className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium truncate max-w-[180px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-default-500">
                    {file.size < 1024
                      ? `${file.size}B`
                      : file.size < 1024 * 1024
                        ? `${(file.size / 1024).toFixed(1)} KB`
                        : `${(file.size / (1024 * 1024)).toFixed(1)}MB`}
                  </p>
                </div>
              </div>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onClick={clearFile}
                className="text-default-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {error && (
              <div className="bg-danger-5 text-danger-700 p-3 rounded-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {uploading && (
              <Progress
                value={progress}
                color="primary"
                size="sm"
                showValueLabel={true}
                className="max-w-full"
              />
            )}

            <Button
              color="primary"
              startContent={<Upload className="h-4 w-4" />}
              endContent={!uploading && <ArrowRight className="h-4 w-4" />}
              onClick={handleUpload}
              isLoading={uploading}
              className="w-full"
              isDisabled={!!error}
            >
              {uploading ? `Uploading...${progress}%` : "upload image"}
            </Button>
          </div>
        )}
      </div>
      {/* tips  */}
      <div className="bg-default-100/5 p-4 rounded-lg">
        <h4 className="text-sm font-medium mb-2">Tips</h4>
        <ul className="text-xs text-default-600 space-y-1">
          <li>• Images are private and only visible to you</li>
          <li>• Supported formats: JPG, PNG, GIF, WebP</li>
          <li>• Maximum file size: 5MB</li>
        </ul>
      </div>

      <Modal
        isOpen={folderModalOpen}
        onOpenChange={setFolderModalOpen}
        backdrop="blur"
        placement="center"
        classNames={{
          wrapper: "z-[100]",
          base: "border border-default-200 bg-default-50",
          header: "border-b border-default-200",
          footer: "border-t border-default-200",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex gap-2 items-center">
            <FolderPlus className="h-5 w-5 text-primary" />
            <span>New Folder</span>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p className="text-sm text-default-600">
                Enter a name for your folder:
              </p>
              <Input
                type="text"
                label="Folder Name"
                placeholder="My Images"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                autoFocus
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              color="default"
              onClick={() => setFolderModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={handleCreateFolder}
              isLoading={creatingFolder}
              isDisabled={!folderName.trim()}
              endContent={!creatingFolder && <ArrowRight className="h-4 w-4" />}
            >
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
