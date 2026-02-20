"use client"

import { useState, useEffect } from "react"
import {
  Zap,
  BookOpen,
  Search,
  BarChart3,
  Users,
  Trophy,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  Target,
  Clock,
  Award,
  TrendingUp,
  MessageCircle,
  FileText,
  Video,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const demoFeatures = [
  {
    icon: Search,
    title: "Smart Search",
    description: "Find study materials across all subjects instantly",
    color: "bg-sky-500/10 text-sky-400",
  },
  {
    icon: BookOpen,
    title: "Research Hub",
    description: "Access curated research papers and academic resources",
    color: "bg-orange-500/10 text-orange-400",
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "Connect with peers and faculty for group study",
    color: "bg-pink-500/10 text-pink-400",
  },
  {
    icon: BarChart3,
    title: "Study Analytics",
    description: "Track your learning progress with detailed insights",
    color: "bg-purple-500/10 text-purple-400",
  },
  {
    icon: Trophy,
    title: "Achievement System",
    description: "Earn badges and compete on leaderboards",
    color: "bg-yellow-500/10 text-yellow-400",
  },
  {
    icon: Lightbulb,
    title: "AI Synthesis",
    description: "Get hardcoded summaries for Laplace, Data Structures & Transformers",
    color: "bg-cyan-500/10 text-cyan-400",
  },
]

const testimonials = [
  {
    name: "Arjun Kumar",
    role: "3rd Year Student",
    text: "The AI synthesis search helped me understand Laplace Transform in minutes!",
    score: 4.9,
  },
  {
    name: "Priya Singh",
    role: "2nd Year Student",
    text: "Study Mode completely changed how I prepare for exams.",
    score: 4.8,
  },
  {
    name: "Raj Patel",
    role: "Final Year Student",
    text: "Collaboration feature connected me with amazing research partners.",
    score: 5.0,
  },
]

const stats = [
  { label: "Active Students", value: "2,500+" },
  { label: "Study Materials", value: "15,000+" },
  { label: "Daily Users", value: "800+" },
]

function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: typeof Search
  title: string
  description: string
  color: string
}) {
  return (
    <Card className="group relative overflow-hidden border-border/50 bg-secondary/50 p-6 hover:border-border/80 hover:bg-secondary/70 transition-all duration-300">
      <div className={`w-fit rounded-lg p-3 mb-4 ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      <ArrowRight className="absolute right-4 bottom-4 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  )
}

function TestimonialCard({
  name,
  role,
  text,
  score,
}: {
  name: string
  role: string
  text: string
  score: number
}) {
  return (
    <Card className="border-border/50 bg-secondary/50 p-6">
      <div className="flex items-center gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < Math.floor(score) ? "text-yellow-400" : "text-muted-foreground"}>
            ★
          </span>
        ))}
      </div>
      <p className="text-sm text-muted-foreground mb-4">{text}</p>
      <div>
        <p className="font-semibold text-sm">{name}</p>
        <p className="text-xs text-muted-foreground">{role}</p>
      </div>
    </Card>
  )
}

export function StudentDemo() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-8">
          <Badge className="mx-auto bg-sky-500/20 text-sky-300 border-sky-500/30">
            Welcome to EduNexus
          </Badge>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Your Smart Learning Companion
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore smart search, AI synthesis, study tools, and collaborate with peers—all in one platform designed for modern students.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="gap-2 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600">
              <Zap className="h-5 w-5" />
              Explore Features
            </Button>
            <Button size="lg" variant="outline">
              Learn More
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-12">
            {stats.map((stat, i) => (
              <div key={i} className="space-y-2">
                <p className="text-3xl font-bold text-sky-400">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold">Powerful Features for Students</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to excel in your studies, all in one intelligent platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoFeatures.map((feature, i) => (
              <FeatureCard key={i} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Key Capabilities Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>

          <div className="space-y-12">
            {[
              {
                num: "01",
                title: "Smart Search",
                desc: "Type your question and get instant answers from study materials, faculty resources, and AI-powered synthesis",
                icon: Search,
              },
              {
                num: "02",
                title: "Personalized Learning",
                desc: "Get AI summaries on complex topics like Laplace Transform, Data Structures, and Transformers instantly",
                icon: Target,
              },
              {
                num: "03",
                title: "Track Progress",
                desc: "Monitor your learning with detailed analytics and earn achievement badges",
                icon: TrendingUp,
              },
              {
                num: "04",
                title: "Collaborate",
                desc: "Find study partners, join research groups, and connect with faculty mentors",
                icon: Users,
              },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="flex gap-6 items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-14 w-14 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 text-white font-bold">
                      {item.num}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold">What Students Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real feedback from students using EduNexus daily
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <TestimonialCard key={i} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-sky-500/10 via-purple-500/10 to-pink-500/10 border-t border-border/50">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold">Ready to Transform Your Learning?</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of students already using EduNexus to ace their exams and projects
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600">
              <Zap className="h-5 w-5" />
              Get Started Now
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            No credit card required • Free tier available • 24/7 support
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">All Features Explained</h2>

          <div className="space-y-8">
            {[
              {
                title: "AI Synthesis Search",
                desc: "Hardcoded knowledge base for instant answers on Laplace Transform, Data Structures, and Transformers",
                icon: Lightbulb,
                features: ["Instant answers", "Hardcoded KB", "No wait time", "Always available"],
              },
              {
                title: "Research Hub",
                desc: "Access curated research papers, journals, and academic resources from top institutions",
                icon: FileText,
                features: ["Curated content", "Faculty verified", "Latest papers", "Multi-subject"],
              },
              {
                title: "Study Mode",
                desc: "Immersive focused environment for distraction-free learning and exam preparation",
                icon: Video,
                features: ["Distraction-free", "Progress tracking", "Time management", "Full screen mode"],
              },
              {
                title: "Collaboration Tools",
                desc: "Connect with peers, form study groups, and interact with faculty in real-time",
                icon: MessageCircle,
                features: ["Live chat", "Group projects", "Faculty access", "Peer mentoring"],
              },
            ].map((section, i) => {
              const Icon = section.icon
              return (
                <Card key={i} className="border-border/50 bg-secondary/50 p-8 hover:border-border/80 transition-all duration-300">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-gradient-to-br from-sky-500/20 to-cyan-500/20 text-sky-400">
                        <Icon className="h-8 w-8" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">{section.title}</h3>
                      <p className="text-muted-foreground mb-4">{section.desc}</p>
                      <div className="flex flex-wrap gap-2">
                        {section.features.map((feature, j) => (
                          <Badge key={j} variant="secondary" className="bg-secondary/50">
                            <CheckCircle2 className="h-3 w-3 mr-1.5" />
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
