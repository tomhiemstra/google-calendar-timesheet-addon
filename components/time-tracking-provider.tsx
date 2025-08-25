"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { TimeEntry } from "./types" // Assuming TimeEntry type is defined in a separate file

interface TimeTrackingContext {
  timeEntries: TimeEntry[]
  addTimeEntry: (entry: Omit<TimeEntry, "id">) => void
  removeTimeEntry: (id: string) => void
  syncWithGoogleCalendar: () => void
}

const TimeTrackingContext = createContext<TimeTrackingContext>({
  timeEntries: [],
  addTimeEntry: () => {},
  removeTimeEntry: () => {},
  syncWithGoogleCalendar: () => {},
})

export const useTimeTracking = () => useContext(TimeTrackingContext)

export const TimeTrackingProvider: React.FC = ({ children }) => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])

  const addTimeEntry = (entry: Omit<TimeEntry, "id">) => {
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      ...entry,
    }
    setTimeEntries([...timeEntries, newEntry])
  }

  const removeTimeEntry = (id: string) => {
    setTimeEntries(timeEntries.filter((entry) => entry.id !== id))
  }

  const syncWithGoogleCalendar = () => {
    // Placeholder for Google Calendar sync logic
    // This function should fetch events from Google Calendar and update timeEntries accordingly
    const events = [
      {
        id: "1",
        title: "Project X Meeting",
        start: "2023-10-01T09:00:00",
        end: "2023-10-01T10:00:00",
        description: "Client: ABC Corp\nJob Number: 12345\nPhase: Design",
      },
      // More events here
    ]

    events.forEach((event) => {
      const eventTitle = event.title
      const eventDescription = event.description
      const start = event.start
      const end = event.end

      // Extract job number from event description or title - look for 5-digit numbers only
      let jobNumber = "UNKNOWN"

      // Look for 5-digit numbers in title first, then description
      const fiveDigitRegex = /\b\d{5}\b/
      const jobNumberMatch = eventTitle.match(fiveDigitRegex) || eventDescription.match(fiveDigitRegex)

      if (jobNumberMatch) {
        jobNumber = jobNumberMatch[0]
      } else {
        // If no 5-digit number found, use UNKNOWN
        jobNumber = "UNKNOWN"
      }

      // Extract client name from event description
      let clientName = undefined

      // Look for patterns like "Client: Name" or "Client Name:" in the description
      const clientRegex = /(?:client|customer)(?:\s*:?\s*)([a-zA-Z0-9\s&.-]+?)(?:\n|$|[,.;])/i
      const clientMatch = eventDescription.match(clientRegex)

      if (clientMatch && clientMatch[1]) {
        clientName = clientMatch[1].trim()
      } else {
        // Look for company names or other patterns in the description
        // Try to find lines that might contain client information
        const lines = eventDescription.split("\n")
        for (const line of lines) {
          const trimmedLine = line.trim()
          // Skip empty lines and common calendar phrases
          if (
            trimmedLine &&
            !trimmedLine.toLowerCase().includes("meeting") &&
            !trimmedLine.toLowerCase().includes("call") &&
            !trimmedLine.toLowerCase().includes("zoom") &&
            !trimmedLine.toLowerCase().includes("teams") &&
            trimmedLine.length > 2 &&
            trimmedLine.length < 50
          ) {
            // This might be a client name
            clientName = trimmedLine
            break
          }
        }
      }

      const jobPhase = eventDescription
        .split("\n")
        .find((line) => line.toLowerCase().includes("phase"))
        ?.split(": ")[1]
      const taskType = eventDescription
        .split("\n")
        .find((line) => line.toLowerCase().includes("task"))
        ?.split(": ")[1]
      const durationMinutes = new Date(end).getTime() - new Date(start).getTime()
      const duration = Math.floor(durationMinutes / (1000 * 60))

      addTimeEntry({
        title: eventTitle,
        start,
        end,
        jobNumber,
        jobPhase,
        clientName,
        taskType,
        duration: duration,
        calendarEventId: event.id,
      })
    })
  }

  useEffect(() => {
    // Placeholder for any side effects or initializations
    // For example, fetching time entries from a database or API
  }, [])

  return (
    <TimeTrackingContext.Provider value={{ timeEntries, addTimeEntry, removeTimeEntry, syncWithGoogleCalendar }}>
      {children}
    </TimeTrackingContext.Provider>
  )
}
