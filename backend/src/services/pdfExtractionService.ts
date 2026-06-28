import pdfParse from 'pdf-parse';
import {
  fileRepository,
  type FileRepository,
} from '../repositories/fileRepository.js';
import type { IPdfExtractionService } from '../interfaces/IPdfExtractionService.js';
import { AppError } from '../types/errors.js';
import type { ExtractedPage, PdfExtractionResult } from '../types/upload.js';

type PdfPageData = {
  getTextContent: (options?: {
    normalizeWhitespace?: boolean;
    disableCombineTextItems?: boolean;
  }) => Promise<{
    items: Array<{ str: string; transform: number[] }>;
  }>;
};

async function extractPageText(pageData: PdfPageData): Promise<string> {
  const textContent = await pageData.getTextContent({
    normalizeWhitespace: false,
    disableCombineTextItems: false,
  });

  let lastY: number | undefined;
  let text = '';

  for (const item of textContent.items) {
    const currentY = item.transform[5];

    if (lastY === currentY || lastY === undefined) {
      text += item.str;
    } else {
      text += `\n${item.str}`;
    }

    lastY = currentY;
  }

  return text.trim();
}

export class PdfExtractionService implements IPdfExtractionService {
  constructor(private readonly files: FileRepository = fileRepository) {}

  async extractFromStoredFile(storedFilename: string): Promise<PdfExtractionResult> {
    const buffer = await this.files.readFileBuffer(storedFilename);
    const pages: ExtractedPage[] = [];
    let pageNumber = 0;

    try {
      const parsed = await pdfParse(buffer, {
        pagerender: async (pageData: PdfPageData) => {
          pageNumber += 1;
          const pageText = await extractPageText(pageData);

          pages.push({
            pageNumber,
            text: pageText,
            characterCount: pageText.length,
          });

          return pageText;
        },
      });

      const fullText = parsed.text.trim();

      return {
        pageCount: parsed.numpages,
        text: fullText,
        characterCount: fullText.length,
        pages,
      };
    } catch {
      throw new AppError(400, `Failed to extract text from "${storedFilename}".`);
    }
  }
}

export const pdfExtractionService = new PdfExtractionService();
