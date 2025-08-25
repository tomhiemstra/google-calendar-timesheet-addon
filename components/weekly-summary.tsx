"use client"

import { useTimeTracking } from "@/components/time-tracking-provider"
import { format, startOfWeek, endOfWeek } from "date-fns"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const COLORS = {
  meeting: "#F59E0B",
  planning: "#10B981",
  review: "#06B6D4",
  uncategorized: "#6B7280",
  development: "#3B82F6",
  design: "#8B5CF6",
  research: "#059669",
  testing: "#DC2626",
  documentation: "#4B5563",
  training: "#4F46E5",
  admin: "#EA580C",
}

export function WeeklySummary() {
  const { selectedDate, weeklySummary, exportWeeklyTimesheet, setActiveCategoryFilter, activeCategoryFilter } =
    useTimeTracking()

  const weekStart = startOfWeek(selectedDate)
  const weekEnd = endOfWeek(selectedDate)

  const totalHours = Math.floor(weeklySummary.totalMinutes / 60)
  const totalMinutes = weeklySummary.totalMinutes % 60

  // Prepare chart data
  const dailyChartData = weeklySummary.dailyBreakdown.map((day) => ({
    date: format(new Date(day.date), "EEE"),
    billable: Math.round((day.billableMinutes / 60) * 100) / 100,
    nonBillable: Math.round((day.nonBillableMinutes / 60) * 100) / 100,
    total: Math.round((day.totalMinutes / 60) * 100) / 100,
  }))

  const categoryChartData = weeklySummary.categoryBreakdown.map((cat) => ({
    name: cat.category,
    value: cat.totalMinutes,
    percentage: Math.round((cat.totalMinutes / weeklySummary.totalMinutes) * 100),
    color: COLORS[cat.category as keyof typeof COLORS] || COLORS.uncategorized,
  }))

  const jobChartData = weeklySummary.jobBreakdown.map((job) => ({
    name: job.jobNumber,
    value: Math.round((job.totalMinutes / 60) * 100) / 100,
  }))

  const billableHours = Math.floor(weeklySummary.billableMinutes / 60)
  const billableMinutes = weeklySummary.billableMinutes % 60
  const nonBillableHours = Math.floor(weeklySummary.nonBillableMinutes / 60)
  const nonBillableMinutesRem = weeklySummary.nonBillableMinutes % 60

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-medium text-gray-900 mb-2">Weekly Summary</h3>
        <p className="text-sm text-gray-600 mb-4">
          Time breakdown for {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
        </p>

        {/* Total Time */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Total Time</span>
            <span className="text-lg font-semibold text-gray-900">
              {totalHours}h {totalMinutes}m
            </span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Breakdown by Category</h4>
          <div className="space-y-2">
            {categoryChartData.map((category) => (
              <div
                key={category.name}
                className={`flex items-center justify-between cursor-pointer p-2 rounded ${
                  activeCategoryFilter === category.name ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                }`}
                onClick={() => setActiveCategoryFilter(activeCategoryFilter === category.name ? null : category.name)}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                  <span className="text-sm text-gray-700 capitalize">{category.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        backgroundColor: category.color,
                        width: `${category.percentage}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-16 text-right">
                    {Math.floor(category.value / 60)}h {category.value % 60}m ({category.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Breakdown Chart */}
        {weeklySummary.totalMinutes > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Daily Breakdown</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`${value}h`, "Hours"]} />
                  <Bar dataKey="billable" stackId="a" fill="#00C49F" name="Billable" />
                  <Bar dataKey="nonBillable" stackId="a" fill="#FF8042" name="Non-billable" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Category Distribution Pie Chart */}
        {weeklySummary.totalMinutes > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Category Distribution</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${Math.floor(value / 60)}h ${value % 60}m`, "Time"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Job Breakdown */}
        {jobChartData.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Time by Job Number</h4>
            <div className="space-y-2">
              {jobChartData.map((job, index) => (
                <div key={job.name} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{job.name}</span>
                  <span className="text-sm text-gray-600">{job.value}h</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Stats</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">Billable</div>
              <div className="text-lg font-semibold text-gray-900">
                {billableHours}h {billableMinutes}m
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">Non-Billable</div>
              <div className="text-lg font-semibold text-gray-900">
                {nonBillableHours}h {nonBillableMinutesRem}m
              </div>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <Button onClick={exportWeeklyTimesheet} variant="outline" className="w-full bg-transparent">
          <Download className="h-4 w-4 mr-2" />
          Export Weekly CSV
        </Button>

        {weeklySummary.totalMinutes === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No time entries this week</p>
            <p className="text-sm">Add some entries or sync with your calendar</p>
          </div>
        )}
      </div>
    </div>
  )
}
