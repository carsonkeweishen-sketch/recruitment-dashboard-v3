// Phase 8.7: Parser Registry — honest parse status, no fake parsing
export function getParseStatus(sourceType: string, fileMimeType?: string, sourceSystem?: string): string {
  if (sourceType === "feishu_link") return "permission_required";
  if (sourceType === "moka_link") return "not_configured";

  const mime = (fileMimeType || "").toLowerCase();

  // Document parsers (supported)
  if (mime.includes("pdf") || mime.includes("msword") || mime.includes("officedocument") ||
      mime.includes("text/plain") || mime.includes("markdown") || mime.includes("html") ||
      mime.includes("rtf")) {
    return "parsing";
  }

  // Spreadsheet parsers (supported)
  if (mime.includes("spreadsheet") || mime.includes("excel") || mime.includes("csv")) {
    return "parsing";
  }

  // Images — no OCR, honest pending
  if (mime.includes("image/png") || mime.includes("image/jpeg") || mime.includes("image/webp")) {
    return "unsupported_ocr_pending";
  }

  // Audio — no transcription, honest pending
  if (mime.includes("audio/mpeg") || mime.includes("audio/wav") ||
      mime.includes("audio/mp4") || mime.includes("audio/aac") || mime.includes("audio/x-m4a")) {
    return "transcription_pending";
  }

  // Video — no transcription, honest pending
  if (mime.includes("video/mp4") || mime.includes("video/quicktime") || mime.includes("video/webm")) {
    return "transcription_pending";
  }

  return "unsupported";
}

export function getParserType(fileMimeType?: string): string | null {
  const mime = (fileMimeType || "").toLowerCase();
  if (mime.includes("pdf")) return "pdf_parser";
  if (mime.includes("doc")) return "docx_parser";
  if (mime.includes("text") || mime.includes("markdown") || mime.includes("html")) return "text_parser";
  if (mime.includes("spreadsheet") || mime.includes("excel") || mime.includes("csv")) return "spreadsheet_parser";
  return null;
}
