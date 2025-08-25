"use client"

import type React from "react"
import { format, parseISO } from "date-fns"
import { isCategoryBillable } from "./utils"

interface WeeklySummaryProps {
  entriesForWeek: any[]
}

const WeeklySummary: React.FC<WeeklySummaryProps> = ({ entriesForWeek }) => {
  const exportWeeklyTimesheet = () => {
    let csvContent =
      "Date,Title,Job Number,Client Name,Job Phase,Task Type,Billable,Start Time,End Time,Duration (minutes)\n"

    entriesForWeek.forEach((entry) => {
      const date = format(parseISO(entry.start), "yyyy-MM-dd")
      const startTime = format(parseISO(entry.start), "HH:mm")
      const endTime = format(parseISO(entry.end), "HH:mm")
      const billable = isCategoryBillable(entry.taskType) ? "Yes" : "No"
      const jobPhase = entry.jobPhase || ""
      const clientName = entry.clientName || ""

      csvContent += `"${date}","${entry.title}","${entry.jobNumber}","${clientName}","${jobPhase}","${entry.taskType}","${billable}","${startTime}","${endTime}",${entry.duration}\n`
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "weekly_timesheet.csv")
    document.body.appendChild(link)
    link.click()
  }

  return (
    <div>
      <h1>Weekly Summary</h1>
      <button onClick={exportWeeklyTimesheet}>Export Timesheet</button>
      {/* rest of code here */}
    </div>
  )
}

export default WeeklySummary
