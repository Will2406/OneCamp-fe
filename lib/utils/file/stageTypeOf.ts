import { getAttachmentType } from "@/lib/utils/file/getAttachmentType"
import type { AttachmentType } from "@/types/attachment"

/**
 * What a file is drawn as, from its name and then its media type: the
 * preview's stage and a folder's grid read it the same way. Pure.
 */
export function stageTypeOf(name: string, mime?: string): AttachmentType {
  const byName = getAttachmentType(name)
  if (byName !== "other") return byName
  const m = (mime ?? "").toLowerCase()
  if (m.startsWith("image/")) return "image"
  if (m.startsWith("video/")) return "video"
  if (m.startsWith("audio/")) return "audio"
  return m ? "document" : "other"
}
