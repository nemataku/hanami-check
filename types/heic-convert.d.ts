// types/heic-convert.d.ts
declare module "heic-convert" {
  type HeicConvertFormat = "JPEG" | "PNG";

  export interface HeicConvertOptions {
    buffer: Buffer | Uint8Array | ArrayBuffer;
    format?: HeicConvertFormat;
    quality?: number;
  }

  const heicConvert: (options: HeicConvertOptions) => Promise<Buffer>;
  export default heicConvert;
}