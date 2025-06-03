import { createWorker, PSM, OEM } from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  words: Array<{
    text: string;
    confidence: number;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  }>;
}

export interface ExtractedProductInfo {
  name?: string;
  price?: string;
  barcode?: string;
  brand?: string;
  weight?: string;
  description?: string;
}

class OCRService {
  private worker: Tesseract.Worker | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    this.worker = await createWorker('eng');
    await this.worker.setParameters({
      tessedit_pageseg_mode: PSM.SPARSE_TEXT,
      tessedit_ocr_engine_mode: OEM.LSTM_ONLY,
    });

    this.isInitialized = true;
  }

  async extractText(imageData: string): Promise<OCRResult> {
    if (!this.worker) {
      await this.initialize();
    }

    if (!this.worker) {
      throw new Error('OCR worker failed to initialize');
    }

    const { data } = await this.worker.recognize(imageData);

    return {
      text: data.text,
      confidence: data.confidence,
      words: data.words.map(word => ({
        text: word.text,
        confidence: word.confidence,
        bbox: word.bbox,
      })),
    };
  }

  extractProductInfo(ocrResult: OCRResult): ExtractedProductInfo {
    const text = ocrResult.text.toLowerCase();
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const words = ocrResult.words;

    const extracted: ExtractedProductInfo = {};

    // Extract price patterns
    const pricePatterns = [
      /\$(\d+\.?\d*)/g,
      /(\d+\.?\d*)\s*\$/g,
      /price[\s:]*\$?(\d+\.?\d*)/gi,
      /(\d+\.\d{2})/g,
    ];

    for (const pattern of pricePatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        const priceMatch = matches[0].match(/(\d+\.?\d*)/);
        if (priceMatch) {
          extracted.price = `$${priceMatch[1]}`;
          break;
        }
      }
    }

    // Extract barcode patterns (UPC, EAN)
    const barcodePatterns = [
      /\b\d{12,14}\b/g, // UPC/EAN
      /\b\d{8}\b/g,     // EAN-8
    ];

    for (const pattern of barcodePatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        extracted.barcode = matches[0];
        break;
      }
    }

    // Extract product name (usually the longest meaningful text line)
    const meaningfulLines = lines.filter(line => {
      const trimmed = line.trim();
      return (
        trimmed.length > 3 &&
        !trimmed.match(/^\d+\.?\d*$/) && // Not just numbers
        !trimmed.match(/^\$\d+/) &&     // Not just price
        !trimmed.match(/^\d{8,}$/)      // Not just barcode
      );
    });

    if (meaningfulLines.length > 0) {
      // Take the longest line as potential product name
      const longestLine = meaningfulLines.reduce((a, b) => 
        a.length > b.length ? a : b
      );
      extracted.name = this.capitalizeWords(longestLine.trim());
    }

    // Extract weight patterns
    const weightPatterns = [
      /(\d+\.?\d*)\s*(oz|ounce|ounces)/gi,
      /(\d+\.?\d*)\s*(lb|lbs|pound|pounds)/gi,
      /(\d+\.?\d*)\s*(g|gram|grams)/gi,
      /(\d+\.?\d*)\s*(kg|kilogram|kilograms)/gi,
      /(\d+\.?\d*)\s*(ml|milliliter|milliliters)/gi,
      /(\d+\.?\d*)\s*(l|liter|liters)/gi,
    ];

    for (const pattern of weightPatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        extracted.weight = matches[0];
        break;
      }
    }

    // Extract brand (often appears near the top)
    const topWords = words.slice(0, Math.min(10, words.length));
    const brandCandidates = topWords
      .filter(word => word.confidence > 70 && word.text.length > 2)
      .map(word => word.text);

    if (brandCandidates.length > 0) {
      extracted.brand = this.capitalizeWords(brandCandidates[0]);
    }

    return extracted;
  }

  private capitalizeWords(text: string): string {
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }
}

export const ocrService = new OCRService();

export async function extractProductFromImage(imageData: string): Promise<ExtractedProductInfo> {
  try {
    const ocrResult = await ocrService.extractText(imageData);
    return ocrService.extractProductInfo(ocrResult);
  } catch (error) {
    console.error('OCR extraction failed:', error);
    throw new Error('Failed to extract product information from image');
  }
}
