"use client"

import { useState, useRef, useEffect } from "react"
import { EduNexusLogo } from "./edunexus-logo"
import {
  Search,
  Bell,
  Upload,
  LogOut,
  GraduationCap,
  BookOpen,
  Shield,
  X,
  CheckCheck,
  FileText,
  Download,
  Megaphone,
  AlertCircle,
  Clock,
  Paperclip,
  Send,
  Plus,
  Moon,
  Sun,
  Library,
  Handshake,
  TrendingUp,
  LayoutDashboard,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
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
import { useAuth, type UserRole } from "./auth-context"
import type { ViewId } from "./app-sidebar"

/* ---- View header config ---- */
const viewHeaderConfig: Record<string, { label: string; icon: typeof Search; color: string }> = {
  research: { label: "Research Hub", icon: BookOpen, color: "text-orange-400" },
  collab: { label: "Collaboration", icon: Handshake, color: "text-pink-400" },
  subjects: { label: "Subjects", icon: Library, color: "text-lime-400" },
  trending: { label: "Trending", icon: TrendingUp, color: "text-yellow-400" },
  faculty: { label: "Faculty Studio", icon: GraduationCap, color: "text-indigo-400" },
  admin: { label: "Admin Panel", icon: LayoutDashboard, color: "text-amber-400" },
}

/* ---- Role config ---- */
const roleConfig: Record<UserRole, { label: string; color: string; bgColor: string; icon: typeof GraduationCap }> = {
  student: { label: "Student", color: "text-emerald-400", bgColor: "bg-emerald-500/15", icon: GraduationCap },
  faculty: { label: "Faculty", color: "text-sky-400", bgColor: "bg-sky-500/15", icon: BookOpen },
  admin: { label: "Admin", color: "text-amber-400", bgColor: "bg-amber-500/15", icon: Shield },
}

/* ---- Notification types ---- */
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

const typeConfig: Record<NotificationType, { icon: typeof Bell; color: string; bg: string; label: string }> = {
  announcement: { icon: Megaphone, color: "text-sky-400", bg: "bg-sky-500/15", label: "Announcement" },
  assignment: { icon: FileText, color: "text-amber-400", bg: "bg-amber-500/15", label: "Assignment" },
  resource: { icon: Download, color: "text-emerald-400", bg: "bg-emerald-500/15", label: "Resource" },
  alert: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/15", label: "Alert" },
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    title: "Mid-Semester Examination Schedule Released",
    message: "The mid-semester examination schedule for all departments has been finalized. Please download the attached PDF for detailed timings, room allocations, and exam guidelines. Students must carry their ID cards.",
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
    message: "Submit your solutions for Assignment 3 covering Laplace Transform properties, inverse transforms, and applications to differential equations. Reference material and problem set attached below.",
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
    message: "The university has subscribed to IEEE Xplore and Springer Nature databases. All students and faculty can now access these resources through the campus network or VPN. Setup guide attached.",
    type: "resource",
    sender: "Rajesh Kumar",
    senderRole: "admin",
    date: "2026-02-16",
    time: "11:00 AM",
    read: true,
    attachments: [{ name: "VPN_Setup_Guide.pdf", size: "320 KB", type: "pdf" }],
    audience: "all",
  },
  {
    id: "4",
    title: "DSA Lab 4: Binary Search Trees - Updated",
    message: "Lab 4 has been updated with additional test cases and a bonus problem on AVL tree rotations. Please re-download the lab manual. Submission deadline remains unchanged.",
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
    message: "Scheduled maintenance on campus Wi-Fi and LAN infrastructure on February 20th, 10:00 PM to 4:00 AM. Internet access will be intermittent during this period. Please plan accordingly.",
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
    message: "Prof. Anand Rao from IIT Bombay will deliver a guest lecture on applications of AI in healthcare diagnostics. Venue: Main Auditorium, 3:00 PM. All students are encouraged to attend.",
    type: "announcement",
    sender: "Dr. Priya Nair",
    senderRole: "faculty",
    date: "2026-02-13",
    time: "09:00 AM",
    read: true,
    attachments: [{ name: "Guest_Lecture_Registration.pdf", size: "180 KB", type: "pdf" }],
    audience: "all",
  },
]

/* ==================================================================
   TopNav
   ================================================================== */
export function TopNav({
  onSearch,
  onProfileClick,
  hideSearch = false,
  onLogoClick,
  isSticky = true,
  activeView = "search",
  onNavigate,
}: {
  onSearch: (query: string) => void
  onProfileClick?: () => void
  hideSearch?: boolean
  onLogoClick?: () => void
  isSticky?: boolean
  activeView?: ViewId
  onNavigate?: (view: ViewId) => void
}) {
  const { user, logout } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [navSearch, setNavSearch] = useState("")
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null)
  const [showCompose, setShowCompose] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const role = user?.role ?? "student"
  const config = roleConfig[role]
  const RoleIcon = config.icon
  const canPush = role === "faculty" || role === "admin"

  const unreadCount = notifications.filter((n) => !n.read).length

  // Prevent hydration mismatch for theme toggle
  useEffect(() => { setMounted(true) }, [])

  // Close panel on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
        setSelectedNotif(null)
      }
    }
    if (notifOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [notifOpen])

  const handleRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    const notif = notifications.find((n) => n.id === id)
    if (notif) setSelectedNotif({ ...notif, read: true })
  }

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    if (selectedNotif?.id === id) setSelectedNotif(null)
  }

  return (
    <header className={cn(
      "z-50 glass-strong",
      isSticky ? "sticky top-0" : "relative"
    )}>
      <div className="flex h-14 items-center gap-4 border-b border-border/30 px-4 lg:px-6">
        {/* Mobile logo */}
        <button
          onClick={onLogoClick}
          className="flex shrink-0 items-center gap-2 lg:hidden transition-colors hover:opacity-80"
          aria-label="Go to Smart Search"
        >
          <EduNexusLogo size={28} />
          <span className="text-lg font-bold text-foreground">EduNexus</span>
        </button>

        {/* Center Search — hidden when a view provides its own search (e.g. Research Hub) */}
        {!hideSearch ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="relative w-full max-w-xl">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search across lectures, papers, notes..."
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && navSearch.trim()) {
                    onSearch(navSearch.trim())
                    setNavSearch("")
                  }
                }}
                className="h-10 w-full rounded-xl border border-border bg-secondary/40 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 focus:glow-sm transition-all"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            {viewHeaderConfig[activeView] ? (() => {
              const vc = viewHeaderConfig[activeView]
              const ViewIcon = vc.icon
              return (
                <div className="flex items-center gap-2.5">
                  <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/60", vc.color)}>
                    <ViewIcon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">{vc.label}</span>
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    /
                  </span>
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    {user?.name ?? "User"}
                  </span>
                </div>
              )
            })() : (
              <div className="flex-1" />
            )}
          </div>
        )}

        {/* Right Nav */}
        <nav className="flex items-center gap-1.5">
          {(role === "faculty" || role === "admin") && (
            <Button
              variant="ghost"
              size="sm"
              className="hidden text-muted-foreground hover:text-foreground hover:bg-secondary/60 sm:flex"
            >
              <Upload className="mr-1.5 h-4 w-4" />
              Upload
            </Button>
          )}

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            aria-label="Toggle theme"
            suppressHydrationWarning
          >
            {mounted ? (
              resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>

          {/* Bell — Notification toggle */}
          <div className="relative" ref={panelRef}>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "text-muted-foreground hover:text-foreground hover:bg-secondary/60 relative",
                notifOpen && "bg-secondary/60 text-foreground"
              )}
              onClick={() => {
                setNotifOpen((prev) => !prev)
                setSelectedNotif(null)
              }}
              aria-label="Toggle notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </Button>

            {/* Notification dropdown panel */}
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 z-[100] w-[min(420px,calc(100vw-2rem))] rounded-xl border border-border/60 bg-card shadow-2xl shadow-black/40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Panel header */}
                <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-primary/15 text-primary">
                        {unreadCount} new
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAllRead}
                        className="h-7 gap-1 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        <CheckCheck className="h-3 w-3" />
                        <span className="hidden sm:inline">Read all</span>
                      </Button>
                    )}
                    {canPush && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCompose(true)}
                        className="h-7 gap-1 px-2 text-[11px] text-primary hover:bg-primary/10"
                      >
                        <Plus className="h-3 w-3" />
                        <span className="hidden sm:inline">Push</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { setNotifOpen(false); setSelectedNotif(null) }}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Detail view or list */}
                {selectedNotif ? (
                  <NotifDetail
                    notification={selectedNotif}
                    canDelete={canPush}
                    onDelete={() => handleDelete(selectedNotif.id)}
                    onBack={() => setSelectedNotif(null)}
                  />
                ) : (
                  <ScrollArea className="h-[min(420px,60vh)]">
                    <div className="flex flex-col gap-0.5 p-1.5">
                      {notifications.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <Bell className="h-6 w-6 text-muted-foreground/30 mb-2" />
                          <p className="text-xs text-muted-foreground">No notifications</p>
                        </div>
                      )}
                      {notifications.map((notif) => {
                        const tc = typeConfig[notif.type]
                        const TypeIcon = tc.icon
                        return (
                          <button
                            key={notif.id}
                            onClick={() => handleRead(notif.id)}
                            className={cn(
                              "group flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-all duration-150",
                              selectedNotif?.id === notif.id
                                ? "bg-primary/10"
                                : "hover:bg-secondary/50",
                              !notif.read && "bg-primary/5"
                            )}
                          >
                            <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5", tc.bg)}>
                              <TypeIcon className={cn("h-3.5 w-3.5", tc.color)} />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <div className="flex items-start justify-between gap-1.5">
                                <p className={cn(
                                  "text-[13px] leading-snug truncate",
                                  !notif.read ? "font-semibold text-foreground" : "font-medium text-foreground/80"
                                )}>
                                  {notif.title}
                                </p>
                                {!notif.read && (
                                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                )}
                              </div>
                              <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                <span>{notif.sender}</span>
                                <span className="text-border">{"/"}</span>
                                <span>{notif.date}</span>
                                {notif.attachments.length > 0 && (
                                  <>
                                    <span className="text-border">{"/"}</span>
                                    <Paperclip className="h-2.5 w-2.5" />
                                    <span>{notif.attachments.length}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </ScrollArea>
                )}
              </div>
            )}
          </div>

          {/* Quick Action Button */}
          {onNavigate ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate(role === "student" ? "study" : role === "faculty" ? "faculty" : "admin")}
              className={cn("hidden h-8 gap-1.5 sm:flex border-opacity-20 hover:border-opacity-30", config.color, config.bgColor.replace("/15", "/10"))}
            >
              <RoleIcon className="h-3.5 w-3.5" />
              <span>{role === "student" ? "Study Mode" : role === "faculty" ? "Faculty Studio" : "Admin Studio"}</span>
            </Button>
          ) : (
            <div className={`hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 ${config.bgColor} sm:flex`}>
              <RoleIcon className={`h-3.5 w-3.5 ${config.color}`} />
              <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
            </div>
          )}

          {/* User Avatar */}
          <button
            onClick={onProfileClick}
            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-transform hover:scale-105 active:scale-95"
            aria-label="Open profile"
          >
            <Avatar className="h-8 w-8 cursor-pointer border border-border hover:border-primary/50 transition-colors">
              <AvatarFallback className="bg-primary/20 text-xs text-primary font-medium">
                {user?.avatar ?? "EN"}
              </AvatarFallback>
            </Avatar>
          </button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hidden text-muted-foreground hover:text-destructive hover:bg-destructive/10 sm:flex"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Sign out</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-border/60 bg-card">
              <AlertDialogHeader>
                <AlertDialogTitle>Sign out of EduNexus?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will be logged out of your account and returned to the sign-in screen. Any unsaved changes will be lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-border/50">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault()
                    logout()
                  }}
                  className="bg-destructive !text-white hover:bg-destructive/90 font-semibold"
                >
                  Sign Out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </nav>
      </div>

      {/* Compose dialog (faculty/admin) */}
      {canPush && (
        <ComposeDialog
          open={showCompose}
          onClose={() => setShowCompose(false)}
          onSend={(notif) => {
            setNotifications((prev) => [notif, ...prev])
            setShowCompose(false)
          }}
          senderRole={role as "faculty" | "admin"}
        />
      )}
    </header>
  )
}

/* ==================================================================
   Notification Detail (inside dropdown)
   ================================================================== */
function NotifDetail({
  notification,
  canDelete,
  onDelete,
  onBack,
}: {
  notification: Notification
  canDelete: boolean
  onDelete: () => void
  onBack: () => void
}) {
  const tc = typeConfig[notification.type]
  const TypeIcon = tc.icon

  return (
    <div className="flex flex-col max-h-[min(420px,60vh)]">
      {/* Back + badges */}
      <div className="flex items-center justify-between border-b border-border/30 px-4 py-2.5">
        <button onClick={onBack} className="text-xs font-medium text-primary hover:underline">
          &larr; Back
        </button>
        <div className="flex items-center gap-1.5">
          <Badge variant="secondary" className={cn("text-[10px]", tc.bg, tc.color)}>
            {tc.label}
          </Badge>
          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <h4 className="text-sm font-bold text-foreground leading-snug text-balance">
          {notification.title}
        </h4>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            {notification.senderRole === "admin" ? (
              <Shield className="h-2.5 w-2.5 text-amber-400" />
            ) : (
              <BookOpen className="h-2.5 w-2.5 text-sky-400" />
            )}
            <span className="font-medium text-foreground/80">{notification.sender}</span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            {notification.date} at {notification.time}
          </div>
        </div>

        <div className="mt-3 rounded-lg bg-secondary/20 border border-border/30 p-3">
          <p className="text-xs leading-relaxed text-foreground/90">{notification.message}</p>
        </div>

        {/* Attachments */}
        {notification.attachments.length > 0 && (
          <div className="mt-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">
              Attachments ({notification.attachments.length})
            </p>
            <div className="flex flex-col gap-1.5">
              {notification.attachments.map((file, i) => (
                <div key={i} className="group flex items-center justify-between rounded-lg border border-border/40 bg-secondary/20 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
                      <FileText className="h-3 w-3 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">{file.name}</p>
                      <p className="text-[10px] text-muted-foreground">{file.size}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <Download className="h-3 w-3" />
                    Get
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

/* ==================================================================
   Compose Dialog (Faculty / Admin only)
   ================================================================== */
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
  const [audience, setAudience] = useState<"all" | "students" | "faculty">("all")
  const [attachments, setAttachments] = useState<Attachment[]>([])

  const senderName = senderRole === "admin" ? "Rajesh Kumar" : "Dr. Priya Nair"

  const handleAddAttachment = () => {
    const mockNames = ["Document.pdf", "Notes.pdf", "Schedule.pdf", "Guidelines.pdf", "Material.pdf"]
    const randomName = mockNames[Math.floor(Math.random() * mockNames.length)]
    setAttachments((prev) => [...prev, { name: randomName, size: `${(Math.random() * 3 + 0.2).toFixed(1)} MB`, type: "pdf" }])
  }

  const handleRemoveAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSend = () => {
    if (!title.trim() || !message.trim()) return
    const now = new Date()
    onSend({
      id: crypto.randomUUID(),
      title: title.trim(),
      message: message.trim(),
      type,
      sender: senderName,
      senderRole,
      date: now.toISOString().split("T")[0],
      time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Type</label>
              <Select value={type} onValueChange={(v) => setType(v as NotificationType)}>
                <SelectTrigger className="bg-secondary/30 border-border/50 h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="resource">Resource</SelectItem>
                  <SelectItem value="alert">Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Audience</label>
              <Select value={audience} onValueChange={(v) => setAudience(v as "all" | "students" | "faculty")}>
                <SelectTrigger className="bg-secondary/30 border-border/50 h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Everyone</SelectItem>
                  <SelectItem value="students">Students Only</SelectItem>
                  <SelectItem value="faculty">Faculty Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title..."
              className="h-9 w-full rounded-lg border border-border/50 bg-secondary/30 px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write the notification content..."
              rows={4}
              className="w-full rounded-lg border border-border/50 bg-secondary/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Attachments</label>
              <Button type="button" variant="ghost" size="sm" onClick={handleAddAttachment} className="h-6 gap-1 px-2 text-[11px] text-primary hover:bg-primary/10">
                <Upload className="h-3 w-3" />
                Add file
              </Button>
            </div>
            {attachments.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {attachments.map((file, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-foreground">{file.name}</span>
                      <span className="text-[10px] text-muted-foreground">{file.size}</span>
                    </div>
                    <button onClick={() => handleRemoveAttachment(i)} className="text-muted-foreground hover:text-destructive transition-colors">
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
            <Button variant="outline" size="sm" className="border-border/50 bg-secondary/30">Cancel</Button>
          </DialogClose>
          <Button size="sm" onClick={handleSend} disabled={!title.trim() || !message.trim()} className="gap-1.5">
            <Send className="h-3.5 w-3.5" />
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
