"use client"

import { useState } from "react"
import {
  Bell,
  Send,
  FileText,
  Download,
  Clock,
  Trash2,
  Plus,
  X,
  Upload,
  Paperclip,
  Eye,
  Users,
  GraduationCap,
  BookOpen,
  Shield,
  Filter,
  CheckCheck,
  AlertCircle,
  Info,
  Megaphone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { UserRole } from "./auth-context"

type NotificationType = "announcement" | "assignment" | "resource" | "alert"

interface Attachment {
  name: string
  size: string
  type: string
}

interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  sender: string
  senderRole: "faculty" | "admin"
  date: string
  time: string
  read: boolean
  attachments: Attachment[]
  audience: "all" | "students" | "faculty"
}

const typeConfig: Record<
  NotificationType,
  { icon: typeof Bell; color: string; bg: string; label: string }
> = {
  announcement: {
    icon: Megaphone,
    color: "text-sky-400",
    bg: "bg-sky-500/15",
    label: "Announcement",
  },
  assignment: {
    icon: FileText,
    color: "text-amber-400",
    bg: "bg-amber-500/15",
    label: "Assignment",
  },
  resource: {
    icon: Download,
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
    label: "Resource",
  },
  alert: {
    icon: AlertCircle,
    color: "text-red-400",
    bg: "bg-red-500/15",
    label: "Alert",
  },
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    title: "Mid-Semester Examination Schedule Released",
    message:
      "The mid-semester examination schedule for all departments has been finalized. Please download the attached PDF for detailed timings, room allocations, and exam guidelines. Students must carry their ID cards.",
    type: "announcement",
    sender: "Rajesh Kumar",
    senderRole: "admin",
    date: "2026-02-18",
    time: "09:30 AM",
    read: false,
    attachments: [
      { name: "MidSem_Schedule_2026.pdf", size: "1.2 MB", type: "pdf" },
      { name: "Exam_Guidelines.pdf", size: "540 KB", type: "pdf" },
    ],
    audience: "all",
  },
  {
    id: "2",
    title: "Assignment 3: Laplace Transforms - Due Feb 25",
    message:
      "Submit your solutions for Assignment 3 covering Laplace Transform properties, inverse transforms, and applications to differential equations. Reference material and problem set attached below.",
    type: "assignment",
    sender: "Dr. Priya Nair",
    senderRole: "faculty",
    date: "2026-02-17",
    time: "02:15 PM",
    read: false,
    attachments: [
      { name: "Assignment_3_Problems.pdf", size: "890 KB", type: "pdf" },
      { name: "Reference_Notes.pdf", size: "2.1 MB", type: "pdf" },
    ],
    audience: "students",
  },
  {
    id: "3",
    title: "New Research Paper Database Access",
    message:
      "The university has subscribed to IEEE Xplore and Springer Nature databases. All students and faculty can now access these resources through the campus network or VPN. Setup guide attached.",
    type: "resource",
    sender: "Rajesh Kumar",
    senderRole: "admin",
    date: "2026-02-16",
    time: "11:00 AM",
    read: true,
    attachments: [
      { name: "VPN_Setup_Guide.pdf", size: "320 KB", type: "pdf" },
    ],
    audience: "all",
  },
  {
    id: "4",
    title: "DSA Lab 4: Binary Search Trees - Updated",
    message:
      "Lab 4 has been updated with additional test cases and a bonus problem on AVL tree rotations. Please re-download the lab manual. Submission deadline remains unchanged.",
    type: "assignment",
    sender: "Dr. Priya Nair",
    senderRole: "faculty",
    date: "2026-02-15",
    time: "04:45 PM",
    read: true,
    attachments: [
      { name: "Lab4_BST_Updated.pdf", size: "1.5 MB", type: "pdf" },
      { name: "Test_Cases.zip", size: "450 KB", type: "zip" },
    ],
    audience: "students",
  },
  {
    id: "5",
    title: "Campus Network Maintenance - Feb 20",
    message:
      "Scheduled maintenance on campus Wi-Fi and LAN infrastructure on February 20th, 10:00 PM to 4:00 AM. Internet access will be intermittent during this period. Please plan accordingly.",
    type: "alert",
    sender: "Rajesh Kumar",
    senderRole: "admin",
    date: "2026-02-14",
    time: "10:00 AM",
    read: true,
    attachments: [],
    audience: "all",
  },
  {
    id: "6",
    title: "Guest Lecture: AI in Healthcare - Feb 22",
    message:
      "Prof. Anand Rao from IIT Bombay will deliver a guest lecture on applications of AI in healthcare diagnostics. Venue: Main Auditorium, 3:00 PM. All students are encouraged to attend. Registration form attached.",
    type: "announcement",
    sender: "Dr. Priya Nair",
    senderRole: "faculty",
    date: "2026-02-13",
    time: "09:00 AM",
    read: true,
    attachments: [
      { name: "Guest_Lecture_Registration.pdf", size: "180 KB", type: "pdf" },
    ],
    audience: "all",
  },
]

export function NotificationsView({ userRole }: { userRole: UserRole }) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null)
  const [filterType, setFilterType] = useState<string>("all")
  const [showCompose, setShowCompose] = useState(false)

  const canPush = userRole === "faculty" || userRole === "admin"

  const unreadCount = notifications.filter((n) => !n.read).length

  const filteredNotifications =
    filterType === "all"
      ? notifications
      : filterType === "unread"
        ? notifications.filter((n) => !n.read)
        : notifications.filter((n) => n.type === filterType)

  const handleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    const notif = notifications.find((n) => n.id === id)
    if (notif) {
      setSelectedNotification({ ...notif, read: true })
    }
  }

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    if (selectedNotification?.id === id) {
      setSelectedNotification(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 glow-sm">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground text-balance">
              Notifications
            </h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "All caught up"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="gap-1.5 border-border/60 bg-secondary/30 text-muted-foreground hover:text-foreground"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
          {canPush && (
            <Button
              size="sm"
              onClick={() => setShowCompose(true)}
              className="gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Push Notification
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs
        value={filterType}
        onValueChange={setFilterType}
        className="mb-4"
      >
        <TabsList className="bg-secondary/30 h-9">
          <TabsTrigger
            value="all"
            className="text-xs data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="unread"
            className="text-xs data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
          >
            Unread
            {unreadCount > 0 && (
              <span className="ml-1.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="announcement"
            className="text-xs data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
          >
            Announcements
          </TabsTrigger>
          <TabsTrigger
            value="assignment"
            className="text-xs data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
          >
            Assignments
          </TabsTrigger>
          <TabsTrigger
            value="resource"
            className="text-xs data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
          >
            Resources
          </TabsTrigger>
          <TabsTrigger
            value="alert"
            className="text-xs data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
          >
            Alerts
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Content: list + detail */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* List */}
        <div className="lg:col-span-2">
          <ScrollArea className="h-[calc(100vh-320px)]">
            <div className="flex flex-col gap-2 pr-2">
              {filteredNotifications.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/50 mb-3">
                    <Bell className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    No notifications
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {filterType !== "all"
                      ? "Try a different filter"
                      : "You're all caught up"}
                  </p>
                </div>
              )}

              {filteredNotifications.map((notif) => {
                const config = typeConfig[notif.type]
                const TypeIcon = config.icon
                const isSelected = selectedNotification?.id === notif.id

                return (
                  <button
                    key={notif.id}
                    onClick={() => handleRead(notif.id)}
                    className={cn(
                      "group flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all duration-200",
                      isSelected
                        ? "border-primary/40 bg-primary/10 glow-sm"
                        : "border-border/40 bg-card/50 hover:bg-card/80 hover:border-border/60",
                      !notif.read && "border-l-2 border-l-primary"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        config.bg
                      )}
                    >
                      <TypeIcon className={cn("h-4 w-4", config.color)} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            "text-sm leading-snug truncate",
                            !notif.read
                              ? "font-semibold text-foreground"
                              : "font-medium text-foreground/80"
                          )}
                        >
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {notif.sender}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground/60">
                          {notif.date} at {notif.time}
                        </span>
                        {notif.attachments.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="h-4 px-1 text-[9px] bg-secondary/50"
                          >
                            <Paperclip className="mr-0.5 h-2.5 w-2.5" />
                            {notif.attachments.length}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-3">
          {selectedNotification ? (
            <NotificationDetail
              notification={selectedNotification}
              canDelete={canPush}
              onDelete={() => handleDelete(selectedNotification.id)}
              onClose={() => setSelectedNotification(null)}
            />
          ) : (
            <div className="flex h-[calc(100vh-320px)] flex-col items-center justify-center rounded-xl border border-border/40 bg-card/30">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/40 mb-4">
                <Eye className="h-7 w-7 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Select a notification
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Click on any notification to view details
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Dialog (Faculty / Admin only) */}
      {canPush && (
        <ComposeDialog
          open={showCompose}
          onClose={() => setShowCompose(false)}
          onSend={(notif) => {
            setNotifications((prev) => [notif, ...prev])
            setShowCompose(false)
          }}
          senderRole={userRole as "faculty" | "admin"}
        />
      )}
    </div>
  )
}

/* ---- Notification Detail ---- */
function NotificationDetail({
  notification,
  canDelete,
  onDelete,
  onClose,
}: {
  notification: Notification
  canDelete: boolean
  onDelete: () => void
  onClose: () => void
}) {
  const config = typeConfig[notification.type]
  const TypeIcon = config.icon

  const audienceLabel =
    notification.audience === "all"
      ? "Everyone"
      : notification.audience === "students"
        ? "Students"
        : "Faculty"

  return (
    <div className="flex h-[calc(100vh-320px)] flex-col rounded-xl border border-border/40 bg-card/50 overflow-hidden">
      {/* Detail header */}
      <div className="flex items-center justify-between border-b border-border/40 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              config.bg
            )}
          >
            <TypeIcon className={cn("h-4 w-4", config.color)} />
          </div>
          <Badge
            variant="secondary"
            className={cn("text-[10px]", config.bg, config.color)}
          >
            {config.label}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 text-muted-foreground hover:text-foreground lg:hidden"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Detail body */}
      <ScrollArea className="flex-1 p-5">
        <h2 className="text-lg font-bold text-foreground leading-snug text-balance">
          {notification.title}
        </h2>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            {notification.senderRole === "admin" ? (
              <Shield className="h-3 w-3 text-amber-400" />
            ) : (
              <BookOpen className="h-3 w-3 text-sky-400" />
            )}
            <span className="font-medium text-foreground/80">
              {notification.sender}
            </span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {notification.date} at {notification.time}
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {audienceLabel}
          </div>
        </div>

        <div className="mt-5 rounded-lg bg-secondary/20 border border-border/30 p-4">
          <p className="text-sm leading-relaxed text-foreground/90">
            {notification.message}
          </p>
        </div>

        {/* Attachments */}
        {notification.attachments.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-3">
              Attachments ({notification.attachments.length})
            </p>
            <div className="flex flex-col gap-2">
              {notification.attachments.map((file, i) => (
                <div
                  key={i}
                  className="group flex items-center justify-between rounded-lg border border-border/40 bg-secondary/20 px-4 py-3 transition-all hover:bg-secondary/40 hover:border-border/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {file.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {file.size} &middot;{" "}
                        {file.type.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

/* ---- Compose Dialog (Faculty / Admin only) ---- */
function ComposeDialog({
  open,
  onClose,
  onSend,
  senderRole,
}: {
  open: boolean
  onClose: () => void
  onSend: (n: Notification) => void
  senderRole: "faculty" | "admin"
}) {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [type, setType] = useState<NotificationType>("announcement")
  const [audience, setAudience] = useState<"all" | "students" | "faculty">(
    "all"
  )
  const [attachments, setAttachments] = useState<Attachment[]>([])

  const senderName =
    senderRole === "admin" ? "Rajesh Kumar" : "Dr. Priya Nair"

  const handleAddAttachment = () => {
    const mockNames = [
      "Document.pdf",
      "Notes.pdf",
      "Schedule.pdf",
      "Guidelines.pdf",
      "Material.pdf",
    ]
    const randomName =
      mockNames[Math.floor(Math.random() * mockNames.length)]
    setAttachments((prev) => [
      ...prev,
      {
        name: randomName,
        size: `${(Math.random() * 3 + 0.2).toFixed(1)} MB`,
        type: "pdf",
      },
    ])
  }

  const handleRemoveAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSend = () => {
    if (!title.trim() || !message.trim()) return

    const now = new Date()
    const dateStr = now.toISOString().split("T")[0]
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })

    onSend({
      id: crypto.randomUUID(),
      title: title.trim(),
      message: message.trim(),
      type,
      sender: senderName,
      senderRole,
      date: dateStr,
      time: timeStr,
      read: false,
      attachments,
      audience,
    })

    setTitle("")
    setMessage("")
    setType("announcement")
    setAudience("all")
    setAttachments([])
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg bg-card border-border/60">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Send className="h-4 w-4 text-primary" />
            Push New Notification
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Type + Audience row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Type
              </label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as NotificationType)}
              >
                <SelectTrigger className="bg-secondary/30 border-border/50 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="resource">Resource</SelectItem>
                  <SelectItem value="alert">Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Audience
              </label>
              <Select
                value={audience}
                onValueChange={(v) =>
                  setAudience(v as "all" | "students" | "faculty")
                }
              >
                <SelectTrigger className="bg-secondary/30 border-border/50 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Everyone</SelectItem>
                  <SelectItem value="students">Students Only</SelectItem>
                  <SelectItem value="faculty">Faculty Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title..."
              className="h-9 w-full rounded-lg border border-border/50 bg-secondary/30 px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>

          {/* Message */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write the notification content..."
              rows={4}
              className="w-full rounded-lg border border-border/50 bg-secondary/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
            />
          </div>

          {/* Attachments */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Attachments
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddAttachment}
                className="h-6 gap-1 px-2 text-[11px] text-primary hover:bg-primary/10"
              >
                <Upload className="h-3 w-3" />
                Add file
              </Button>
            </div>
            {attachments.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {attachments.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-foreground">
                        {file.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {file.size}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveAttachment(i)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-border/50 bg-secondary/30"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!title.trim() || !message.trim()}
            className="gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            Send Notification
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
