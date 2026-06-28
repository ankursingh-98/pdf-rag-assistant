import { useCallback, useMemo, useState } from 'react';
import {
  askDocuments,
  getErrorMessage,
  searchDocuments,
  uploadPdfs,
} from '../services/api';
import type {
  AskResponse,
  SearchResponse,
  UploadedFileRecord,
} from '../types/api';

export function useDashboard() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileRecord[]>([]);
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);
  const [askResult, setAskResult] = useState<AskResponse | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo(() => {
    const totalChunks = uploadedFiles.reduce(
      (sum, file) => sum + file.chunking.chunkCount,
      0,
    );
    const totalEmbeddings = uploadedFiles.reduce(
      (sum, file) => sum + file.embeddings.chunkCount,
      0,
    );
    const totalStored = uploadedFiles.reduce(
      (sum, file) => sum + file.storage.storedCount,
      0,
    );
    const totalPages = uploadedFiles.reduce(
      (sum, file) => sum + file.extraction.pageCount,
      0,
    );

    return {
      fileCount: uploadedFiles.length,
      totalPages,
      totalChunks,
      totalEmbeddings,
      totalStored,
    };
  }, [uploadedFiles]);

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);

    if (fileArray.length === 0) {
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await uploadPdfs(fileArray);
      setUploadedFiles((current) => [...current, ...response.files]);
    } catch (uploadError) {
      setError(getErrorMessage(uploadError));
    } finally {
      setIsUploading(false);
    }
  }, []);

  const search = useCallback(async (question: string) => {
    const trimmed = question.trim();

    if (!trimmed) {
      setError('Enter a question to search.');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const response = await searchDocuments(trimmed);
      setSearchResult(response);
    } catch (searchError) {
      setError(getErrorMessage(searchError));
    } finally {
      setIsSearching(false);
    }
  }, []);

  const ask = useCallback(async (question: string) => {
    const trimmed = question.trim();

    if (!trimmed) {
      setError('Enter a question to ask.');
      return;
    }

    setIsAsking(true);
    setError(null);

    try {
      const response = await askDocuments(trimmed);
      setAskResult(response);
      setSearchResult({
        status: 'success',
        ...response.retrieval,
      });
    } catch (askError) {
      setError(getErrorMessage(askError));
    } finally {
      setIsAsking(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    uploadedFiles,
    searchResult,
    askResult,
    stats,
    isUploading,
    isSearching,
    isAsking,
    error,
    uploadFiles,
    search,
    ask,
    clearError,
  };
}
