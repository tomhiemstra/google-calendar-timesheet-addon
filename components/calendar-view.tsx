"use client"

import { useTimeTracking } from "@/components/time-tracking-provider"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, RefreshCw, Zap, LogIn, LogOut } from "lucide-react"
import { format, startOfWeek, endOfWeek } from "date-fns"
import { useState } from "react"

export function CalendarView() {
  const {
    selectedDate,
    setSelectedDate,
    syncWithGoogleCalendar,
    syncWithAppsScript,
    isAuthenticated,
    user,
    signIn,
    signOut,
  } = useTimeTracking()

  const [isSyncing, setIsSyncing] = useState(false)
  const [isAppsScriptSyncing, setIsAppsScriptSyncing] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const weekStart = startOfWeek(selectedDate)
      const weekEnd = endOfWeek(selectedDate)
      await syncWithGoogleCalendar(weekStart, weekEnd)
    } catch (error) {
      console.error("Error in sync:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleAppsScriptSync = async () => {
    setIsAppsScriptSyncing(true)
    try {
      await syncWithAppsScript()
    } catch (error) {
      console.error("Error in Apps Script sync:", error)
    } finally {
      setIsAppsScriptSyncing(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle>Calendar</CardTitle>
          <CardDescription>View and sync your Google Calendar events</CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          {/* Authentication Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={isAuthenticated ? signOut : signIn}
            className={isAuthenticated ? "text-green-600" : ""}
          >
            {isAuthenticated ? (
              <>
                <LogOut className="h-4 w-4 mr-1" />
                {user?.name || "Sign Out"}
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4 mr-1" />
                Demo Sign In
              </>
            )}
          </Button>

          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "MMMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date)
                    setCalendarOpen(false)
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Apps Script Sync Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAppsScriptSync}
            disabled={isAppsScriptSyncing}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700"
            title="Sync with enhanced Apps Script data"
          >
            <Zap className={`h-4 w-4 mr-1 ${isAppsScriptSyncing ? "animate-spin" : ""}`} />
            {isAppsScriptSyncing ? "Syncing..." : "Apps Script"}
          </Button>

          {/* Regular Google Calendar Sync */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleSync}
            disabled={isSyncing}
            title="Sync week's events from Google Calendar (Demo)"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
            <span className="sr-only">Sync with Google Calendar</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            {isAuthenticated
              ? "Select a date to view and manage time entries. Use the sync buttons to import events:"
              : "This is a demo version. Sign in to test the sync functionality with mock data."}
          </p>
          <div className="flex flex-col space-y-1 text-xs">
            <div className="flex items-center">
              <Zap className="h-3 w-3 mr-1 text-blue-500" />
              <span>
                <strong>Apps Script:</strong> Enhanced sync with custom fields (job numbers, clients, phases)
              </span>
            </div>
            <div className="flex items-center">
              <RefreshCw className="h-3 w-3 mr-1 text-gray-500" />
              <span>
                <strong>Standard Sync:</strong> Basic Google Calendar events with auto-detection
              </span>
            </div>
          </div>
        </div>
        {!isAuthenticated && (
          <div className="mt-2 p-2 bg-blue-50 text-blue-700 text-sm rounded-md">
            💡 This is a demo version with sample data. Click "Demo Sign In" to test sync functionality.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default CalendarView
