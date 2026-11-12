import { beforeEach, describe, expect, it, vi } from "vitest"

const post = vi.fn()
vi.mock("@/lib/axiosInstance", async () => (await import("@/lib/testing/axiosInstance")).axiosInstanceModule({ default: { post: (...args: unknown[]) => post(...args) } }))

import { searchReferences } from "./referenceMentionList"

const WORK_ITEMS = ["doc", "board", "task", "project"] as const

const fileHit = {
  type: "attachment",
  attachment: { attachment_id: "att-1", attachment_file_name: "logo-cafe-aroma.png", attachment_doc_id: "node-1", attachment_doc_title: "logo-cafe-aroma.png" },
}
const taskFileHit = { type: "attachment", attachment: { attachment_id: "att-2", attachment_file_name: "brief.pdf" } }
const pageHit = { type: "doc", doc: { doc_uuid: "doc-1", doc_title: "Brand book", doc_created_by_user_full_name: "Ana Rojas" } }

function answer(page: unknown[]) {
  post.mockResolvedValue({ data: { data: { page } } })
}

describe("the + picker's search", () => {
  beforeEach(() => post.mockReset())

  it("offers a file from Docs & Files as a link to its node", async () => {
    answer([fileHit])
    expect(await searchReferences("logo", [...WORK_ITEMS])).toEqual([{ routeId: "node-1", label: "logo-cafe-aroma.png", refType: "doc", subtitle: "File" }])
  })

  it("names the page a file sits in when it is not a file of its own", async () => {
    answer([{ type: "attachment", attachment: { attachment_id: "att-3", attachment_file_name: "foto.jpg", attachment_doc_id: "page-9", attachment_doc_title: "Acta 12 nov" } }])
    expect(await searchReferences("foto", [...WORK_ITEMS])).toEqual([{ routeId: "page-9", label: "foto.jpg", refType: "doc", subtitle: "File · in Acta 12 nov" }])
  })

  it("leaves out a file that lives in no doc, such as a task's", async () => {
    answer([taskFileHit])
    expect(await searchReferences("brief", [...WORK_ITEMS])).toEqual([])
  })

  it("leaves files out of the # channel picker", async () => {
    answer([fileHit])
    expect(await searchReferences("logo", ["channel"])).toEqual([])
  })

  it("still offers a page as before", async () => {
    answer([pageHit, fileHit])
    expect(await searchReferences("brand", [...WORK_ITEMS])).toEqual([
      { routeId: "doc-1", label: "Brand book", refType: "doc", subtitle: "Doc · Ana Rojas" },
      { routeId: "node-1", label: "logo-cafe-aroma.png", refType: "doc", subtitle: "File" },
    ])
  })
})
