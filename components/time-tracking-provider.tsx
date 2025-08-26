"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { format, startOfWeek, endOfWeek, parseISO, addDays } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { googleCalendarService, type GoogleUser } from "@/lib/google-auth"
import { extractJobNumber, extractClientName, extractJobPhase, categorizeTaskType } from "@/utils/job-extraction"
import { apiClient } from "@/lib/api-client"

// Simple ID generator to replace uuid
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Define the types
interface TimeEntry {
  id: string
  title: string
  start: string
  end: string
  jobNumber: string
  jobPhase?: string
  clientName?: string
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
  user: GoogleUser | null
  isAuthenticated: boolean
  signIn: (googleUser: GoogleUser) => void
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
  exportTimesheet: () => Promise<void>
  exportWeeklyTimesheet: () => Promise<void>
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
  const [user, setUser] = useState<GoogleUser | null>(null)
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
        const userData = JSON.parse(savedUser)
        setIsAuthenticated(true)
        setUser(userData)
        googleCalendarService.setAccessToken(userData.accessToken)
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

  // Real Google sign in
  const signIn = (googleUser: GoogleUser) => {
    setIsAuthenticated(true)
    setUser(googleUser)
    googleCalendarService.setAccessToken(googleUser.accessToken)

    toast({
      title: "Signed In Successfully",
      description: `Welcome ${googleUser.name}! You can now sync your Google Calendar.`,
    })
  }

  // Sign out
  const signOut = () => {
    setIsAuthenticated(false)
    setUser(null)
    googleCalendarService.signOut()

    toast({
      title: "Signed Out",
      description: "You have been signed out successfully.",
    })
  }

  // Real Google Calendar sync using our API
  const syncWithGoogleCalendar = async () => {
    if (!isAuthenticated || !user) {
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
        description: "Fetching events from your Google Calendar...",
      })

      const weekStart = startOfWeek(selectedDate)
      const weekEnd = endOfWeek(selectedDate)

      // Use our API client instead of direct Google API calls
      const events = await apiClient.syncCalendar(user.accessToken, weekStart, weekEnd)
      let addedCount = 0

      for (const event of events) {
        const existingEntry = timeEntries.find((entry) => entry.calendarEventId === event.id)

        if (!existingEntry) {
          const startDate = new Date(event.start)
          const endDate = new Date(event.end)
          const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000)

          // Extract information from event
          const fullText = `${event.title || ""} ${event.description || ""}`
          const jobNumber = extractJobNumber(fullText)
          const clientName = extractClientName(fullText)
          const jobPhase = extractJobPhase(fullText)
          const taskType = categorizeTaskType(event.title || "", event.description)

          addTimeEntry({
            title: event.title || "Untitled Event",
            start: event.start,
            end: event.end,
            jobNumber,
            jobPhase,
            clientName,
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
        description: "Failed to sync with Google Calendar. Please check your permissions and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Export timesheet using API
  const exportTimesheet = async () => {
    try {
      const blob = await apiClient.exportTimesheet({
        format: "csv",
        startDate: selectedDate,
        endDate: selectedDate,
        category: activeCategoryFilter || undefined,
      })

      const filename = `timesheet-${format(selectedDate, "yyyy-MM-dd")}${activeCategoryFilter ? `-${activeCategoryFilter}` : ""}.csv`
      apiClient.downloadFile(blob as Blob, filename)

      toast({
        title: "Export Complete",
        description: `Timesheet for ${format(selectedDate, "MMMM d, yyyy")} has been exported.`,
      })
    } catch (error) {
      console.error("Export failed:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export timesheet. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Export weekly timesheet using API
  const exportWeeklyTimesheet = async () => {
    try {
      const weekStart = startOfWeek(selectedDate)
      const weekEnd = endOfWeek(selectedDate)

      const blob = await apiClient.exportTimesheet({
        format: "csv",
        startDate: weekStart,
        endDate: weekEnd,
        category: activeCategoryFilter || undefined,
      })

      const filename = `weekly-timesheet-${format(weekStart, "yyyy-MM-dd")}-to-${format(weekEnd, "yyyy-MM-dd")}${activeCategoryFilter ? `-${activeCategoryFilter}` : ""}.csv`
      apiClient.downloadFile(blob as Blob, filename)

      toast({
        title: "Export Complete",
        description: `Weekly timesheet from ${format(weekStart, "MMM d")} to ${format(weekEnd, "MMM d, yyyy")} has been exported.`,
      })
    } catch (error) {
      console.error("Weekly export failed:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export weekly timesheet. Please try again.",
        variant: "destructive",
      })
    }
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
