import { useState, useCallback } from 'react';
import { validateFile } from '../utils/fileUtils';
import { formatFileSize } from '../utils/fileUtils';

/**
 * Hook for managing file upload state and validation.
 *
 * Handles file selection (click + drag-and-drop), validation,
 * and exposes file metadata for UI display.
 *
 * @returns {{
 *   file: File | null,
 *   fileName: string,
 *   fileSize: string,
 *   error: string,
 *   isDragging: boolean,
 *   handleFileSelect: (e: Event) => void,
 *   handleDrop: (e: DragEvent) => void,
 *   handleDragOver: (e: DragEvent) => void,
 *   handleDragLeave: (e: DragEvent) => void,
 *   clearFile: () => void,
 * }}
 */
export function useFileUpload() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback((selectedFile) => {
    setError('');

    const validation = validateFile(selectedFile);
    if (!validation.valid) {
      setError(validation.error);
      setFile(null);
      setFileName('');
      setFileSize('');
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
    setFileSize(formatFileSize(selectedFile.size));
  }, []);

  const handleFileSelect = useCallback(
    (e) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        processFile(selectedFile);
      }
    },
    [processFile],
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files?.[0];
      if (droppedFile) {
        processFile(droppedFile);
      }
    },
    [processFile],
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
    setFileName('');
    setFileSize('');
    setError('');
  }, []);

  return {
    file,
    fileName,
    fileSize,
    error,
    isDragging,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    clearFile,
  };
}
