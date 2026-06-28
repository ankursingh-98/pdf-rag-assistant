export function splitTextWithOverlap(
  text: string,
  chunkSize: number,
  overlap: number,
): string[] {
  const normalized = text.trim();

  if (!normalized) {
    return [];
  }

  if (normalized.length <= chunkSize) {
    return [normalized];
  }

  if (overlap >= chunkSize) {
    throw new Error('Overlap must be smaller than chunk size.');
  }

  const chunks: string[] = [];
  const step = chunkSize - overlap;
  let start = 0;

  while (start < normalized.length) {
    chunks.push(normalized.slice(start, start + chunkSize));

    if (start + chunkSize >= normalized.length) {
      break;
    }

    start += step;
  }

  return chunks;
}
