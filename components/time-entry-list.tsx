"use client"

import type React from "react"
import { useState } from "react"
import { format, parseISO } from "date-fns"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Edit, Trash2, Plus, Download, Clock, DollarSign } from "lucide-react"
import type { TimeEntry } from "@/types/time-entry"
import { useTimeTracking } from "@/components/time-tracking-provider"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

interface TimeEntryListProps {
  entries: TimeEntry[]
  day: string
}

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

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF7C7C",
  "#8DD1E1",
  "#D084D0",
]

const TimeEntryList: React.FC<TimeEntryListProps> = ({ entries, day }) => {
  const { addTimeEntry, updateTimeEntry, deleteTimeEntry, dailySummary, exportTimesheet, isCategoryBillable } =
    useTimeTracking()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null)

  const handleAddEntry = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const title = formData.get("title") as string
    const jobNumber = formData.get("jobNumber") as string
    const jobPhase = formData.get("jobPhase") as string
    const clientName = formData.get("clientName") as string
    const taskType = formData.get("taskType") as string
    const billableType = formData.get("billableType") as string
    const start = formData.get("start") as string
    const end = formData.get("end") as string
    const durationMinutes = Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 60000)

    addTimeEntry({
      title,
      jobNumber,
      jobPhase: jobPhase || undefined,
      clientName: clientName || undefined,
      taskType,
      billableType,
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
    const jobPhase = formData.get("jobPhase") as string
    const clientName = formData.get("clientName") as string
    const taskType = formData.get("taskType") as string
    const billableType = formData.get("billableType") as string
    const start = formData.get("start") as string
    const end = formData.get("end") as string
    const durationMinutes = Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 60000)

    updateTimeEntry(currentEntry.id, {
      title,
      jobNumber,
      jobPhase: jobPhase || undefined,
      clientName: clientName || undefined,
      taskType,
      billableType,
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

  const handleDelete = (id: string) => {
    deleteTimeEntry(id)
  }

  // Prepare chart data
  const chartData = dailySummary.categories.map((cat, index) => ({
    name: cat.category,
    value: cat.totalMinutes,
    color: COLORS[index % COLORS.length],
    billable: cat.billable,
  }))

  const billableData = [
    { name: "Billable", value: dailySummary.billableMinutes, color: "#00C49F" },
    { name: "Non-billable", value: dailySummary.nonBillableMinutes, color: "#FF8042" },
  ]

  const totalHours = Math.round((dailySummary.totalMinutes / 60) * 100) / 100
  const billableHours = Math.round((dailySummary.billableMinutes / 60) * 100) / 100
  const billablePercentage =
    dailySummary.totalMinutes > 0 ? (dailySummary.billableMinutes / dailySummary.totalMinutes) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Daily Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours}h</div>
            <p className="text-xs text-muted-foreground">{dailySummary.totalMinutes} minutes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{billableHours}h</div>
            <div className="mt-2">
              <Progress value={billablePercentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">{Math.round(billablePercentage)}% of total time</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailySummary.categories.length}</div>
            <p className="text-xs text-muted-foreground">Different task types</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {dailySummary.totalMinutes > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Time by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${Math.round((value / 60) * 100) / 100}h`, "Hours"]} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billable vs Non-billable</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={billableData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`${Math.round((value / 60) * 100) / 100}h`, "Hours"]} />
                  <Bar dataKey="value" fill="#8884d8">
                    {billableData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add Time Entry</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddEntry} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-jobNumber">Job Number</Label>
                  <Input id="add-jobNumber" name="jobNumber" placeholder="e.g., 70123" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-clientName">Client Name</Label>
                  <Input id="add-clientName" name="clientName" placeholder="Optional" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-jobPhase">Job Phase</Label>
                <Input id="add-jobPhase" name="jobPhase" placeholder="e.g., Phase 1" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-title">Title</Label>
                <Input id="add-title" name="title" placeholder="e.g., Team Meeting" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-taskType">Task Type</Label>
                  <Select name="taskType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select task type" />
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

                <div className="space-y-2">
                  <Label htmlFor="add-billableType">Billing Type</Label>
                  <Select name="billableType">
                    <SelectTrigger>
                      <SelectValue placeholder="Auto-detect" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Billable">Billable</SelectItem>
                      <SelectItem value="Non-billable">Non-billable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-start">Start Time</Label>
                  <Input id="add-start" name="start" type="datetime-local" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-end">End Time</Label>
                  <Input id="add-end" name="end" type="datetime-local" required />
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
          Export CSV
        </Button>
      </div>

      {/* Time Entries List */}
      <div className="space-y-4">
        {entries.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No time entries for this day</p>
              <p className="text-sm text-muted-foreground">Add an entry or sync with your calendar to get started</p>
            </CardContent>
          </Card>
        ) : (
          entries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{entry.title}</h3>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        Job Number: {entry.jobNumber}
                      </span>

                      {entry.clientName && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {entry.clientName}
                        </span>
                      )}

                      {entry.jobPhase && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {entry.jobPhase}
                        </span>
                      )}

                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isCategoryBillable(entry.taskType) ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {entry.taskType}
                      </span>

                      {entry.billableType && (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            entry.billableType === "Billable"
                              ? "bg-green-100 text-green-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {entry.billableType}
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        <Clock className="inline h-4 w-4 mr-1" />
                        {format(parseISO(entry.start), "HH:mm")} - {format(parseISO(entry.end), "HH:mm")}
                      </p>
                      <p>
                        Duration: {Math.floor(entry.duration / 60)}h {entry.duration % 60}m
                      </p>
                      {entry.source && (
                        <p>Source: {entry.source === "google-calendar" ? "Google Calendar" : "Manual"}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(entry)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(entry.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Time Entry</DialogTitle>
          </DialogHeader>
          {currentEntry && (
            <form onSubmit={handleEditEntry} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-jobNumber">Job Number</Label>
                  <Input id="edit-jobNumber" name="jobNumber" defaultValue={currentEntry.jobNumber} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-clientName">Client Name</Label>
                  <Input id="edit-clientName" name="clientName" defaultValue={currentEntry.clientName || ""} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-jobPhase">Job Phase</Label>
                <Input id="edit-jobPhase" name="jobPhase" defaultValue={currentEntry.jobPhase || ""} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input id="edit-title" name="title" defaultValue={currentEntry.title} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-taskType">Task Type</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="edit-billableType">Billing Type</Label>
                  <Select name="billableType" defaultValue={currentEntry.billableType || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Auto-detect" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Billable">Billable</SelectItem>
                      <SelectItem value="Non-billable">Non-billable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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

export default TimeEntryList
