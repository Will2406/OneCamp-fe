"use client"

// A folder's contents as cards (Toast): the grid a folder of photos wants.
// A file is the project files' card (components/project/fileCard), an image
// with its own picture; a folder, a page or a link is a card of the same size
// with its mark. Each opens the way its row does in the list.

import * as React from "react"

import { DocIcon } from "@/components/docEditor/DocIcon"
import { NodeMark, markOfRow } from "@/components/docFiles/NodeMark"
import { FileCard } from "@/components/project/fileCard"
import { linkSite } from "@/lib/docs/docNode"
import { shortDate } from "@/lib/utils/date/shortDate"
import { stageTypeOf } from "@/lib/utils/file/stageTypeOf"
import { versionFileKey } from "@/services/docFilesService"
import type { DocTreeRow } from "@/services/docGraphService"
import type { AttachmentMediaReq } from "@/types/attachment"
import type { DocFileFacts } from "@/types/docGraph"

/** A file node, in the shape the file card reads. Pure. */
export function cardFileOf(row: DocTreeRow, file: DocFileFacts): AttachmentMediaReq {
  return {
    attachment_uuid: file.attachment_id,
    attachment_file_name: file.name || row.title,
    attachment_type: stageTypeOf(file.name || row.title, file.mime),
    attachment_size: file.size_bytes,
    attachment_created_at: row.node.updated_at ?? "",
    attachment_raw_type: file.mime,
  }
}

const KIND_LABEL: Record<string, string> = { folder: "Folder", link: "Link" }

/** What a card that isn't a file says under its name: "Folder · 9 Oct", or a link's site. */
function detailOf(row: DocTreeRow): string {
  const n = row.node
  if (n.node_kind === "link") return linkSite(n.link_url)
  const when = n.updated_at ? new Date(n.updated_at) : null
  const date = when && !isNaN(when.getTime()) ? shortDate(when) : ""
  return [KIND_LABEL[n.node_kind ?? ""] ?? "Page", date].filter(Boolean).join(" · ")
}

/** A folder, a page or a link, as a card the size of a file's. */
function NodeCard({ row, onOpen }: { row: DocTreeRow; onOpen: () => void }) {
  const title = row.title.trim() || (row.node.node_kind === "folder" ? "Untitled folder" : "Untitled")
  return (
    <div
      data-node-card={row.node.node_kind ?? "page"}
      className="group relative flex h-44 flex-col overflow-hidden rounded-xl bg-raised shadow-e1 transition-[translate,box-shadow] duration-[140ms] ease-[var(--ease-out)] hover:-translate-y-px hover:shadow-e2 focus-within:shadow-e2 motion-reduce:hover:translate-y-0"
    >
      <div aria-hidden="true" className="flex h-28 shrink-0 items-center justify-center bg-sunken">
        {row.node.node_kind ? <NodeMark node={markOfRow(row.node)} size={40} /> : <DocIcon icon={row.node.icon} id={row.id} size={40} />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 px-3 py-2.5">
        <button
          type="button"
          onClick={onOpen}
          title={title}
          aria-label={title}
          className="min-w-0 truncate rounded-sm text-left text-ui-sm font-medium text-ink outline-none after:absolute after:inset-0 focus-visible:ring-2 focus-visible:ring-brand"
        >
          {title}
        </button>
        <span className="truncate text-meta text-ink-3 tabular-nums">{detailOf(row)}</span>
      </div>
    </div>
  )
}

/**
 * A folder's top level as a grid of 176 px cards, the project files' layout.
 * `hidden` children (more than the page reads, or ones the viewer can't open)
 * are counted under the cards; List shows the rest.
 */
export function FolderGrid({ rows, more, onOpen, onShowList }: { rows: DocTreeRow[]; more: number; onOpen: (row: DocTreeRow) => void; onShowList: () => void }) {
  return (
    <div data-folder-grid="">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(176px,1fr))] gap-4">
        {rows.map((row) =>
          row.node.node_kind === "file" && row.node.file ? (
            <FileCard key={row.id} file={cardFileOf(row, row.node.file)} mediaPath={versionFileKey(row.id, row.node.file.attachment_id)} onOpen={() => onOpen(row)} />
          ) : (
            <NodeCard key={row.id} row={row} onOpen={() => onOpen(row)} />
          ),
        )}
      </div>
      {more > 0 ? (
        <p className="mt-4 text-meta text-ink-3">
          {more} more not shown here.{" "}
          <button type="button" onClick={onShowList} className="font-medium text-brand underline-offset-2 hover:underline">
            Show the list
          </button>
        </p>
      ) : null}
    </div>
  )
}
