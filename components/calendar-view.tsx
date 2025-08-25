"use client"

import { useState, useEffect } from "react"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { addTimeEntry } from "./calendar-utils"

const localizer = momentLocalizer(moment)

const CalendarView = ({ events, onEventSelect }) => {
  const [calendarEvents, setCalendarEvents] = useState(events)

  useEffect(() => {
    setCalendarEvents(events)
  }, [events])

  const handleSelectSlot = ({ start, end }) => {
    const title = window.prompt("New event name")
    if (title) {
      const newEvent = {
        title,
        start,
        end,
      }
      setCalendarEvents([...calendarEvents, newEvent])
      onEventSelect(newEvent)
    }
  }

  const handleEventSelect = (event) => {
    const { title, start, end, id } = event
    const durationMinutes = moment(end).diff(start, "minutes")

    // Extract job number from event description or title - look for 5-digit numbers only
    let jobNumber = "UNKNOWN"

    // Look for 5-digit numbers in title first, then description
    const fiveDigitRegex = /\b\d{5}\b/
    const jobNumberMatch = title.match(fiveDigitRegex) || event.description.match(fiveDigitRegex)

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
    const clientMatch = event.description.match(clientRegex)

    if (clientMatch && clientMatch[1]) {
      clientName = clientMatch[1].trim()
    } else {
      // Look for company names or other patterns in the description
      const lines = event.description.split("\n")
      for (const line of lines) {
        const trimmedLine = line.trim()
        if (
          trimmedLine &&
          !trimmedLine.toLowerCase().includes("meeting") &&
          !trimmedLine.toLowerCase().includes("call") &&
          !trimmedLine.toLowerCase().includes("zoom") &&
          !trimmedLine.toLowerCase().includes("teams") &&
          trimmedLine.length > 2 &&
          trimmedLine.length < 50
        ) {
          clientName = trimmedLine
          break
        }
      }
    }

    const jobPhase = "UNKNOWN" // Placeholder for job phase extraction logic
    const taskType = "UNKNOWN" // Placeholder for task type extraction logic

    addTimeEntry({
      title,
      start,
      end,
      jobNumber,
      jobPhase,
      clientName,
      taskType,
      duration: durationMinutes,
      calendarEventId: id,
    })

    onEventSelect(event)
  }

  return (
    <div>
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        selectable={true}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleEventSelect}
      />
    </div>
  )
}

export default CalendarView
