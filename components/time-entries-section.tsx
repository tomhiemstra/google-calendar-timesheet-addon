"use client"

import type React from "react"

import { useTimeTracking } from "@/components/time-tracking-provider"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Download, Edit, Trash2 } from "lucide-react"
import { format, parseISO } from "date-fns"
import { useState } from "react"
import type { TimeEntry } from "@/types/time-entry"

const TASK_TYPES = [
  "meeting",
  "development",
  "design",
  "research",
  "planning",
  "testing",
  "documentation",
  "review",
  "admin",
  "training",
  "uncategorized",
]

const CATEGORY_COLORS: Record<string, string> = {
  meeting: "bg-yellow-100 text-yellow-800",
  development: "bg-blue-100 text-blue-800",
  design: "bg-purple-100 text-purple-800",
  research: "bg-green-100 text-green-800",
  planning: "bg-teal-100 text-teal-800",
  testing: "bg-red-100 text-red-800",
  documentation: "bg-gray-100 text-gray-800",
  review: "bg-cyan-100 text-cyan-800",
  admin: "bg-orange-100 text-orange-800",
  training: "bg-indigo-100 text-indigo-800",
  uncategorized: "bg-gray-100 text-gray-800",
}

export function TimeEntriesSection() {
  const {
    timeEntries,
    selectedDate,
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    exportTimesheet,
    activeCategoryFilter,
  } = useTimeTracking()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null)

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd")
  let entriesForDay = timeEntries.filter((entry) => entry.start.startsWith(selectedDateStr))

  // Filter by active category if one is selected
  if (activeCategoryFilter) {
    entriesForDay = entriesForDay.filter((entry) => entry.taskType === activeCategoryFilter)
  }

  const handleAddEntry = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const title = formData.get("title") as string
    const jobNumber = formData.get("jobNumber") as string
    const taskType = formData.get("taskType") as string
    const start = formData.get("start") as string
    const end = formData.get("end") as string
    const durationMinutes = Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 60000)

    addTimeEntry({
      title,
      jobNumber,
      taskType,
      start,
      end,
      duration: durationMinutes,
    })

    setIsAddDialogOpen(false)
  }

  const handleEditEntry = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!currentEntry) return

    const formData = new FormData(event.currentTarget)
    const title = formData.get("title") as string
    const jobNumber = formData.get("jobNumber") as string
    const taskType = formData.get("taskType") as string
    const start = formData.get("start") as string
    const end = formData.get("end") as string
    const durationMinutes = Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 60000)

    updateTimeEntry(currentEntry.id, {
      title,
      jobNumber,
      taskType,
      start,
      end,
      duration: durationMinutes,
    })

    setIsEditDialogOpen(false)
    setCurrentEntry(null)
  }

  const handleEdit = (entry: TimeEntry) => {
    setCurrentEntry(entry)
    setIsEditDialogOpen(true)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Time Entries</h2>
          <p className="text-sm text-gray-600">
            Manage your time entries for {format(selectedDate, "MMMM d, yyyy")}
            {activeCategoryFilter && (
              <span className="ml-2 text-blue-600">
                (Filtered by: {activeCategoryFilter.charAt(0).toUpperCase() + activeCategoryFilter.slice(1)})
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-black text-white hover:bg-gray-800">
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Time Entry</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddEntry} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" placeholder="e.g., Team Meeting" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobNumber">Job Number</Label>
                  <Input id="jobNumber" name="jobNumber" placeholder="e.g., CAL-TH-2611" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taskType">Category</Label>
                  <Select name="taskType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start">Start Time</Label>
                    <Input id="start" name="start" type="datetime-local" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end">End Time</Label>
                    <Input id="end" name="end" type="datetime-local" required />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Entry</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={exportTimesheet}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {entriesForDay.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>
              {activeCategoryFilter
                ? `No ${activeCategoryFilter} entries for this day`
                : "No time entries for this day"}
            </p>
            <p className="text-sm">Add an entry or sync with your calendar</p>
          </div>
        ) : (
          entriesForDay.map((entry) => (
            <div key={entry.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">{entry.title}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <span>
                      {format(parseISO(entry.start), "h:mm a")} - {format(parseISO(entry.end), "h:mm a")} (
                      {formatDuration(entry.duration)})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{entry.jobNumber}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${CATEGORY_COLORS[entry.taskType] || CATEGORY_COLORS.uncategorized}`}
                    >
                      {entry.taskType.charAt(0).toUpperCase() + entry.taskType.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(entry)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteTimeEntry(entry.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Time Entry</DialogTitle>
          </DialogHeader>
          {currentEntry && (
            <form onSubmit={handleEditEntry} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input id="edit-title" name="title" defaultValue={currentEntry.title} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-jobNumber">Job Number</Label>
                <Input id="edit-jobNumber" name="jobNumber" defaultValue={currentEntry.jobNumber} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-taskType">Category</Label>
                <Select name="taskType" defaultValue={currentEntry.taskType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-start">Start Time</Label>
                  <Input
                    id="edit-start"
                    name="start"
                    type="datetime-local"
                    defaultValue={currentEntry.start.slice(0, 16)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-end">End Time</Label>
                  <Input
                    id="edit-end"
                    name="end"
                    type="datetime-local"
                    defaultValue={currentEntry.end.slice(0, 16)}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
