import React, { createContext, useContext, useState } from "react";

export interface AudioFile {
  id: string;
  file: File;
  name: string;
  size: number;
  uploadedAt: Date;
  waveformData?: Float32Array;
  pitchData?: number[];
}

interface FileContextType {
  uploadedFiles: AudioFile[];
  addFile: (file: File) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  selectedFileForAnalysis: AudioFile | null;
  setSelectedFileForAnalysis: (file: AudioFile | null) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: React.ReactNode }) {
  const [uploadedFiles, setUploadedFiles] = useState<AudioFile[]>([]);
  const [selectedFileForAnalysis, setSelectedFileForAnalysis] = useState<AudioFile | null>(null);

  const addFile = (file: File) => {
    const newFile: AudioFile = {
      id: `${Date.now()}-${Math.random()}`,
      file,
      name: file.name,
      size: file.size,
      uploadedAt: new Date(),
    };
    setUploadedFiles((prev) => [...prev, newFile]);
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
    if (selectedFileForAnalysis?.id === id) {
      setSelectedFileForAnalysis(null);
    }
  };

  const clearFiles = () => {
    setUploadedFiles([]);
    setSelectedFileForAnalysis(null);
  };

  return (
    <FileContext.Provider
      value={{
        uploadedFiles,
        addFile,
        removeFile,
        clearFiles,
        selectedFileForAnalysis,
        setSelectedFileForAnalysis,
      }}
    >
      {children}
    </FileContext.Provider>
  );
}

export function useFiles() {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error("useFiles must be used within FileProvider");
  }
  return context;
}
