// Utility functions for extracting job information from calendar events

export function extractJobNumber(text: string): string {
  if (!text) return "UNKNOWN"

  const patterns = [
    // CAL-TH-2611 format
    /CAL-TH-(\d+)/i,
    // Job number: 12345 format
    /job\s*(?:number|#)?\s*:?\s*(\d{4,6})/i,
    // Project: 12345 format
    /project\s*:?\s*(\d{4,6})/i,
    // Standalone 5-6 digit numbers
    /\b(\d{5,6})\b/g,
    // Hash format #12345
    /#(\d{4,6})/g,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      return pattern.global ? match[0] : match[1] || match[0]
    }
  }

  return "UNKNOWN"
}

export function extractClientName(text: string): string | undefined {
  if (!text) return undefined

  const patterns = [
    // Client: ABC Corp
    /client\s*:?\s*([a-zA-Z0-9\s&.-]+?)(?:\n|$|[,.;])/i,
    // For ABC Corp
    /for\s+([a-zA-Z0-9\s&.-]+?)(?:\s+(?:project|meeting|call))/i,
    // ABC Corp project/meeting
    /([a-zA-Z0-9\s&.-]+?)\s+(?:project|meeting|call|review)/i,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const client = match[1].trim()
      // Filter out common words that aren't client names
      if (client.length > 2 && !["the", "and", "with", "team"].includes(client.toLowerCase())) {
        return client
      }
    }
  }

  return undefined
}

export function extractJobPhase(text: string): string | undefined {
  if (!text) return undefined

  const patterns = [
    // Phase: Design
    /phase\s*:?\s*([a-zA-Z0-9\s]+?)(?:\n|$|[,.;])/i,
    // Job Phase: 1
    /job\s*phase\s*:?\s*([a-zA-Z0-9\s]+?)(?:\n|$|[,.;])/i,
    // Phase 1, Phase A, etc.
    /phase\s+([a-zA-Z0-9]+)/i,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const phase = match[1].trim()
      return `Phase ${phase}`
    }
  }

  return undefined
}

export function categorizeTaskType(title: string, description = ""): string {
  const text = `${title} ${description}`.toLowerCase()

  const categories = [
    { keywords: ["meeting", "call", "standup", "sync"], type: "meeting" },
    { keywords: ["development", "coding", "programming", "dev"], type: "development" },
    { keywords: ["design", "ui", "ux", "mockup", "wireframe"], type: "design" },
    { keywords: ["research", "analysis", "investigate"], type: "research" },
    { keywords: ["planning", "strategy", "roadmap"], type: "planning" },
    { keywords: ["testing", "qa", "quality"], type: "testing" },
    { keywords: ["documentation", "docs", "write"], type: "documentation" },
    { keywords: ["review", "feedback", "approval"], type: "review" },
    { keywords: ["admin", "administrative", "paperwork"], type: "admin" },
    { keywords: ["training", "learning", "workshop"], type: "training" },
  ]

  for (const category of categories) {
    if (category.keywords.some((keyword) => text.includes(keyword))) {
      return category.type
    }
  }

  return "uncategorized"
}
