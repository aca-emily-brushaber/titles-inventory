"use client"

import { useState, useCallback } from "react"
import { IconMessageCircle, IconSend } from "@tabler/icons-react"
import { toast } from "sonner"

import type { TitleCommentRow } from "@/lib/titles/types"
import { addTitleComment, getTitleComments } from "@/lib/services/title.service"
import { getCurrentUser } from "@/lib/services/user.service"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

interface TitleCommentsProps {
  titleId: string
  comments: TitleCommentRow[]
  readOnly?: boolean
}

export function TitleComments({
  titleId,
  comments: initialComments,
  readOnly = false,
}: TitleCommentsProps) {
  const [comments, setComments] = useState(initialComments)
  const [draft, setDraft] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleAddComment = useCallback(async () => {
    const text = draft.trim()
    if (!text) return

    setSubmitting(true)
    try {
      const user = await getCurrentUser()
      if (!user) {
        toast.error("Unable to identify current user")
        return
      }
      await addTitleComment(titleId, text, user.name)
      const refreshed = await getTitleComments(titleId)
      setComments(refreshed)
      setDraft("")
      toast.info("Comment added")
    } catch {
      toast.error("Failed to add comment")
    } finally {
      setSubmitting(false)
    }
  }, [draft, titleId])

  return (
    <div className="glass-card rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <IconMessageCircle className="size-4 text-primary" />
        <div>
          <h2 className="text-sm font-semibold text-foreground">Comments</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {comments.length} comment{comments.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {!readOnly && (
        <div className="px-4 pt-3 pb-2 border-b border-border">
          <Textarea
            placeholder="Add a case note, observation, or flag for other analysts..."
            className="text-xs resize-none min-h-[72px] bg-background"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAddComment()
            }}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-muted-foreground">Ctrl+Enter to send</span>
            <Button
              size="sm"
              className="gap-1.5 h-7 text-xs"
              disabled={!draft.trim() || submitting}
              onClick={handleAddComment}
            >
              <IconSend className="size-3" />
              {submitting ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">
        {comments.map((c) => {
          const isSystem = c.author === "System"
          const initials = getInitials(c.author)
          return (
            <div key={c.id} className="flex items-start gap-3">
              <div
                className={cn(
                  "size-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5",
                  isSystem
                    ? "bg-muted text-muted-foreground border border-border"
                    : "bg-primary text-primary-foreground"
                )}
                aria-hidden
              >
                {initials}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xs font-semibold text-foreground">{c.author}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {new Date(c.timestamp).toLocaleString()}
                  </span>
                </div>
                <div
                  className={cn(
                    "rounded-md px-3 py-2 text-xs leading-relaxed",
                    isSystem
                      ? "bg-muted/50 text-muted-foreground border border-border"
                      : "bg-card border border-border text-foreground"
                  )}
                >
                  {c.text}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
