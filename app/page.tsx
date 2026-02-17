"use client"

import { useState } from "react"
import { useAuth } from "@/components/edunexus/auth-context"
import { LoginPage } from "@/components/edunexus/login-page"
import { TopNav } from "@/components/edunexus/top-nav"
import { AppSidebar, MobileBottomNav, type ViewId } from "@/components/edunexus/app-sidebar"
import { HeroSearch } from "@/components/edunexus/hero-search"
import { SearchResults } from "@/components/edunexus/search-results"
import { TrendingSection } from "@/components/edunexus/trending-section"
import { FacultyMode } from "@/components/edunexus/faculty-mode"
import { ResearchCollab } from "@/components/edunexus/research-collab"
import { AdminDashboard } from "@/components/edunexus/admin-dashboard"
import { StudyWorkspace } from "@/components/edunexus/study-workspace"
import { SubjectsView } from "@/components/edunexus/subjects-view"
import { ResearchHub } from "@/components/edunexus/research-hub"

import { ProfilePanel } from "@/components/edunexus/profile-panel"
import { EduNexusLogo } from "@/components/edunexus/edunexus-logo"
import { InitAnimation } from "@/components/edunexus/init-animation"

export default function EduNexusPage() {
  const { user, isAuthenticated, logout } = useAuth()
  const [activeView, setActiveView] = useState<ViewId>("search")
  const [searchQuery, setSearchQuery] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [initDone, setInitDone] = useState(false)

  // Show initialization animation on first load
  if (!initDone) {
    return <InitAnimation onComplete={() => setInitDone(true)} />
  }

  // Show login if not authenticated
  if (!isAuthenticated || !user) {
    return <LoginPage />
  }

  const userRole = user.role

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setHasSearched(true)
    setActiveView("search")
  }

  const handleNavigate = (view: ViewId) => {
    setActiveView(view)
  }

  const isStudyMode = activeView === "study"

  // Study mode: fully immersive, no sidebar/topnav/footer (students only)
  if (isStudyMode && userRole === "student") {
    return (
      <div className="flex h-screen flex-col bg-background overflow-hidden">
        <StudyWorkspace onBack={() => setActiveView("search")} />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background bg-grid">
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar
          activeView={activeView}
          onNavigate={handleNavigate}
          userRole={userRole}
        />

        <div className="flex flex-1 flex-col overflow-y-auto">
          <TopNav
            onSearch={handleSearch}
            onProfileClick={() => setProfileOpen(true)}
            hideSearch={activeView !== "search"}
            onLogoClick={() => { setActiveView("search"); setHasSearched(false) }}
            isSticky={activeView !== "search"}
            activeView={activeView}
          />

          <main className="flex-1 pb-16 lg:pb-0">
            {/* Search View */}
            {activeView === "search" && (
              <>
                {!hasSearched && <HeroSearch onSearch={handleSearch} />}
                {hasSearched && <SearchResults query={searchQuery} />}
                {!hasSearched && <TrendingSection onSearch={handleSearch} />}
              </>
            )}

            {/* Research Hub View */}
            {activeView === "research" && (
              <div className="pt-3">
                <ResearchHub />
              </div>
            )}

            {/* Research Collaboration View */}
            {activeView === "collab" && (
              <div className="pt-3">
                <ResearchCollab userRole={userRole} />
              </div>
            )}

            {/* Subjects View */}
            {activeView === "subjects" && (
              <div className="pt-3">
                <SubjectsView userRole={userRole} />
              </div>
            )}

            {/* Trending View */}
            {activeView === "trending" && (
              <div className="pt-3">
                <TrendingSection onSearch={handleSearch} />
              </div>
            )}

            {/* Faculty Studio View (faculty + admin only) */}
            {activeView === "faculty" && (userRole === "faculty" || userRole === "admin") && (
              <div className="pt-3">
                <FacultyMode />
              </div>
            )}

            {/* Admin Dashboard View (admin only) */}
            {activeView === "admin" && userRole === "admin" && (
              <div className="pt-3">
                <AdminDashboard />
              </div>
            )}

            {/* Footer */}
            <footer className="border-t border-border px-4 py-6">
              <div className="flex items-center justify-center gap-2">
                <EduNexusLogo size={18} />
                <p className="text-xs text-muted-foreground">
                  EduNexus &mdash; A Unified AI Knowledge Infrastructure for Smart
                  Campuses
                </p>
              </div>
            </footer>
          </main>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <MobileBottomNav
        activeView={activeView}
        onNavigate={handleNavigate}
        userRole={userRole}
      />

      {/* Profile slide-over panel */}
      <ProfilePanel
        user={user}
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onLogout={logout}
      />
    </div>
  )
}
