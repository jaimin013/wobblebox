"use client";

import {
  FileImage,
  FileVideo,
  FileText,
  FileAudio,
  FileArchive,
  LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import React from "react";

type FileType = "image" | "video" | "text" | "audio" | "zip";

const icons: Record<FileType, LucideIcon> = {
  image: FileImage,
  video: FileVideo,
  text: FileText,
  audio: FileAudio,
  zip: FileArchive,
};

interface FileIconCardProps {
  type: FileType;
  filename?: string;
  size?: string;
}

const FileIconCard: React.FC<FileIconCardProps> = ({ type, filename, size }) => {
  const Icon = icons[type];

  return (
    <motion.div
      whileHover={{ scale: 1.08 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative w-40 h-40 bg-white border-2 border-gray-300 rounded-xl p-4 flex flex-col justify-center items-center shadow-md group overflow-hidden"
    >
      {/* Animated Border using Motion */}
      <motion.div
        layoutId="border"
        className="absolute inset-0 border-2 border-blue-500 rounded-xl pointer-events-none z-0"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />

      {/* Icon */}
      <Icon className="w-12 h-12 text-blue-600 z-10 transition-transform duration-300 group-hover:scale-110" />

      {/* Filename */}
      <div className="mt-3 text-sm text-gray-800 text-center z-10">
        {filename || `${type.toUpperCase()} File`}
      </div>

      {/* Size (optional) */}
      {size && (
        <div className="text-xs text-gray-500 mt-1 z-10">{size}</div>
      )}
    </motion.div>
  );
};

export default FileIconCard;
