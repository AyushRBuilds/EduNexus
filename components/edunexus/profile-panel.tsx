"use client"

import { useState, useRef } from "react"
import {
  X,
  Mail,
  Building2,
  GraduationCap,
  BookOpen,
  Shield,
  Calendar,
  Clock,
  Award,
  LogOut,
  Settings,
  User as UserIcon,
  Camera,
  Pencil,
  Check,
  ChevronLeft,
  Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
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
import type { User, UserRole } from "./auth-context"

const roleConfig: Record<
  UserRole,
  { label: string; color: string; bg: string; icon: typeof GraduationCap; borderColor: string }
> = {
  student: {
    label: "Student",
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
    icon: GraduationCap,
    borderColor: "border-emerald-500/30",
  },
  faculty: {
    label: "Faculty",
    color: "text-sky-400",
    bg: "bg-sky-500/15",
    icon: BookOpen,
    borderColor: "border-sky-500/30",
  },
  admin: {
    label: "Administrator",
    color: "text-amber-400",
    bg: "bg-amber-500/15",
    icon: Shield,
    borderColor: "border-amber-500/30",
  },
}

const profileStats: Record<UserRole, { label: string; value: string }[]> = {
  student: [], // no quick stats for students
  faculty: [
    { label: "Courses Teaching", value: "4" },
    { label: "Papers Published", value: "18" },
    { label: "Students", value: "245" },
    { label: "H-Index", value: "12" },
  ],
  admin: [
    { label: "Managed Users", value: "1,250" },
    { label: "Departments", value: "8" },
    { label: "Active Issues", value: "3" },
    { label: "Uptime", value: "99.9%" },
  ],
}

const DEPARTMENT_OPTIONS = [
  "Computer Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Physics",
  "Mathematics",
  "Chemistry",
  "Administration",
]

/* ---------- Account Settings View ---------- */
function AccountSettings({
  user,
  onBack,
  onSave,
}: {
  user: User
  onBack: () => void
  onSave: (data: { name: string; email: string; department: string; avatarUrl: string | null }) => void
}) {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [department, setDepartment] = useState(user.department)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const config = roleConfig[user.role]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    onSave({ name, email, department, avatarUrl: avatarPreview })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border/40 px-5 py-4">
        <button
          onClick={onBack}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <Settings className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">Account Settings</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {/* Avatar upload */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative group">
            <div className={cn("rounded-full p-0.5 border-2", config.borderColor)}>
              <Avatar className="h-24 w-24 border-2 border-card">
                {avatarPreview ? (
                  <AvatarImage src={avatarPreview} alt="Profile" />
                ) : (
                  <AvatarFallback className="bg-primary/20 text-2xl text-primary font-bold">
                    {user.avatar}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Click camera icon to change photo</p>
        </div>

        {/* Edit fields */}
        <div className="flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1.5">
              <UserIcon className="h-3 w-3" />
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-secondary/30 px-4 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1.5">
              <Mail className="h-3 w-3" />
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-secondary/30 px-4 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1.5">
              <Building2 className="h-3 w-3" />
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full h-10 rounded-xl border border-border bg-secondary/30 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            >
              {DEPARTMENT_OPTIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Role - read only */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1.5">
              <Shield className="h-3 w-3" />
              Role
            </label>
            <div className="flex h-10 items-center rounded-xl border border-border/50 bg-secondary/15 px-4">
              <Badge className={cn("gap-1.5", config.bg, config.color, "border-0 text-xs")}>
                <config.icon className="h-3 w-3" />
                {config.label}
              </Badge>
              <span className="ml-auto text-[10px] text-muted-foreground">Read-only</span>
            </div>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="border-t border-border/40 p-4">
        <Button
          onClick={handleSave}
          className={cn(
            "w-full rounded-xl gap-2 transition-all",
            saved
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {saved ? (
            <>
              <Check className="h-4 w-4" />
              Saved Successfully
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

/* ---------- Main Profile Panel ---------- */
export function ProfilePanel({
  user,
  open,
  onClose,
  onLogout,
}: {
  user: User
  open: boolean
  onClose: () => void
  onLogout: () => void
}) {
  const [view, setView] = useState<"profile" | "settings">("profile")
  const [editedUser, setEditedUser] = useState<{
    name?: string
    email?: string
    department?: string
    avatarUrl?: string | null
  }>({})

  const config = roleConfig[user.role]
  const RoleIcon = config.icon
  const stats = profileStats[user.role]

  const displayName = editedUser.name ?? user.name
  const displayEmail = editedUser.email ?? user.email
  const displayDepartment = editedUser.department ?? user.department
  const displayAvatar = editedUser.avatarUrl ?? null
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const handleClose = () => {
    setView("profile")
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-background/60 backdrop-blur-sm"
          onClick={handleClose}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 z-[70] flex h-full w-full max-w-sm flex-col border-l border-border/50 bg-card shadow-2xl transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {view === "settings" ? (
          <AccountSettings
            user={{ ...user, name: displayName, email: displayEmail, department: displayDepartment }}
            onBack={() => setView("profile")}
            onSave={(data) => {
              setEditedUser({
                name: data.name,
                email: data.email,
                department: data.department,
                avatarUrl: data.avatarUrl ?? editedUser.avatarUrl,
              })
              setView("profile")
            }}
          />
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Profile</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Profile content */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* Avatar + Name */}
              <div className="flex flex-col items-center text-center">
                <div className={cn("rounded-full p-0.5 border-2", config.borderColor)}>
                  <Avatar className="h-20 w-20 border-2 border-card">
                    {displayAvatar ? (
                      <AvatarImage src={displayAvatar} alt={displayName} />
                    ) : (
                      <AvatarFallback className="bg-primary/20 text-xl text-primary font-bold">
                        {initials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
                <h2 className="mt-3 text-lg font-bold text-foreground">{displayName}</h2>
                <Badge className={cn("mt-1.5 gap-1.5", config.bg, config.color, "border-0")}>
                  <RoleIcon className="h-3 w-3" />
                  {config.label}
                </Badge>
              </div>

              <Separator className="my-5 bg-border/30" />

              {/* Info fields */}
              <div className="flex flex-col gap-3.5">
                <div className="flex items-center gap-3 rounded-lg bg-secondary/20 border border-border/30 px-3.5 py-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                      Email
                    </p>
                    <p className="text-sm text-foreground">{displayEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg bg-secondary/20 border border-border/30 px-3.5 py-2.5">
                  <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                      Department
                    </p>
                    <p className="text-sm text-foreground">{displayDepartment}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg bg-secondary/20 border border-border/30 px-3.5 py-2.5">
                  <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                      Joined
                    </p>
                    <p className="text-sm text-foreground">August 2024</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg bg-secondary/20 border border-border/30 px-3.5 py-2.5">
                  <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                      Last Active
                    </p>
                    <p className="text-sm text-foreground">Just now</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats -- only for faculty and admin */}
              {stats.length > 0 && (
                <>
                  <Separator className="my-5 bg-border/30" />
                  <div>
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                      Quick Stats
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {stats.map((stat, i) => (
                        <div
                          key={i}
                          className="flex flex-col items-center rounded-lg border border-border/30 bg-secondary/15 p-3"
                        >
                          <span className="text-lg font-bold text-foreground">{stat.value}</span>
                          <span className="text-[10px] text-muted-foreground text-center leading-tight mt-0.5">
                            {stat.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Achievements for students */}
              {user.role === "student" && (
                <>
                  <Separator className="my-5 bg-border/30" />
                  <div>
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                      Achievements
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["Dean's List", "Perfect Attendance", "Top Performer", "Research Intern"].map(
                        (badge) => (
                          <Badge
                            key={badge}
                            variant="secondary"
                            className="gap-1 bg-primary/10 text-primary border-0 text-[11px]"
                          >
                            <Award className="h-3 w-3" />
                            {badge}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer actions */}
            <div className="border-t border-border/40 p-4 flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setView("settings")}
                className="w-full justify-start gap-2 border-border/50 bg-secondary/20 text-muted-foreground hover:text-foreground"
              >
                <Settings className="h-3.5 w-3.5" />
                Account Settings
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/15 hover:text-destructive"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
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
                      onClick={onLogout}
                      className="bg-destructive !text-white hover:bg-destructive/90 font-semibold"
                    >
                      Sign Out
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </>
        )}
      </div>
    </>
  )
}
