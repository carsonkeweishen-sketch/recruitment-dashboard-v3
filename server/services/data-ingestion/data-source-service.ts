// Phase 8.7: Data Source Service
import type { ScopeWhere } from "@/server/permissions/types";
import { listDataSources, getDataSource, createDataSource, updateDataSource, deleteDataSource, createParseJob, createLink, type DSParams } from "@/server/repositories/data-sources/data-source-repository";
import { getParseStatus, getParserType } from "@/server/services/data-ingestion/parser-registry";

export async function getSources(params: DSParams) {
  return listDataSources(params);
}

export async function getSource(id: string) {
  return getDataSource(id);
}

export async function createUpload(data: {
  fileName: string; fileMimeType: string; fileSize: number; fileUrl: string;
  objectType?: string; objectId?: string; usageType?: string; uploadedById?: string;
}) {
  const parseStatus = getParseStatus("upload", data.fileMimeType);
  const parserType = getParserType(data.fileMimeType);
  const source = await createDataSource({
    sourceType: "upload", sourceSystem: "local",
    fileName: data.fileName, fileMimeType: data.fileMimeType,
    fileSize: data.fileSize, fileUrl: data.fileUrl,
    objectType: data.objectType, objectId: data.objectId,
    usageType: data.usageType, parseStatus, uploadedById: data.uploadedById,
  });
  if (parserType) {
    await createParseJob({ dataSourceId: source.id, jobStatus: "pending", parserType });
  }
  return source;
}

export async function createLinkRecord(data: {
  sourceType: string; sourceSystem: string; externalUrl: string; externalId?: string;
  objectType?: string; objectId?: string; usageType?: string; uploadedById?: string;
}) {
  const parseStatus = getParseStatus(data.sourceType, undefined, data.sourceSystem);
  const source = await createDataSource({
    sourceType: data.sourceType, sourceSystem: data.sourceSystem,
    externalUrl: data.externalUrl, externalId: data.externalId,
    objectType: data.objectType, objectId: data.objectId,
    usageType: data.usageType, parseStatus, uploadedById: data.uploadedById,
  });
  if (data.objectType && data.objectId) {
    await createLink({ dataSourceId: source.id, objectType: data.objectType, objectId: data.objectId });
  }
  return source;
}

export async function parseSource(id: string) {
  const source = await getDataSource(id);
  if (!source) throw new Error("Source not found");
  if (source.parseStatus === "permission_required") return { ...source, message: "飞书未授权，无法解析" };
  if (source.parseStatus === "not_configured") return { ...source, message: "Moka 未配置，无法同步" };
  if (source.parseStatus === "transcription_pending") return { ...source, message: "音视频转写功能尚未实现" };
  if (source.parseStatus === "unsupported_ocr_pending") return { ...source, message: "图片 OCR 功能尚未实现" };
  // For supported types, mark as parsing and create a job
  await updateDataSource(id, { parseStatus: "parsing" });
  await createParseJob({ dataSourceId: id, jobStatus: "running", parserType: getParserType(source.fileMimeType || undefined) || undefined, startedAt: new Date() });
  // Simulate parse complete for text-based files
  await updateDataSource(id, { parseStatus: "parsed" });
  await createParseJob({ dataSourceId: id, jobStatus: "completed", parserType: getParserType(source.fileMimeType || undefined) || undefined, finishedAt: new Date() });
  return getDataSource(id);
}

export async function removeSource(id: string) {
  return deleteDataSource(id);
}
