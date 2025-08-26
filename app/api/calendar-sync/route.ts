import { type NextRequest, NextResponse } from "next/server"

// This handles syncing with Google Calendar
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const accessToken = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!accessToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    // In a real implementation, you would:
    // 1. Use the access token to fetch from Google Calendar API
    // 2. Filter by date range
    // 3. Return the actual events

    // For now, return enhanced mock data
    const mockEvents = [
      {
        id: "event_1",
        title: "Client Meeting - Project Alpha",
        description: "Job Number: 70123\nClient: ABC Corp\nPhase: Discovery",
        start: startDate ? `${startDate}T09:00:00Z` : "2025-08-26T09:00:00Z",
        end: startDate ? `${startDate}T10:00:00Z` : "2025-08-26T10:00:00Z",
        jobNumber: "70123",
        client: "ABC Corp",
        phase: "Discovery",
      },
      {
        id: "event_2",
        title: "Development Sprint Planning",
        description: "Job: 70124\nTeam planning session",
        start: startDate ? `${startDate}T14:00:00Z` : "2025-08-26T14:00:00Z",
        end: startDate ? `${startDate}T15:30:00Z` : "2025-08-26T15:30:00Z",
        jobNumber: "70124",
        client: "Internal",
        phase: "Planning",
      },
    ]

    return NextResponse.json({
      success: true,
      events: mockEvents,
      count: mockEvents.length,
    })
  } catch (error) {
    console.error("Error syncing calendar:", error)
    return NextResponse.json({ error: "Failed to sync calendar" }, { status: 500 })
  }
}

export async function POST() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
