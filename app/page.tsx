"use client"

import { useState } from "react"
import { useAuth } from "@/components/edunexus/auth-context"
import { LoginPage } from "@/components/edunexus/login-page"
import { TopNav } from "@/components/edunexus/top-nav"
import { AppSidebar, MobileBottomNav, type ViewId } from "@/components/edunexus/app-sidebar"
import { HeroSearch } from "@/components/edunexus/hero-search"
import { SearchResults } from "@/components/edunexus/search-results"
import { KnowledgeGraph } from "@/components/edunexus/knowledge-graph"
import { TrendingSection } from "@/components/edunexus/trending-section"
import { FacultyMode } from "@/components/edunexus/faculty-mode"
import { ResearchCollab } from "@/components/edunexus/research-collab"
import { AdminDashboard } from "@/components/edunexus/admin-dashboard"

export default function EduNexusPage() {
  const { user, isAuthenticated } = useAuth()
  const [activeView, setActiveView] = useState<ViewId>("search")
  const [searchQuery, setSearchQuery] = useState("")
  const [hasSearched, setHasSearched] = useState(false)

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

  return (
    <div className="flex min-h-screen flex-col bg-background bg-grid">
      <TopNav onSearch={handleSearch} />

      <div className="flex flex-1">
        <AppSidebar
          activeView={activeView}
          onNavigate={handleNavigate}
          userRole={userRole}
        />

        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          {/* Search View */}
          {activeView === "search" && (
            <>
              {!hasSearched && <HeroSearch onSearch={handleSearch} />}
              {hasSearched && <SearchResults query={searchQuery} />}
              {hasSearched && <KnowledgeGraph query={searchQuery} />}
              {!hasSearched && <TrendingSection onSearch={handleSearch} />}
            </>
          )}

          {/* Knowledge Graph View */}
          {activeView === "graph" && (
            <div className="pt-8">
              <KnowledgeGraph query={searchQuery || "Laplace Transform"} />
            </div>
          )}

          {/* Research Repository View */}
          {activeView === "research" && (
            <div className="pt-8">
              <SearchResults query={searchQuery || "Research Repository"} />
            </div>
          )}

          {/* Research Collaboration View */}
          {activeView === "collab" && (
            <div className="pt-8">
              <ResearchCollab userRole={userRole} />
            </div>
          )}

          {/* Trending View */}
          {activeView === "trending" && (
            <div className="pt-8">
              <TrendingSection onSearch={handleSearch} />
            </div>
          )}

          {/* Faculty Studio View (faculty + admin only) */}
          {activeView === "faculty" && (userRole === "faculty" || userRole === "admin") && (
            <div className="pt-8">
              <FacultyMode />
            </div>
          )}

          {/* Admin Dashboard View (admin only) */}
          {activeView === "admin" && userRole === "admin" && (
            <div className="pt-8">
              <AdminDashboard />
            </div>
          )}

          {/* Footer */}
          <footer className="border-t border-border px-4 py-6 text-center">
            <p className="text-xs text-muted-foreground">
              EduNexus &mdash; A Unified AI Knowledge Infrastructure for Smart
              Campuses
            </p>
          </footer>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileBottomNav
        activeView={activeView}
        onNavigate={handleNavigate}
        userRole={userRole}
      />
    </div>
  )
}
