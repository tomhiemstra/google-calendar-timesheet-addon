"use client"

import { useTimeTracking } from "@/components/time-tracking-provider"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { GoogleSignIn } from "@/components/google-sign-in"
import { CalendarIcon, RefreshCw, LogOut } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"

export function CalendarSection() {
  const { selectedDate, setSelectedDate, syncWithGoogleCalendar, isLoading, isAuthenticated, signOut, signIn, user } =
    useTimeTracking()
  const [calendarOpen, setCalendarOpen] = useState(false)

  const handleSync = async () => {
    await syncWithGoogleCalendar()
  }

  const handleSignInSuccess = (googleUser: any) => {
    signIn(googleUser)
  }

  const handleSignInError = (error: Error) => {
    console.error("Google Sign-In Error:", error)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Calendar</h2>
        <div className="flex items-center space-x-2">
          {isAuthenticated && user ? (
            <>
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 rounded-lg">
                <img
                  src={user.picture || "/placeholder.svg"}
                  alt={user.name}
                  className="w-6 h-6 rounded-full"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
                <div
                  className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                  style={{ display: user.picture ? "none" : "flex" }}
                >
                  {user.name?.charAt(0) || "U"}
                </div>
                <span className="text-sm font-medium text-green-800">{user.name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            </>
          ) : null}

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

          <Button
            variant="outline"
            size="icon"
            onClick={handleSync}
            disabled={isLoading || !isAuthenticated}
            title={!isAuthenticated ? "Sign in to sync calendar" : "Sync with Google Calendar"}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {!isAuthenticated ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Sign in with Google to sync your calendar events</p>
          <GoogleSignIn onSignIn={handleSignInSuccess} onError={handleSignInError} />
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Viewing calendar for {user?.name} ({user?.email})
          </p>
          <p className="text-sm text-gray-500">
            Select a date to view and manage time entries. Click the sync button to import the entire week's events from
            your Google Calendar.
          </p>
          <div className="p-3 bg-green-50 text-green-700 text-sm rounded-md">
            ✅ Connected to Google Calendar. Click sync to import your events.
          </div>
        </div>
      )}
    </div>
  )
}
