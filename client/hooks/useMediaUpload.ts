import { useState, useCallback } from 'react';
import api from '../lib/api';

export function useMediaUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * Uploads a file to the media endpoint.
   */
  const uploadFile = useCallback(async (file: File, roomId?: string) => {
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
    } catch (err: any) {
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
