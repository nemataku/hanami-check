// src/types/heic-convert.d.ts

declare module "heic-convert" {
  export interface HeicConvertInput {
    buffer: Buffer | ArrayBuffer | Uint8Array;
    format: "JPEG" | "PNG";
    quality?: number;
  }

  /**
   * Convert HEIC/HEIF image buffer to JPEG or PNG
   */
  export default function heicConvert(
    input: HeicConvertInput
  ): Promise<Buffer | ArrayBuffer | Uint8Array>;
}