import { type NextRequest, NextResponse } from "next/server"

// This handles CSV exports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "csv"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const category = searchParams.get("category")

    // In a real implementation, you would:
    // 1. Fetch time entries from your database
    // 2. Filter by date range and category
    // 3. Format according to the requested format

    // Mock data for demonstration
    const timeEntries = [
      {
        date: "2025-08-26",
        title: "Client Meeting - Project Alpha",
        jobNumber: "70123",
        client: "ABC Corp",
        phase: "Discovery",
        category: "meeting",
        startTime: "09:00",
        endTime: "10:00",
        duration: 60,
      },
      {
        date: "2025-08-26",
        title: "Development Sprint Planning",
        jobNumber: "70124",
        client: "Internal",
        phase: "Planning",
        category: "planning",
        startTime: "14:00",
        endTime: "15:30",
        duration: 90,
      },
    ]

    if (format === "csv") {
      let csvContent = "Date,Title,Job Number,Client,Phase,Category,Start Time,End Time,Duration (minutes)\n"

      timeEntries.forEach((entry) => {
        csvContent += `"${entry.date}","${entry.title}","${entry.jobNumber}","${entry.client}","${entry.phase}","${entry.category}","${entry.startTime}","${entry.endTime}",${entry.duration}\n`
      })

      const filename = `timesheet-${startDate || "export"}-${endDate || "to-present"}.csv`

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      })
    }

    // JSON format
    return NextResponse.json({
      success: true,
      data: timeEntries,
      meta: {
        startDate,
        endDate,
        category,
        count: timeEntries.length,
      },
    })
  } catch (error) {
    console.error("Error exporting data:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}
