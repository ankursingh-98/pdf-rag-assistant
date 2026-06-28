export interface ChunkVectorPayload {
  text: string;
  filename: string;
  page: number;
  chunkNumber: number;
  documentId: string;
}

export interface StoredVectorPoint {
  pointId: string;
  chunkNumber: number;
  page: number;
}

export interface VectorStorageResult {
  collectionName: string;
  storedCount: number;
  latencyMs: number;
  points: StoredVectorPoint[];
}
