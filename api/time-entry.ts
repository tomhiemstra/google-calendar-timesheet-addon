// API functions for time entry management

// Simple ID generator to replace uuid
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export interface TimeEntry {
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

// Add a new time entry
export function addTimeEntry(entry: Omit<TimeEntry, "id">): TimeEntry {
  const newEntry: TimeEntry = {
    ...entry,
    id: generateId(),
  }

  // In a real app, this would save to a database
  // For now, we'll just return the entry with an ID
  return newEntry
}

// Update an existing time entry
export function updateTimeEntry(id: string, updates: Partial<TimeEntry>): TimeEntry | null {
  // In a real app, this would update the database
  // For now, we'll just return a mock updated entry
  return {
    id,
    title: "Updated Entry",
    start: new Date().toISOString(),
    end: new Date().toISOString(),
    jobNumber: "UNKNOWN",
    taskType: "meeting",
    duration: 60,
    ...updates,
  }
}

// Delete a time entry
export function deleteTimeEntry(id: string): boolean {
  // In a real app, this would delete from the database
  // For now, we'll just return true
  return true
}

// Get time entries for a date range
export function getTimeEntries(startDate: string, endDate: string): TimeEntry[] {
  // In a real app, this would query the database
  // For now, we'll return an empty array
  return []
}
