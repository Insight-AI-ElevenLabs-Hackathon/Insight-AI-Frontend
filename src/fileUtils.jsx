import React from "react";
import { File, Image, FileText, Film } from "lucide-react";

export const getFileIcon = (file) => {
  const fileType = file.type.split("/")[0];
  switch (fileType) {
    case "image":
      return <Image size={24} />;
    case "video":
      return <Film size={24} />;
    case "text":
    case "application":
      return <FileText size={24} />;
    default:
      return <File size={24} />;
  }
};

export const getFilePreview = (file) => {
  if (file.type.startsWith("image/")) {
    return URL.createObjectURL(file);
  }
  return null;
};