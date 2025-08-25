// Utility functions for components
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility function to merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Define non-billable categories
const NON_BILLABLE_CATEGORIES = [
  "overhead",
  "personal",
  "admin",
  "administrative",
  "break",
  "lunch",
  "vacation",
  "sick",
  "holiday",
  "training",
  "internal meeting",
  "company meeting",
  "all hands",
  "standup",
  "retrospective",
  "planning poker",
  "team building",
]

// Check if a task category is billable
export function isCategoryBillable(category: string): boolean {
  if (!category) return true // Default to billable if no category

  const lowerCategory = category.toLowerCase().trim()
  return !NON_BILLABLE_CATEGORIES.includes(lowerCategory)
}

// Format duration in minutes to hours and minutes
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours}h`
  }

  return `${hours}h ${remainingMinutes}m`
}

// Format time range
export function formatTimeRange(start: string, end: string): string {
  const startTime = new Date(start).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })

  const endTime = new Date(end).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })

  return `${startTime} - ${endTime}`
}

// Calculate total billable and non-billable time
export function calculateTimeBreakdown(entries: Array<{ duration: number; taskType: string; billableType?: string }>) {
  let billableMinutes = 0
  let nonBillableMinutes = 0

  entries.forEach((entry) => {
    const isBillable = entry.billableType === "Billable" || isCategoryBillable(entry.taskType)

    if (isBillable) {
      billableMinutes += entry.duration
    } else {
      nonBillableMinutes += entry.duration
    }
  })

  return {
    billableMinutes,
    nonBillableMinutes,
    totalMinutes: billableMinutes + nonBillableMinutes,
    billableHours: Math.round((billableMinutes / 60) * 100) / 100,
    nonBillableHours: Math.round((nonBillableMinutes / 60) * 100) / 100,
    totalHours: Math.round(((billableMinutes + nonBillableMinutes) / 60) * 100) / 100,
  }
}

// Extract job number from text
export function extractJobNumber(text: string): string {
  // Look for 5-digit numbers starting with 7
  const jobNumberRegex = /\b7\d{4}\b/g
  const match = text.match(jobNumberRegex)

  if (match) {
    return match[0]
  }

  // Fallback to any 5-digit number
  const fallbackRegex = /\b\d{5}\b/g
  const fallbackMatch = text.match(fallbackRegex)

  return fallbackMatch ? fallbackMatch[0] : "UNKNOWN"
}

// Extract client name from text
export function extractClientName(text: string): string | undefined {
  const clientRegex = /(?:client|customer)(?:\s*:?\s*)([a-zA-Z0-9\s&.-]+?)(?:\n|$|[,.;])/i
  const match = text.match(clientRegex)

  if (match && match[1]) {
    return match[1].trim()
  }

  return undefined
}

// Extract job phase from text
export function extractJobPhase(text: string): string | undefined {
  const jobPhaseRegex = /(?:job\s*)?phase(?:\s*:?\s*)([a-z0-9\s]+)(?:$|[\n\r]|[,.;])/i
  const match = text.match(jobPhaseRegex)

  if (match && match[1]) {
    const phaseValue = match[1].trim()
    return `Phase ${phaseValue}`
  }

  return undefined
}
