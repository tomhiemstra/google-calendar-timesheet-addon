// Type definitions for time entries
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

export interface CategorySummary {
  category: string
  totalMinutes: number
  billable: boolean
}

export interface JobSummary {
  jobNumber: string
  totalMinutes: number
}

export interface DailySummary {
  date: string
  totalMinutes: number
  billableMinutes: number
  nonBillableMinutes: number
  categories: CategorySummary[]
}

export interface DailyBreakdown {
  date: string
  totalMinutes: number
  billableMinutes: number
  nonBillableMinutes: number
}

export interface WeeklySummary {
  startDate: string
  endDate: string
  totalMinutes: number
  billableMinutes: number
  nonBillableMinutes: number
  dailyBreakdown: DailyBreakdown[]
  categoryBreakdown: CategorySummary[]
  jobBreakdown: JobSummary[]
}
