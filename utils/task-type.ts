// Utility functions for task type categorization and billing

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

// Get all non-billable categories
export function getNonBillableCategories(): string[] {
  return [...NON_BILLABLE_CATEGORIES]
}

// Categorize task type based on keywords
export function categorizeTaskType(title: string, description = ""): string {
  const text = `${title} ${description}`.toLowerCase()

  if (text.includes("meeting") || text.includes("call") || text.includes("standup")) {
    return "meeting"
  } else if (text.includes("development") || text.includes("coding") || text.includes("programming")) {
    return "development"
  } else if (text.includes("design") || text.includes("ui") || text.includes("ux")) {
    return "design"
  } else if (text.includes("research") || text.includes("analysis")) {
    return "research"
  } else if (text.includes("planning") || text.includes("strategy")) {
    return "planning"
  } else if (text.includes("testing") || text.includes("qa")) {
    return "testing"
  } else if (text.includes("documentation") || text.includes("docs")) {
    return "documentation"
  } else if (text.includes("review") || text.includes("feedback")) {
    return "review"
  } else if (text.includes("admin") || text.includes("administrative")) {
    return "admin"
  } else if (text.includes("training") || text.includes("learning")) {
    return "training"
  }

  return "uncategorized"
}

// Get suggested task types
export function getSuggestedTaskTypes(): string[] {
  return [
    "meeting",
    "development",
    "design",
    "research",
    "planning",
    "testing",
    "documentation",
    "review",
    "admin",
    "training",
    "uncategorized",
  ]
}
