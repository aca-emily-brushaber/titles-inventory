import { getProvider } from "@/lib/data-provider"
import type { AssignmentGroup } from "@/lib/titles/assignment-groups"
import type { TitleRow, TitleTransferRow, TitleCommentRow } from "@/lib/titles/types"
import type { DocumentRow } from "@/lib/data-provider"

export async function getTitles(): Promise<TitleRow[]> {
  return getProvider().titles.getAll()
}

export async function getTitleById(id: string): Promise<TitleRow | null> {
  return getProvider().titles.getById(id)
}

export async function assignTitles(titleIds: string[], analystName: string | null): Promise<void> {
  return getProvider().titles.assignBulk(titleIds, analystName)
}

export async function transferTitleAssignmentGroup(
  titleId: string,
  fromGroup: AssignmentGroup,
  toGroup: AssignmentGroup,
  transferredBy: string,
  reason: string
): Promise<void> {
  return getProvider().titles.createTransfer({
    titleId,
    fromGroup,
    toGroup,
    transferredBy,
    reason,
  })
}

export async function getTitleComments(titleId: string): Promise<TitleCommentRow[]> {
  return getProvider().titles.getComments(titleId)
}

export async function addTitleComment(titleId: string, text: string, author: string): Promise<void> {
  return getProvider().titles.addComment(titleId, text, author)
}

export async function getTitleDocuments(titleId: string): Promise<DocumentRow[]> {
  return getProvider().titles.getDocuments(titleId)
}

export async function getTitleTransfers(titleId: string): Promise<TitleTransferRow[]> {
  return getProvider().titles.getTransfers(titleId)
}

export async function lockTitle(titleId: string): Promise<void> {
  return getProvider().titles.lock(titleId)
}

export async function unlockTitle(titleId: string): Promise<void> {
  return getProvider().titles.unlock(titleId)
}
