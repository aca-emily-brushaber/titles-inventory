"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v4"
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconArrowUp,
  IconArrowDown,
  IconArrowsUpDown,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { getProvider } from "@/lib/data-provider"
import { getUsers } from "@/lib/services/user.service"
import type { Database } from "@/lib/database.types"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type UserRow = Database["public"]["Tables"]["users"]["Row"]
type UserRole = UserRow["role"]

const ROLE_CLASSES: Record<UserRole, string> = {
  Analyst: "bg-status-green text-white",
  Lead: "bg-primary text-white",
  Manager: "bg-status-amber text-white",
}

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["Analyst", "Lead", "Manager"]),
})

type UserFormValues = z.infer<typeof userSchema>

function SortIcon({ isSorted }: { isSorted: false | "asc" | "desc" }) {
  if (isSorted === "asc") return <IconArrowUp className="size-3.5" />
  if (isSorted === "desc") return <IconArrowDown className="size-3.5" />
  return <IconArrowsUpDown className="size-3.5 text-muted-foreground/50" />
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editUser, setEditUser] = useState<UserRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: "", email: "", role: "Analyst" },
  })

  const loadUsers = useCallback(async () => {
    try {
      const data = await getUsers()
      setUsers(data)
    } catch {
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  function openNewDialog() {
    setEditUser(null)
    form.reset({ name: "", email: "", role: "Analyst" })
    setDialogOpen(true)
  }

  const openEditDialog = useCallback((user: UserRow) => {
    setEditUser(user)
    form.reset({ name: user.name, email: user.email, role: user.role })
    setDialogOpen(true)
  }, [form])

  async function onSubmit(values: UserFormValues) {
    setSubmitting(true)
    try {
      const provider = getProvider()

      if (editUser) {
        if (editUser.email !== values.email) {
          const exists = await provider.users.emailExists(values.email, editUser.id)
          if (exists) {
            toast.error("A user with this email already exists")
            return
          }
        }
        await provider.users.update(editUser.id, values)
        toast.success("User updated", {
          description: `${values.name} has been updated.`,
        })
      } else {
        const exists = await provider.users.emailExists(values.email)
        if (exists) {
          toast.error("A user with this email already exists")
          return
        }
        await provider.users.create(values)
        toast.success("User created", {
          description: `${values.name} has been added.`,
        })
      }

      setDialogOpen(false)
      await loadUsers()
    } catch {
      toast.error("Failed to save user")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      const result = await getProvider().users.delete(deleteTarget.id)
      if (result.error) {
        toast.error("Cannot delete user", {
          description: result.error,
        })
        setDeleteTarget(null)
        return
      }
      toast.success("User removed", {
        description: `${deleteTarget.name} has been removed.`,
      })
      setDeleteTarget(null)
      await loadUsers()
    } catch {
      toast.error("Failed to delete user")
    }
  }

  const columns = useMemo<ColumnDef<UserRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
              {row.original.avatar_initials}
            </div>
            <span className="font-medium">{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <Badge className={ROLE_CLASSES[row.original.role] ?? ""}>
            {row.original.role}
          </Badge>
        ),
        size: 120,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                openEditDialog(row.original)
              }}
            >
              <IconPencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                setDeleteTarget(row.original)
              }}
            >
              <IconTrash className="size-4" />
            </Button>
          </div>
        ),
        size: 100,
        enableSorting: false,
      },
    ],
    [openEditDialog]
  )

  const table = useReactTable({
    data: users,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.id,
    initialState: { pagination: { pageSize: 10 } },
  })

  const pageIndex = table.getState().pagination.pageIndex
  const pageCount = table.getPageCount()

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">User Management</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage analysts and team members
          </p>
        </div>
        <Button onClick={openNewDialog}>
          <IconPlus className="size-4" />
          Add User
        </Button>
      </div>

      <div className="rounded-md border bg-background overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className={
                      header.column.getCanSort()
                        ? "cursor-pointer select-none"
                        : ""
                    }
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <span className="flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {header.column.getCanSort() && (
                        <SortIcon isSorted={header.column.getIsSorted()} />
                      )}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Loading users...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No users found. Add a user to get started.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {pageIndex + 1} of {pageCount}
            {" \u00B7 "}
            {users.length} user{users.length !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
            >
              <IconChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
            >
              <IconChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editUser ? "Edit User" : "Add User"}
            </DialogTitle>
            <DialogDescription>
              {editUser
                ? "Update user details below."
                : "Fill in the details to create a new user."}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="user-name">Name</Label>
              <Input
                id="user-name"
                placeholder="Full name"
                {...form.register("name")}
                aria-invalid={!!form.formState.errors.name}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                placeholder="user@example.com"
                {...form.register("email")}
                aria-invalid={!!form.formState.errors.email}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="user-role">Role</Label>
              <Select
                value={form.watch("role")}
                onValueChange={(val) =>
                  form.setValue("role", val as UserRole, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Analyst">Analyst</SelectItem>
                  <SelectItem value="Lead">Lead</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.role && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.role.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? "Saving..."
                  : editUser
                    ? "Update"
                    : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong>{deleteTarget?.name}</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
