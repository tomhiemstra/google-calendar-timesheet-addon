// Integration with Google Apps Script add-on

export interface AppsScriptData {
  eventId: string
  calendarId: string
  customFields: {
    jobNumber?: string
    clientName?: string
    jobPhase?: string
    billableType?: string
    taskType?: string
    notes?: string
  }
  eventData: {
    title: string
    description?: string
    start: string
    end: string
    location?: string
  }
}

export class AppsScriptIntegration {
  private webhookUrl: string

  constructor() {
    this.webhookUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/api/timesheet-import`
  }

  // This would be called by your Google Apps Script add-on
  async receiveData(data: AppsScriptData): Promise<boolean> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result.success
    } catch (error) {
      console.error("Failed to send data to webhook:", error)
      return false
    }
  }

  // Generate the webhook URL for your Apps Script
  getWebhookUrl(): string {
    return this.webhookUrl
  }

  // Validate incoming Apps Script data
  validateData(data: any): data is AppsScriptData {
    return (
      typeof data === "object" &&
      typeof data.eventId === "string" &&
      typeof data.calendarId === "string" &&
      typeof data.customFields === "object" &&
      typeof data.eventData === "object"
    )
  }
}

export const appsScriptIntegration = new AppsScriptIntegration()
