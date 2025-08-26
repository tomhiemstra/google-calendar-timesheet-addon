import { type NextRequest, NextResponse } from "next/server"

// This receives data from your Google Apps Script add-on
export async function POST(request: NextRequest) {
  try {
    const { eventId, calendarId, customFields, eventData } = await request.json()

    console.log("Received from Apps Script:", {
      eventId,
      customFields,
      eventData,
    })

    // Here you would typically:
    // 1. Validate the data
    // 2. Store it in your database
    // 3. Update the user's time entries

    // For now, we'll just log it and return success
    return NextResponse.json({
      success: true,
      message: "Timesheet data received from Apps Script",
      data: {
        eventId,
        customFields,
        processed: true,
      },
    })
  } catch (error) {
    console.error("Error processing Apps Script data:", error)
    return NextResponse.json({ error: "Failed to process timesheet data" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
