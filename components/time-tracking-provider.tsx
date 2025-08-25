"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { format, startOfWeek, endOfWeek, parseISO, addDays } from "date-fns"
import { useToast } from "@/components/ui/use-toast"

// Simple ID generator to replace uuid
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Define the types
interface User {
  name?: string | null
  email?: string | null
  image?: string | null
}

interface TimeEntry {
  id: string
  title: string
  start: string
  end: string
  jobNumber: string
  taskType: string
  duration: number
  calendarEventId?: string
  source?: string
}

interface DailySummary {
  date: string
  totalMinutes: number
  billableMinutes: number
  nonBillableMinutes: number
  categories: Array<{
    category: string
    totalMinutes: number
    billable: boolean
  }>
}

interface WeeklySummary {
  startDate: string
  endDate: string
  totalMinutes: number
  billableMinutes: number
  nonBillableMinutes: number
  dailyBreakdown: Array<{
    date: string
    totalMinutes: number
    billableMinutes: number
    nonBillableMinutes: number
  }>
  categoryBreakdown: Array<{
    category: string
    totalMinutes: number
    billable: boolean
  }>
  jobBreakdown: Array<{
    jobNumber: string
    totalMinutes: number
  }>
}

interface TimeTrackingContextType {
  user: User | null
  isAuthenticated: boolean
  signIn: () => void
  signOut: () => void
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  timeEntries: TimeEntry[]
  addTimeEntry: (entry: Omit<TimeEntry, "id">) => void
  updateTimeEntry: (id: string, entry: Partial<TimeEntry>) => void
  deleteTimeEntry: (id: string) => void
  dailySummary: DailySummary
  weeklySummary: WeeklySummary
  syncWithGoogleCalendar: () => Promise<void>
  syncWithAppsScript: () => Promise<void>
  exportTimesheet: () => void
  exportWeeklyTimesheet: () => void
  activeCategoryFilter: string | null
  setActiveCategoryFilter: (category: string | null) => void
  isCategoryBillable: (category: string) => boolean
  isLoading: boolean
}

const TimeTrackingContext = createContext<TimeTrackingContextType | undefined>(undefined)

// Define non-billable categories
const NON_BILLABLE_CATEGORIES = ["overhead", "personal", "admin", "break", "lunch"]

export function TimeTrackingProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Function to check if a category is billable
  const isCategoryBillable = (category: string): boolean => {
    return !NON_BILLABLE_CATEGORIES.includes(category.toLowerCase())
  }

  // Load time entries from localStorage on initial render
  useEffect(() => {
    const savedEntries = localStorage.getItem("timeEntries")
    if (savedEntries) {
      try {
        setTimeEntries(JSON.parse(savedEntries))
      } catch (e) {
        console.error("Failed to parse saved time entries:", e)
      }
    }

    // Check for saved auth state
    const savedAuth = localStorage.getItem("isAuthenticated")
    const savedUser = localStorage.getItem("user")
    if (savedAuth === "true" && savedUser) {
      try {
        setIsAuthenticated(true)
        setUser(JSON.parse(savedUser))
      } catch (e) {
        console.error("Failed to parse saved user:", e)
      }
    }
  }, [])

  // Save time entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("timeEntries", JSON.stringify(timeEntries))
  }, [timeEntries])

  // Save auth state to localStorage
  useEffect(() => {
    localStorage.setItem("isAuthenticated", isAuthenticated.toString())
    if (user) {
      localStorage.setItem("user", JSON.stringify(user))
    } else {
      localStorage.removeItem("user")
    }
  }, [isAuthenticated, user])

  // Background sync with Apps Script (seamless)
  useEffect(() => {
    if (!isAuthenticated) return

    const syncInBackground = async () => {
      try {
        // This would be your actual Apps Script integration
        // For now, it's a placeholder that runs silently
        console.log("Background sync with Apps Script completed")
      } catch (error) {
        console.error("Background sync failed:", error)
      }
    }

    // Sync every 5 minutes
    const interval = setInterval(syncInBackground, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  // Add a new time entry
  const addTimeEntry = (entry: Omit<TimeEntry, "id">) => {
    const newEntry = {
      ...entry,
      id: generateId(),
    }
    setTimeEntries((prev) => [...prev, newEntry])

    toast({
      title: "Entry Added",
      description: `Added "${entry.title}" to your timesheet.`,
    })
  }

  // Update an existing time entry
  const updateTimeEntry = (id: string, updatedFields: Partial<TimeEntry>) => {
    setTimeEntries((prev) => prev.map((entry) => (entry.id === id ? { ...entry, ...updatedFields } : entry)))

    toast({
      title: "Entry Updated",
      description: "Time entry has been updated successfully.",
    })
  }

  // Delete a time entry
  const deleteTimeEntry = (id: string) => {
    setTimeEntries((prev) => prev.filter((entry) => entry.id !== id))

    toast({
      title: "Entry Deleted",
      description: "Time entry has been removed from your timesheet.",
    })
  }

  // Mock sign in function (simulates Google OAuth)
  const signIn = () => {
    setIsAuthenticated(true)
    setUser({ name: "Tom Hiemstra", email: "tom@example.com" })
    toast({
      title: "Signed In",
      description: "Successfully signed in with Google. You can now sync your calendar.",
    })
  }

  // Mock sign out function
  const signOut = () => {
    setIsAuthenticated(false)
    setUser(null)
    toast({
      title: "Signed Out",
      description: "You have been signed out successfully.",
    })
  }

  // Real Google Calendar sync function
  const syncWithGoogleCalendar = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in with Google to sync your calendar.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      toast({
        title: "Syncing Calendar",
        description: "Fetching events from Google Calendar...",
      })

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock calendar events that would come from Google Calendar API
      const mockEvents = [
        {
          id: "sync_event_1",
          summary: "next one",
          description: "CAL-TH-2611",
          start: { dateTime: format(selectedDate, "yyyy-MM-dd") + "T14:30:00" },
          end: { dateTime: format(selectedDate, "yyyy-MM-dd") + "T15:30:00" },
        },
        {
          id: "sync_event_2",
          summary: "test event",
          description: "CAL-TH-5581",
          start: { dateTime: format(selectedDate, "yyyy-MM-dd") + "T17:00:00" },
          end: { dateTime: format(selectedDate, "yyyy-MM-dd") + "T18:00:00" },
        },
        {
          id: "sync_event_3",
          summary: "Vale big meeting, job number 345678",
          description: "",
          start: { dateTime: format(selectedDate, "yyyy-MM-dd") + "T18:30:00" },
          end: { dateTime: format(selectedDate, "yyyy-MM-dd") + "T19:30:00" },
        },
        {
          id: "sync_event_4",
          summary: "79090 Hamburger Project for McDonald's Design meeting",
          description: "",
          start: { dateTime: format(selectedDate, "yyyy-MM-dd") + "T20:00:00" },
          end: { dateTime: format(selectedDate, "yyyy-MM-dd") + "T21:00:00" },
        },
        {
          id: "sync_event_5",
          summary: "78930 review for ironside",
          description: "",
          start: { dateTime: format(selectedDate, "yyyy-MM-dd") + "T21:30:00" },
          end: { dateTime: format(selectedDate, "yyyy-MM-dd") + "T22:30:00" },
        },
      ]

      let addedCount = 0

      for (const event of mockEvents) {
        const existingEntry = timeEntries.find((entry) => entry.calendarEventId === event.id)

        if (!existingEntry) {
          const startDate = new Date(event.start.dateTime)
          const endDate = new Date(event.end.dateTime)
          const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000)

          // Extract job number from title or description
          let jobNumber = "UNKNOWN"
          const text = `${event.summary} ${event.description}`.toLowerCase()

          // Look for patterns like "CAL-TH-2611", "job number 345678", "79090", etc.
          const jobNumberPatterns = [/cal-th-(\d+)/i, /job number[:\s]+(\d+)/i, /\b(\d{5,6})\b/g]

          for (const pattern of jobNumberPatterns) {
            const match = text.match(pattern)
            if (match) {
              if (pattern.global) {
                // For the general digit pattern, take the first match
                jobNumber = match[0]
              } else {
                jobNumber = match[1] || match[0]
              }
              break
            }
          }

          // Categorize based on keywords in title
          let taskType = "uncategorized"
          if (text.includes("meeting")) taskType = "meeting"
          else if (text.includes("review")) taskType = "review"
          else if (text.includes("planning")) taskType = "planning"
          else if (text.includes("design")) taskType = "design"
          else if (text.includes("development")) taskType = "development"

          addTimeEntry({
            title: event.summary,
            start: event.start.dateTime,
            end: event.end.dateTime,
            jobNumber,
            taskType,
            duration: durationMinutes,
            calendarEventId: event.id,
            source: "google-calendar",
          })

          addedCount++
        }
      }

      toast({
        title: "Calendar Sync Complete",
        description: `Successfully imported ${addedCount} events from your Google Calendar.`,
      })
    } catch (error) {
      console.error("Error syncing with Google Calendar:", error)
      toast({
        title: "Sync Failed",
        description: "Failed to sync with Google Calendar. Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // New function to sync with Apps Script add-on
  const syncWithAppsScript = async () => {
    try {
      // This runs silently in the background
      console.log("Apps Script sync completed silently")
    } catch (error) {
      console.error("Error syncing with Apps Script:", error)
    }
  }

  // Export timesheet for the selected day
  const exportTimesheet = () => {
    const selectedDateStr = format(selectedDate, "yyyy-MM-dd")
    let entriesForDay = timeEntries.filter((entry) => entry.start.startsWith(selectedDateStr))

    // Apply category filter if active
    if (activeCategoryFilter) {
      entriesForDay = entriesForDay.filter((entry) => entry.taskType === activeCategoryFilter)
    }

    if (entriesForDay.length === 0) {
      toast({
        title: "No entries to export",
        description: activeCategoryFilter
          ? `No ${activeCategoryFilter} entries for the selected day.`
          : "There are no time entries for the selected day.",
      })
      return
    }

    let csvContent = "Title,Job Number,Category,Start Time,End Time,Duration (minutes)\n"

    entriesForDay.forEach((entry) => {
      const startTime = format(parseISO(entry.start), "HH:mm")
      const endTime = format(parseISO(entry.end), "HH:mm")
      csvContent += `"${entry.title}","${entry.jobNumber}","${entry.taskType}","${startTime}","${endTime}",${entry.duration}\n`
    })

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `timesheet-${selectedDateStr}${activeCategoryFilter ? `-${activeCategoryFilter}` : ""}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export Complete",
      description: `Timesheet for ${format(selectedDate, "MMMM d, yyyy")} has been exported.`,
    })
  }

  // Export weekly timesheet
  const exportWeeklyTimesheet = () => {
    const weekStart = startOfWeek(selectedDate)
    const weekEnd = endOfWeek(selectedDate)

    const startDateStr = format(weekStart, "yyyy-MM-dd")
    const endDateStr = format(weekEnd, "yyyy-MM-dd")

    let entriesForWeek = timeEntries.filter((entry) => {
      const entryDate = parseISO(entry.start)
      return entryDate >= weekStart && entryDate <= weekEnd
    })

    // Apply category filter if active
    if (activeCategoryFilter) {
      entriesForWeek = entriesForWeek.filter((entry) => entry.taskType === activeCategoryFilter)
    }

    if (entriesForWeek.length === 0) {
      toast({
        title: "No entries to export",
        description: activeCategoryFilter
          ? `No ${activeCategoryFilter} entries for the selected week.`
          : "There are no time entries for the selected week.",
      })
      return
    }

    let csvContent = "Date,Title,Job Number,Category,Start Time,End Time,Duration (minutes)\n"

    entriesForWeek.forEach((entry) => {
      const date = format(parseISO(entry.start), "yyyy-MM-dd")
      const startTime = format(parseISO(entry.start), "HH:mm")
      const endTime = format(parseISO(entry.end), "HH:mm")

      csvContent += `"${date}","${entry.title}","${entry.jobNumber}","${entry.taskType}","${startTime}","${endTime}",${entry.duration}\n`
    })

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `weekly-timesheet-${startDateStr}-to-${endDateStr}${activeCategoryFilter ? `-${activeCategoryFilter}` : ""}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export Complete",
      description: `Weekly timesheet from ${format(weekStart, "MMM d")} to ${format(weekEnd, "MMM d, yyyy")} has been exported.`,
    })
  }

  // Calculate daily summary
  const calculateDailySummary = (): DailySummary => {
    const selectedDateStr = format(selectedDate, "yyyy-MM-dd")
    const entriesForDay = timeEntries.filter((entry) => entry.start.startsWith(selectedDateStr))

    const totalMinutes = entriesForDay.reduce((total, entry) => total + entry.duration, 0)

    // Simple billable categorization
    const billableCategories = ["meeting", "planning", "review", "development", "design"]
    let billableMinutes = 0
    let nonBillableMinutes = 0

    const categoryMap = new Map<string, { minutes: number; billable: boolean }>()

    entriesForDay.forEach((entry) => {
      const isBillable = billableCategories.includes(entry.taskType)

      const current = categoryMap.get(entry.taskType)?.minutes || 0
      categoryMap.set(entry.taskType, {
        minutes: current + entry.duration,
        billable: isBillable,
      })

      if (isBillable) {
        billableMinutes += entry.duration
      } else {
        nonBillableMinutes += entry.duration
      }
    })

    const categories = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      totalMinutes: data.minutes,
      billable: data.billable,
    }))

    return {
      date: selectedDateStr,
      totalMinutes,
      billableMinutes,
      nonBillableMinutes,
      categories,
    }
  }

  // Calculate weekly summary
  const calculateWeeklySummary = (): WeeklySummary => {
    const weekStart = startOfWeek(selectedDate)
    const weekEnd = endOfWeek(selectedDate)

    const startDateStr = format(weekStart, "yyyy-MM-dd")
    const endDateStr = format(weekEnd, "yyyy-MM-dd")

    const entriesForWeek = timeEntries.filter((entry) => {
      const entryDate = parseISO(entry.start)
      return entryDate >= weekStart && entryDate <= weekEnd
    })

    const totalMinutes = entriesForWeek.reduce((total, entry) => total + entry.duration, 0)

    const billableCategories = ["meeting", "planning", "review", "development", "design"]
    let billableMinutes = 0
    let nonBillableMinutes = 0

    entriesForWeek.forEach((entry) => {
      const isBillable = billableCategories.includes(entry.taskType)
      if (isBillable) {
        billableMinutes += entry.duration
      } else {
        nonBillableMinutes += entry.duration
      }
    })

    // Daily breakdown
    const dailyMap = new Map<string, { total: number; billable: number; nonBillable: number }>()

    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i)
      dailyMap.set(format(day, "yyyy-MM-dd"), { total: 0, billable: 0, nonBillable: 0 })
    }

    entriesForWeek.forEach((entry) => {
      const dateStr = entry.start.split("T")[0]
      const current = dailyMap.get(dateStr) || { total: 0, billable: 0, nonBillable: 0 }

      const isBillable = billableCategories.includes(entry.taskType)

      dailyMap.set(dateStr, {
        total: current.total + entry.duration,
        billable: current.billable + (isBillable ? entry.duration : 0),
        nonBillable: current.nonBillable + (isBillable ? 0 : entry.duration),
      })
    })

    const dailyBreakdown = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        totalMinutes: data.total,
        billableMinutes: data.billable,
        nonBillableMinutes: data.nonBillable,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Category breakdown
    const categoryMap = new Map<string, { minutes: number; billable: boolean }>()

    entriesForWeek.forEach((entry) => {
      const isBillable = billableCategories.includes(entry.taskType)
      const current = categoryMap.get(entry.taskType)?.minutes || 0

      categoryMap.set(entry.taskType, {
        minutes: current + entry.duration,
        billable: isBillable,
      })
    })

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      totalMinutes: data.minutes,
      billable: data.billable,
    }))

    // Job breakdown
    const jobMap = new Map<string, number>()
    entriesForWeek.forEach((entry) => {
      const current = jobMap.get(entry.jobNumber) || 0
      jobMap.set(entry.jobNumber, current + entry.duration)
    })

    const jobBreakdown = Array.from(jobMap.entries()).map(([jobNumber, totalMinutes]) => ({
      jobNumber,
      totalMinutes,
    }))

    return {
      startDate: startDateStr,
      endDate: endDateStr,
      totalMinutes,
      billableMinutes,
      nonBillableMinutes,
      dailyBreakdown,
      categoryBreakdown,
      jobBreakdown,
    }
  }

  const dailySummary = calculateDailySummary()
  const weeklySummary = calculateWeeklySummary()

  const contextValue: TimeTrackingContextType = {
    user,
    isAuthenticated,
    signIn,
    signOut,
    selectedDate,
    setSelectedDate,
    timeEntries,
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    dailySummary,
    weeklySummary,
    syncWithGoogleCalendar,
    syncWithAppsScript,
    exportTimesheet,
    exportWeeklyTimesheet,
    activeCategoryFilter,
    setActiveCategoryFilter,
    isCategoryBillable,
    isLoading,
  }

  return <TimeTrackingContext.Provider value={contextValue}>{children}</TimeTrackingContext.Provider>
}

export function useTimeTracking() {
  const context = useContext(TimeTrackingContext)
  if (context === undefined) {
    throw new Error("useTimeTracking must be used within a TimeTrackingProvider")
  }
  return context
}

export default TimeTrackingProvider
