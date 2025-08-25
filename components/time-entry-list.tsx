"use client"

import type React from "react"
import { useState } from "react"
import { format, parseISO } from "date-fns"
import { Label, Input, Button } from "@radix-ui/themes"
import type { TimeEntry } from "@/types/time-entry"
import { addTimeEntry, updateTimeEntry } from "@/api/time-entry"
import { isCategoryBillable } from "@/utils/task-type"

interface TimeEntryListProps {
  entries: TimeEntry[]
  day: string
}

const TimeEntryList: React.FC<TimeEntryListProps> = ({ entries, day }) => {
  const [isAddingEntry, setIsAddingEntry] = useState(false)
  const [isEditingEntry, setIsEditingEntry] = useState(false)
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null)

  const handleAddEntry = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const title = formData.get("title") as string
    const jobNumber = formData.get("jobNumber") as string
    const jobPhase = formData.get("jobPhase") as string
    const clientName = formData.get("clientName") as string
    const taskType = formData.get("taskType") as string
    const start = formData.get("start") as string
    const end = formData.get("end") as string
    const durationMinutes = Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 60000)

    addTimeEntry({
      title,
      jobNumber,
      jobPhase: jobPhase || undefined,
      clientName: clientName || undefined,
      taskType,
      start,
      end,
      duration: durationMinutes,
    })

    setIsAddingEntry(false)
  }

  const handleEditEntry = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!currentEntry) return

    const formData = new FormData(event.currentTarget)
    const title = formData.get("title") as string
    const jobNumber = formData.get("jobNumber") as string
    const jobPhase = formData.get("jobPhase") as string
    const clientName = formData.get("clientName") as string
    const taskType = formData.get("taskType") as string
    const start = formData.get("start") as string
    const end = formData.get("end") as string
    const durationMinutes = Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 60000)

    updateTimeEntry(currentEntry.id, {
      title,
      jobNumber,
      jobPhase: jobPhase || undefined,
      clientName: clientName || undefined,
      taskType,
      start,
      end,
      duration: durationMinutes,
    })

    setIsEditingEntry(false)
  }

  const handleDeleteEntry = (id: string) => {
    // Delete entry logic here
  }

  const handleEdit = (entry: TimeEntry) => {
    setCurrentEntry(entry)
    setIsEditingEntry(true)
  }

  const handleCancelEdit = () => {
    setIsEditingEntry(false)
  }

  const exportTimesheet = () => {
    let csvContent =
      "Title,Job Number,Client Name,Job Phase,Task Type,Billable,Start Time,End Time,Duration (minutes)\n"

    entries.forEach((entry) => {
      const startTime = format(parseISO(entry.start), "HH:mm")
      const endTime = format(parseISO(entry.end), "HH:mm")
      const billable = isCategoryBillable(entry.taskType) ? "Yes" : "No"
      const jobPhase = entry.jobPhase || ""
      const clientName = entry.clientName || ""

      csvContent += `"${entry.title}","${entry.jobNumber}","${clientName}","${jobPhase}","${entry.taskType}","${billable}","${startTime}","${endTime}",${entry.duration}\n`
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `timesheet-${day}.csv`)
    document.body.appendChild(link)
    link.click()
  }

  return (
    <div className="p-4">
      {isAddingEntry ? (
        <form onSubmit={handleAddEntry} className="mb-4">
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="jobNumber">Job Number</Label>
              <Input id="jobNumber" name="jobNumber" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input id="clientName" name="clientName" placeholder="Optional" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="jobPhase">Job Phase</Label>
            <Input id="jobPhase" name="jobPhase" placeholder="Optional" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="taskType">Task Type</Label>
            <Input id="taskType" name="taskType" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="start">Start Time</Label>
            <Input id="start" name="start" type="datetime-local" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="end">End Time</Label>
            <Input id="end" name="end" type="datetime-local" required />
          </div>
          <Button type="submit">Add Entry</Button>
          <Button type="button" onClick={() => setIsAddingEntry(false)}>
            Cancel
          </Button>
        </form>
      ) : (
        <Button onClick={() => setIsAddingEntry(true)}>Add Entry</Button>
      )}

      {isEditingEntry && currentEntry ? (
        <form onSubmit={handleEditEntry} className="mb-4">
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-jobNumber">Job Number</Label>
              <Input id="edit-jobNumber" name="jobNumber" defaultValue={currentEntry.jobNumber} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-clientName">Client Name</Label>
              <Input
                id="edit-clientName"
                name="clientName"
                defaultValue={currentEntry.clientName || ""}
                placeholder="Optional"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-jobPhase">Job Phase</Label>
            <Input
              id="edit-jobPhase"
              name="jobPhase"
              defaultValue={currentEntry.jobPhase || ""}
              placeholder="Optional"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input id="edit-title" name="title" defaultValue={currentEntry.title} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-taskType">Task Type</Label>
            <Input id="edit-taskType" name="taskType" defaultValue={currentEntry.taskType} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-start">Start Time</Label>
            <Input id="edit-start" name="start" type="datetime-local" defaultValue={currentEntry.start} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-end">End Time</Label>
            <Input id="edit-end" name="end" type="datetime-local" defaultValue={currentEntry.end} required />
          </div>
          <Button type="submit">Save Changes</Button>
          <Button type="button" onClick={handleCancelEdit}>
            Cancel
          </Button>
        </form>
      ) : null}

      <div className="mt-4">
        {entries.map((entry) => (
          <div key={entry.id} className="bg-white p-4 rounded mb-4">
            <h3 className="text-lg font-bold">{entry.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                Job Number: {entry.jobNumber}
              </span>
              {entry.clientName && (
                <span className="text-xs bg-blue/20 text-blue-foreground px-2 py-0.5 rounded-full font-medium border border-blue/20">
                  {entry.clientName}
                </span>
              )}
              {entry.jobPhase && (
                <span className="text-xs bg-secondary/30 text-secondary-foreground px-2 py-0.5 rounded-full font-medium border border-secondary/20">
                  {entry.jobPhase}
                </span>
              )}
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${isCategoryBillable(entry.taskType) ? "border-green-500 text-green-500" : "border-red-500 text-red-500"}`}
              >
                {entry.taskType}
              </span>
              {!isCategoryBillable(entry.taskType) && (
                <span className="text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">Non-billable</span>
              )}
            </div>
            <div className="mt-4 flex justify-between">
              <div>
                <p className="text-sm">Start Time: {format(parseISO(entry.start), "HH:mm")}</p>
                <p className="text-sm">End Time: {format(parseISO(entry.end), "HH:mm")}</p>
                <p className="text-sm">Duration: {entry.duration} minutes</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleEdit(entry)}>Edit</Button>
                <Button onClick={() => handleDeleteEntry(entry.id)}>Delete</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button onClick={exportTimesheet}>Export Timesheet</Button>
    </div>
  )
}

export default TimeEntryList
