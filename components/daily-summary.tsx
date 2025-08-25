"use client"

import { useTimeTracking } from "@/components/time-tracking-provider"
import { format } from "date-fns"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

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

export function DailySummary() {
  const { selectedDate, timeEntries, setActiveCategoryFilter, activeCategoryFilter } = useTimeTracking()

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd")
  const entriesForDay = timeEntries.filter((entry) => entry.start.startsWith(selectedDateStr))

  const totalMinutes = entriesForDay.reduce((sum, entry) => sum + entry.duration, 0)
  const totalHours = Math.floor(totalMinutes / 60)
  const remainingMinutes = totalMinutes % 60

  // Calculate category breakdown
  const categoryBreakdown = entriesForDay.reduce(
    (acc, entry) => {
      const category = entry.taskType
      if (!acc[category]) {
        acc[category] = 0
      }
      acc[category] += entry.duration
      return acc
    },
    {} as Record<string, number>,
  )

  const categoryData = Object.entries(categoryBreakdown).map(([category, minutes]) => ({
    name: category,
    value: minutes,
    percentage: Math.round((minutes / totalMinutes) * 100),
    color: COLORS[category as keyof typeof COLORS] || COLORS.uncategorized,
  }))

  // Calculate billable vs non-billable (simplified - all meeting/planning/review as billable)
  const billableCategories = ["meeting", "planning", "review", "development", "design"]
  const billableMinutes = entriesForDay
    .filter((entry) => billableCategories.includes(entry.taskType))
    .reduce((sum, entry) => sum + entry.duration, 0)
  const nonBillableMinutes = totalMinutes - billableMinutes

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-medium text-gray-900 mb-2">Daily Summary</h3>
        <p className="text-sm text-gray-600 mb-4">Time breakdown for {format(selectedDate, "MMMM d, yyyy")}</p>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Total Time</span>
            <span className="text-lg font-semibold text-gray-900">
              {totalHours}h {remainingMinutes}m
            </span>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Breakdown by Category</h4>
          <div className="space-y-2">
            {categoryData.map((category) => (
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
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {Math.floor(category.value / 60)}h {category.value % 60}m ({category.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Category Distribution</h4>
          {totalMinutes > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">
              <p>No data to display</p>
            </div>
          )}
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Stats</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">Billable</div>
              <div className="text-lg font-semibold text-gray-900">
                {Math.floor(billableMinutes / 60)}h {billableMinutes % 60}m
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">Non-Billable</div>
              <div className="text-lg font-semibold text-gray-900">
                {Math.floor(nonBillableMinutes / 60)}h {nonBillableMinutes % 60}m
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
