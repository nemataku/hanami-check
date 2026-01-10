declare module "heic-convert" {
  export type HeicConvertFormat = "JPEG" | "PNG";

  export interface HeicConvertOptions {
    buffer: Buffer | Uint8Array | ArrayBuffer;
    format?: HeicConvertFormat;
    quality?: number; // 0..1 or 0..100 を許容
  }

  const heicConvert: (options: HeicConvertOptions) => Promise<Buffer>;
  export default heicConvert;
}