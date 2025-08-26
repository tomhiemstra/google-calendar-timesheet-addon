// Client-side API functions for interacting with our backend

export interface TimeEntry {
  id: string
  title: string
  start: string
  end: string
  jobNumber: string
  client?: string
  phase?: string
  category: string
  duration: number
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: string
  end: string
  jobNumber?: string
  client?: string
  phase?: string
}

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  }

  // Sync with Google Calendar
  async syncCalendar(accessToken: string, startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
    const params = new URLSearchParams()
    if (startDate) params.append("startDate", startDate.toISOString().split("T")[0])
    if (endDate) params.append("endDate", endDate.toISOString().split("T")[0])

    const response = await fetch(`${this.baseUrl}/api/calendar-sync?${params}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Calendar sync failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.events || []
  }

  // Export timesheet data
  async exportTimesheet(
    options: {
      format?: "csv" | "json"
      startDate?: Date
      endDate?: Date
      category?: string
    } = {},
  ): Promise<Blob | any> {
    const params = new URLSearchParams()
    if (options.format) params.append("format", options.format)
    if (options.startDate) params.append("startDate", options.startDate.toISOString().split("T")[0])
    if (options.endDate) params.append("endDate", options.endDate.toISOString().split("T")[0])
    if (options.category) params.append("category", options.category)

    const response = await fetch(`${this.baseUrl}/api/export?${params}`)

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`)
    }

    if (options.format === "csv") {
      return response.blob()
    }

    return response.json()
  }

  // Send data to Apps Script (webhook)
  async sendToAppsScript(data: {
    eventId: string
    calendarId: string
    customFields: Record<string, any>
    eventData: any
  }): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/api/timesheet-import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Apps Script sync failed: ${response.statusText}`)
    }

    const result = await response.json()
    return result.success
  }

  // Download file from blob
  downloadFile(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

export const apiClient = new ApiClient()
