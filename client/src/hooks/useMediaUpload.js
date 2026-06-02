/**
 * Media Upload Custom Hook
 * Handles file uploads via Axios with progress tracking.
 */
import { useState, useCallback } from 'react';
import api from '../services/api';

export function useMediaUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  /**
   * Uploads a file to the media endpoint.
   * @param {File} file - The file to upload
   * @param {string} roomId - The room this media belongs to
   * @returns {Promise<Object>} - The uploaded media record from server
   */
  const uploadFile = useCallback(async (file, roomId) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    if (roomId) {
      formData.append('roomId', roomId);
    }

    try {
      const response = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setProgress(percent);
        },
      });

      setUploading(false);
      setProgress(100);
      return { success: true, data: response.data.data };
    } catch (err) {
      const message = err.response?.data?.message || 'Upload failed';
      setError(message);
      setUploading(false);
      return { success: false, message };
    }
  }, []);

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  return { uploadFile, uploading, progress, error, reset };
}
