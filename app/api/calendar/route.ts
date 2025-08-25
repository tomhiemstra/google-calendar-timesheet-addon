import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeMin = searchParams.get("timeMin")
    const timeMax = searchParams.get("timeMax")

    // Mock response for now - replace with actual Google Calendar API call
    const mockEvents = {
      items: [
        {
          id: "mock_event_1",
          summary: "Team Meeting - Project 70123",
          description: "Client: Acme Corp\nJob Number: 70123\nPhase: Planning",
          start: {
            dateTime: timeMin || new Date().toISOString(),
          },
          end: {
            dateTime: timeMax || new Date(Date.now() + 3600000).toISOString(),
          },
        },
        {
          id: "mock_event_2",
          summary: "Development Work - Website",
          description: "Job Number: 70124\nClient: Tech Solutions\nPhase: Development",
          start: {
            dateTime: timeMin
              ? new Date(new Date(timeMin).getTime() + 7200000).toISOString()
              : new Date(Date.now() + 7200000).toISOString(),
          },
          end: {
            dateTime: timeMax
              ? new Date(new Date(timeMax).getTime() - 3600000).toISOString()
              : new Date(Date.now() + 10800000).toISOString(),
          },
        },
      ],
    }

    return NextResponse.json(mockEvents)
  } catch (error) {
    console.error("Calendar API error:", error)
    return NextResponse.json({ error: "Failed to fetch calendar events" }, { status: 500 })
  }
}
