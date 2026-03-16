import { ExtendClient } from "extend-ai";
import type { Extend } from "extend-ai";

let client: ExtendClient | null = null;

function getClient(): ExtendClient | null {
  if (!process.env.EXTEND_API_KEY) return null;
  if (!client) {
    client = new ExtendClient({ token: process.env.EXTEND_API_KEY });
  }
  return client;
}

export function isExtendConfigured(): boolean {
  return !!process.env.EXTEND_API_KEY;
}

/**
 * Upload a file buffer to Extend and return the file ID.
 */
export async function uploadToExtend(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ fileId: string }> {
  const extendClient = getClient();
  if (!extendClient) throw new Error("Extend.ai not configured");

  // Use ArrayBuffer copy to avoid TypeScript's Buffer/BlobPart incompatibility
  const ab = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
  const blob = new Blob([ab], { type: mimeType });
  const file = new File([blob], fileName, { type: mimeType });

  const uploaded = await extendClient.files.upload(file);
  return { fileId: uploaded.id };
}

/**
 * Parse an uploaded file (by Extend file ID) into structured text chunks.
 * Returns markdown content per page/section.
 */
export async function parseFile(fileId: string): Promise<{
  chunks: Array<{ content: string; type: string; pageNumber?: number }>;
  pageCount: number;
  fullText: string;
}> {
  const extendClient = getClient();
  if (!extendClient) throw new Error("Extend.ai not configured");

  const parseRun = await extendClient.parseRuns.createAndPoll(
    {
      file: { id: fileId },
      config: {
        target: "markdown",
        chunkingStrategy: { type: "page" },
      },
    },
    {
      maxWaitMs: 120_000, // 2 minute timeout
      initialDelayMs: 1_000,
      maxDelayMs: 10_000,
    }
  );

  if (parseRun.status !== "PROCESSED" || !parseRun.output) {
    throw new Error(
      `Parse failed: ${parseRun.status} — ${"failureMessage" in parseRun ? String(parseRun.failureMessage) : "Unknown error"}`
    );
  }

  const chunks = parseRun.output.chunks.map((chunk: Extend.Chunk) => ({
    content: chunk.content,
    type: chunk.type,
    pageNumber: chunk.metadata?.pageRange?.start,
  }));

  const fullText = chunks.map((c) => c.content).join("\n\n");
  const pageNumbers = chunks
    .map((c) => c.pageNumber)
    .filter((n): n is number => typeof n === "number");
  const pageCount = pageNumbers.length > 0 ? Math.max(...pageNumbers) : chunks.length;

  return { chunks, pageCount, fullText };
}

/**
 * Upload and parse in a single call. Convenience wrapper.
 */
export async function uploadAndParse(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{
  fileId: string;
  chunks: Array<{ content: string; type: string; pageNumber?: number }>;
  pageCount: number;
  fullText: string;
}> {
  const { fileId } = await uploadToExtend(buffer, fileName, mimeType);
  const parsed = await parseFile(fileId);
  return { fileId, ...parsed };
}
