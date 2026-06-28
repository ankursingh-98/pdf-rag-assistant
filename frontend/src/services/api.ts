import axios from 'axios';
import type { AskResponse, SearchResponse, UploadResponse } from '../types/api';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});

export async function uploadPdfs(files: File[]): Promise<UploadResponse> {
  const formData = new FormData();

  for (const file of files) {
    formData.append('files', file);
  }

  const { data } = await api.post<UploadResponse>('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data;
}

export async function searchDocuments(
  question: string,
): Promise<SearchResponse> {
  const { data } = await api.post<SearchResponse>('/search', { question });
  return data;
}

export async function askDocuments(question: string): Promise<AskResponse> {
  const { data } = await api.post<AskResponse>('/ask', { question });
  return data;
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string') {
      return message;
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}
