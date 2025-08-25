"use client"

import { TimeTrackingProvider } from "@/components/time-tracking-provider"
import { CalendarView } from "@/components/calendar-view"
import TimeEntryList from "@/components/time-entry-list"
import WeeklySummary from "@/components/weekly-summary"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { useTimeTracking } from "@/components/time-tracking-provider"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function TimeTrackerContent() {
  const { timeEntries, selectedDate, dailySummary, weeklySummary } = useTimeTracking()

  // Filter entries for the selected date
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd")
  const entriesForDay = timeEntries.filter((entry) => entry.start.startsWith(selectedDateStr))

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-2">TimeTracker Buddy</h1>
          <p className="text-center text-muted-foreground">Track your time with Google Calendar integration</p>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Today's Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round((dailySummary.totalMinutes / 60) * 100) / 100}h</div>
              <p className="text-xs text-muted-foreground">{dailySummary.totalMinutes} minutes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {Math.round((dailySummary.billableMinutes / 60) * 100) / 100}h
              </div>
              <p className="text-xs text-muted-foreground">{dailySummary.billableMinutes} minutes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Non-Billable</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {Math.round((dailySummary.nonBillableMinutes / 60) * 100) / 100}h
              </div>
              <p className="text-xs text-muted-foreground">{dailySummary.nonBillableMinutes} minutes</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Calendar */}
          <div className="space-y-6">
            <CalendarView />
          </div>

          {/* Right Column - Time Entries */}
          <div className="space-y-6">
            <TimeEntryList entries={entriesForDay} day={selectedDateStr} />
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="mt-6">
          <WeeklySummary entriesForWeek={weeklySummary.dailyBreakdown} />
        </div>
      </div>
      <Toaster />
    </div>
  )
}

export default function HomePage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TimeTrackingProvider>
        <TimeTrackerContent />
      </TimeTrackingProvider>
    </ThemeProvider>
  )
}
