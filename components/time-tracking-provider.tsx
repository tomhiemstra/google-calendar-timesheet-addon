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

// Updated TimeEntry interface to include clientName and enhanced fields
interface TimeEntry {
  id: string
  title: string
  start: string
  end: string
  jobNumber: string
  jobPhase?: string
  clientName?: string
  projectName?: string
  phaseNumber?: string
  taskType: string
  billableType?: string
  duration: number
  calendarEventId?: string
  source?: string
  autoDetected?: boolean
  syncedAt?: string
}

interface CategorySummary {
  category: string
  totalMinutes: number
  billable: boolean
}

interface JobSummary {
  jobNumber: string
  totalMinutes: number
}

interface DailySummary {
  date: string
  totalMinutes: number
  billableMinutes: number
  nonBillableMinutes: number
  categories: CategorySummary[]
}

interface DailyBreakdown {
  date: string
  totalMinutes: number
  billableMinutes: number
  nonBillableMinutes: number
}

interface WeeklySummary {
  startDate: string
  endDate: string
  totalMinutes: number
  billableMinutes: number
  nonBillableMinutes: number
  dailyBreakdown: DailyBreakdown[]
  categoryBreakdown: CategorySummary[]
  jobBreakdown: JobSummary[]
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
  syncWithGoogleCalendar: (startDate?: Date, endDate?: Date) => Promise<void>
  syncWithAppsScript: () => Promise<void>
  exportTimesheet: () => void
  exportWeeklyTimesheet: () => void
  activeCategoryFilter: string | null
  setActiveCategoryFilter: (category: string | null) => void
  isCategoryBillable: (category: string) => boolean
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

    // Add some sample data for demo purposes
    const sampleEntries: TimeEntry[] = [
      {
        id: generateId(),
        title: "Team Meeting - Project Planning",
        start: format(new Date(), "yyyy-MM-dd") + "T09:00:00",
        end: format(new Date(), "yyyy-MM-dd") + "T10:00:00",
        jobNumber: "70123",
        jobPhase: "Phase 1",
        clientName: "Acme Corp",
        taskType: "meeting",
        billableType: "Billable",
        duration: 60,
        source: "manual",
      },
      {
        id: generateId(),
        title: "Development Work",
        start: format(new Date(), "yyyy-MM-dd") + "T10:30:00",
        end: format(new Date(), "yyyy-MM-dd") + "T12:30:00",
        jobNumber: "70124",
        clientName: "Tech Solutions",
        taskType: "development",
        billableType: "Billable",
        duration: 120,
        source: "manual",
      },
    ]

    if (!savedEntries) {
      setTimeEntries(sampleEntries)
    }
  }, [])

  // Save time entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("timeEntries", JSON.stringify(timeEntries))
  }, [timeEntries])

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

  // Calculate daily summary
  const calculateDailySummary = (): DailySummary => {
    const selectedDateStr = format(selectedDate, "yyyy-MM-dd")
    const entriesForDay = timeEntries.filter((entry) => entry.start.startsWith(selectedDateStr))

    const totalMinutes = entriesForDay.reduce((total, entry) => total + entry.duration, 0)

    let billableMinutes = 0
    let nonBillableMinutes = 0

    const categoryMap = new Map<string, { minutes: number; billable: boolean }>()

    entriesForDay.forEach((entry) => {
      const isBillable = entry.billableType === "Billable" || isCategoryBillable(entry.taskType)

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

    let billableMinutes = 0
    let nonBillableMinutes = 0

    entriesForWeek.forEach((entry) => {
      const isBillable = entry.billableType === "Billable" || isCategoryBillable(entry.taskType)
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

      const isBillable = entry.billableType === "Billable" || isCategoryBillable(entry.taskType)

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
      const isBillable = entry.billableType === "Billable" || isCategoryBillable(entry.taskType)
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

  // Export timesheet for the selected day
  const exportTimesheet = () => {
    const selectedDateStr = format(selectedDate, "yyyy-MM-dd")
    const entriesForDay = timeEntries.filter((entry) => entry.start.startsWith(selectedDateStr))

    if (entriesForDay.length === 0) {
      toast({
        title: "No entries to export",
        description: "There are no time entries for the selected day.",
      })
      return
    }

    // Create CSV content with enhanced fields
    let csvContent =
      "Title,Job Number,Client Name,Project Name,Job Phase,Phase Number,Task Type,Billable Type,Start Time,End Time,Duration (minutes),Source\n"

    entriesForDay.forEach((entry) => {
      const startTime = format(parseISO(entry.start), "HH:mm")
      const endTime = format(parseISO(entry.end), "HH:mm")
      const billable = entry.billableType || (isCategoryBillable(entry.taskType) ? "Billable" : "Non-billable")
      const jobPhase = entry.jobPhase || ""
      const clientName = entry.clientName || ""
      const projectName = entry.projectName || ""
      const phaseNumber = entry.phaseNumber || ""
      const source = entry.source || "manual"

      csvContent += `"${entry.title}","${entry.jobNumber}","${clientName}","${projectName}","${jobPhase}","${phaseNumber}","${entry.taskType}","${billable}","${startTime}","${endTime}",${entry.duration},"${source}"\n`
    })

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `timesheet-${selectedDateStr}.csv`)
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

    const entriesForWeek = timeEntries.filter((entry) => {
      const entryDate = parseISO(entry.start)
      return entryDate >= weekStart && entryDate <= weekEnd
    })

    if (entriesForWeek.length === 0) {
      toast({
        title: "No entries to export",
        description: "There are no time entries for the selected week.",
      })
      return
    }

    // Create CSV content with enhanced fields
    let csvContent =
      "Date,Title,Job Number,Client Name,Project Name,Job Phase,Phase Number,Task Type,Billable Type,Start Time,End Time,Duration (minutes),Source\n"

    entriesForWeek.forEach((entry) => {
      const date = format(parseISO(entry.start), "yyyy-MM-dd")
      const startTime = format(parseISO(entry.start), "HH:mm")
      const endTime = format(parseISO(entry.end), "HH:mm")
      const billable = entry.billableType || (isCategoryBillable(entry.taskType) ? "Billable" : "Non-billable")
      const jobPhase = entry.jobPhase || ""
      const clientName = entry.clientName || ""
      const projectName = entry.projectName || ""
      const phaseNumber = entry.phaseNumber || ""
      const source = entry.source || "manual"

      csvContent += `"${date}","${entry.title}","${entry.jobNumber}","${clientName}","${projectName}","${jobPhase}","${phaseNumber}","${entry.taskType}","${billable}","${startTime}","${endTime}",${entry.duration},"${source}"\n`
    })

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `weekly-timesheet-${startDateStr}-to-${endDateStr}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export Complete",
      description: `Weekly timesheet from ${format(weekStart, "MMM d")} to ${format(weekEnd, "MMM d, yyyy")} has been exported.`,
    })
  }

  // Mock sign in function
  const signIn = () => {
    setIsAuthenticated(true)
    setUser({ name: "Demo User", email: "demo@example.com" })
    toast({
      title: "Signed In",
      description: "You are now signed in with demo credentials.",
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

  // Sync with Google Calendar (mock function for now)
  const syncWithGoogleCalendar = async (startDate = selectedDate, endDate = selectedDate) => {
    try {
      toast({
        title: "Syncing Calendar",
        description: "Connecting to Google Calendar...",
      })

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock calendar events
      const mockEvents = [
        {
          id: "sync_event_1",
          summary: "Client Review Meeting",
          description: "Job Number: 70125\nClient: Design Studio\nPhase: Review",
          start: { dateTime: format(selectedDate, "yyyy-MM-dd") + "T14:00:00" },
          end: { dateTime: format(selectedDate, "yyyy-MM-dd") + "T15:00:00" },
        },
        {
          id: "sync_event_2",
          summary: "Development Sprint",
          description: "Job Number: 70126\nClient: StartupCo\nPhase: Development",
          start: { dateTime: format(selectedDate, "yyyy-MM-dd") + "T15:30:00" },
          end: { dateTime: format(selectedDate, "yyyy-MM-dd") + "T17:30:00" },
        },
      ]

      let addedCount = 0

      for (const event of mockEvents) {
        const existingEntry = timeEntries.find((entry) => entry.calendarEventId === event.id)

        if (!existingEntry) {
          const startDate = new Date(event.start.dateTime)
          const endDate = new Date(event.end.dateTime)
          const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000)

          // Extract job number
          let jobNumber = "UNKNOWN"
          const jobNumberRegex = /job number:\s*(\d{5})/i
          const jobNumberMatch = event.description.match(jobNumberRegex)
          if (jobNumberMatch) {
            jobNumber = jobNumberMatch[1]
          }

          // Extract client name
          let clientName = undefined
          const clientRegex = /client:\s*([^\n]+)/i
          const clientMatch = event.description.match(clientRegex)
          if (clientMatch) {
            clientName = clientMatch[1].trim()
          }

          // Extract job phase
          let jobPhase = undefined
          const phaseRegex = /phase:\s*([^\n]+)/i
          const phaseMatch = event.description.match(phaseRegex)
          if (phaseMatch) {
            jobPhase = `Phase ${phaseMatch[1].trim()}`
          }

          addTimeEntry({
            title: event.summary,
            start: event.start.dateTime,
            end: event.end.dateTime,
            jobNumber,
            jobPhase,
            clientName,
            taskType: "meeting",
            duration: durationMinutes,
            calendarEventId: event.id,
            source: "google-calendar",
            autoDetected: true,
            syncedAt: new Date().toISOString(),
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
        description: "Failed to sync with Google Calendar. This is a demo version.",
        variant: "destructive",
      })
    }
  }

  // New function to sync with Apps Script add-on
  const syncWithAppsScript = async () => {
    try {
      toast({
        title: "Syncing with Apps Script",
        description: "Fetching enhanced calendar data...",
      })

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Apps Script Sync Complete",
        description: "This feature will be available when connected to your Google Apps Script add-on.",
      })
    } catch (error) {
      console.error("Error syncing with Apps Script:", error)
      toast({
        title: "Apps Script Sync Failed",
        description: "This is a demo version. Connect your Apps Script add-on for full functionality.",
        variant: "destructive",
      })
    }
  }

  // Calculate summaries
  const dailySummary = calculateDailySummary()
  const weeklySummary = calculateWeeklySummary()

  // Context value
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
