import React, { useState, useCallback, useRef } from 'react';
import { MAX_FILE_SIZE_MB, ALLOWED_FILE_TYPES, ALLOWED_FILE_EXTENSIONS } from '../constants';
import { UploadIcon, FileIcon, CloseIcon } from './icons';

interface FileUploaderProps {
  onFileChange: (file: File | null) => void;
  error?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileChange, error }) => {
  const [localError, setLocalError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selectedFile: File | null) => {
    setLocalError(null);
    if (selectedFile) {
      if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
        setLocalError(`Invalid file type. Please upload one of: ${ALLOWED_FILE_EXTENSIONS}`);
        return;
      }
      if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setLocalError(`File is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
        return;
      }
      setFile(selectedFile);
      onFileChange(selectedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0] || null);
  };
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);


  const removeFile = () => {
    setFile(null);
    onFileChange(null);
    setLocalError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const hasError = error || localError;
  const borderColor = hasError ? 'border-danger' : isDragging ? 'border-primary' : 'border-slate-300 dark:border-slate-600';

  return (
    <div>
      <label className="block text-14px font-semibold text-slate-600 dark:text-slate-300 mb-1">Resume/CV</label>
      {file ? (
          <div className="flex items-center justify-between h-12 px-4 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl">
              <div className="flex items-center gap-2 text-16px text-slate-700 dark:text-slate-200 truncate">
                  <FileIcon />
                  <span className="truncate">{file.name}</span>
              </div>
              <button type="button" onClick={removeFile} className="text-slate-500 hover:text-danger p-1 rounded-full" aria-label="Remove file">
                  <CloseIcon size={18} />
              </button>
          </div>
      ) : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            className={`mt-1 flex justify-center items-center w-full h-[120px] px-6 border-2 ${borderColor} border-dashed rounded-xl transition-colors`}
          >
              <div className="space-y-1 text-center">
                  <UploadIcon />
                  <div className="flex text-16px text-slate-600 dark:text-slate-400">
                  <label htmlFor="resume" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                      <span>Upload a file</span>
                      <input ref={inputRef} id="resume" name="resume" type="file" className="sr-only" onChange={handleFileSelect} accept={ALLOWED_FILE_EXTENSIONS} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-12px text-slate-500 dark:text-slate-500">PDF, DOC, DOCX up to {MAX_FILE_SIZE_MB}MB</p>
              </div>
          </div>
      )}
      {hasError && <p className="mt-2 text-12px text-danger">{hasError}</p>}
    </div>
  );
};