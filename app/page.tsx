"use client"

import { TimeTrackingProvider } from "@/components/time-tracking-provider"
import { CalendarSection } from "@/components/calendar-section"
import { TimeEntriesSection } from "@/components/time-entries-section"
import { DailySummary } from "@/components/daily-summary"
import { WeeklySummary } from "@/components/weekly-summary"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { useTimeTracking } from "@/components/time-tracking-provider"
import { Clock } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useState } from "react"

function TimeTrackerContent() {
  const { selectedDate } = useTimeTracking()
  const [activeView, setActiveView] = useState<"daily" | "weekly">("daily")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-gray-600" />
            <h1 className="text-lg font-semibold text-gray-900">TimeTracker Buddy</h1>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">Tom Hiemstra</span>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-red-500 text-white text-sm">TH</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Left Column */}
        <div className="flex-1 p-6 space-y-6">
          <CalendarSection />
          <TimeEntriesSection />
        </div>

        {/* Right Column */}
        <div className="w-80 bg-white border-l border-gray-200 p-6">
          {/* View Toggle */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setActiveView("daily")}
              className={`text-sm font-medium ${
                activeView === "daily" ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Daily View
            </button>
            <button
              onClick={() => setActiveView("weekly")}
              className={`text-sm font-medium ${
                activeView === "weekly" ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Weekly View
            </button>
          </div>

          {/* Content based on active view */}
          {activeView === "daily" ? <DailySummary /> : <WeeklySummary />}
        </div>
      </div>
      <Toaster />
    </div>
  )
}

export default function HomePage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TimeTrackingProvider>
        <TimeTrackerContent />
      </TimeTrackingProvider>
    </ThemeProvider>
  )
}
