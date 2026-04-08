import { notFound } from "next/navigation"

import {
  getTitleById,
  getTitleComments,
  getTitleDocuments,
  getTitleTransfers,
} from "@/lib/services/title.service"
import { TitleDetailClient } from "./title-detail-client"

export default async function TitleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const title = await getTitleById(id)
  if (!title) {
    notFound()
  }

  const [comments, documents, transfers] = await Promise.all([
    getTitleComments(id),
    getTitleDocuments(id),
    getTitleTransfers(id),
  ])

  return (
    <TitleDetailClient title={title} comments={comments} documents={documents} transfers={transfers} />
  )
}
