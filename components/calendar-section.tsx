"use client"

import { useTimeTracking } from "@/components/time-tracking-provider"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, RefreshCw, LogIn, LogOut } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"

export function CalendarSection() {
  const { selectedDate, setSelectedDate, syncWithGoogleCalendar, isLoading, isAuthenticated, signIn, signOut, user } =
    useTimeTracking()
  const [calendarOpen, setCalendarOpen] = useState(false)

  const handleSync = async () => {
    if (!isAuthenticated) {
      signIn()
      return
    }
    await syncWithGoogleCalendar()
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Calendar</h2>
        <div className="flex items-center space-x-2">
          {/* Authentication Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={isAuthenticated ? signOut : signIn}
            className={isAuthenticated ? "text-green-600 border-green-200" : ""}
          >
            {isAuthenticated ? (
              <>
                <LogOut className="h-4 w-4 mr-1" />
                {user?.name || "Sign Out"}
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4 mr-1" />
                Sign in with Google
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

          <Button variant="outline" size="icon" onClick={handleSync} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-2">View and sync your Google Calendar events</p>
      <p className="text-sm text-gray-500">
        {isAuthenticated
          ? "Select a date to view and manage time entries. Click the sync button to import the entire week's events from Google Calendar."
          : "Sign in with Google to sync your calendar events and automatically import time entries."}
      </p>
      {!isAuthenticated && (
        <div className="mt-3 p-3 bg-blue-50 text-blue-700 text-sm rounded-md">
          💡 Sign in to automatically sync your Google Calendar events and extract job numbers, clients, and phases.
        </div>
      )}
    </div>
  )
}
