export interface GoogleUser {
  id: string
  name: string
  email: string
  picture?: string
  accessToken: string
  refreshToken?: string
}

export interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone?: string
  }
  end: {
    dateTime: string
    timeZone?: string
  }
  location?: string
  attendees?: Array<{
    email: string
    displayName?: string
  }>
}

class GoogleCalendarService {
  private static instance: GoogleCalendarService
  private accessToken: string | null = null

  static getInstance(): GoogleCalendarService {
    if (!GoogleCalendarService.instance) {
      GoogleCalendarService.instance = new GoogleCalendarService()
    }
    return GoogleCalendarService.instance
  }

  setAccessToken(token: string) {
    this.accessToken = token
  }

  async signInWithGoogle(): Promise<GoogleUser> {
    return new Promise((resolve, reject) => {
      // Load Google Identity Services
      if (typeof window === "undefined") {
        reject(new Error("Google Sign-In only works in browser environment"))
        return
      }

      // Initialize Google Identity Services
      window.google?.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: async (response: any) => {
          try {
            // Decode the JWT token to get user info
            const payload = JSON.parse(atob(response.credential.split(".")[1]))

            // Get access token for Calendar API
            const tokenResponse = await this.getAccessToken(response.credential)

            const user: GoogleUser = {
              id: payload.sub,
              name: payload.name,
              email: payload.email,
              picture: payload.picture,
              accessToken: tokenResponse.access_token,
              refreshToken: tokenResponse.refresh_token,
            }

            this.setAccessToken(tokenResponse.access_token)
            resolve(user)
          } catch (error) {
            reject(error)
          }
        },
      })

      // Render the sign-in button
      window.google?.accounts.id.renderButton(document.getElementById("google-signin-button"), {
        theme: "outline",
        size: "large",
        width: 250,
      })

      // Prompt for sign-in
      window.google?.accounts.id.prompt()
    })
  }

  private async getAccessToken(idToken: string): Promise<any> {
    const response = await fetch("/api/auth/google-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    })

    if (!response.ok) {
      throw new Error("Failed to get access token")
    }

    return response.json()
  }

  async getCalendarEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    if (!this.accessToken) {
      throw new Error("No access token available")
    }

    const timeMin = startDate.toISOString()
    const timeMax = endDate.toISOString()

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        `timeMin=${encodeURIComponent(timeMin)}&` +
        `timeMax=${encodeURIComponent(timeMax)}&` +
        `singleEvents=true&` +
        `orderBy=startTime`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch calendar events: ${response.statusText}`)
    }

    const data = await response.json()
    return data.items || []
  }

  async createCalendarEvent(event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    if (!this.accessToken) {
      throw new Error("No access token available")
    }

    const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    })

    if (!response.ok) {
      throw new Error(`Failed to create calendar event: ${response.statusText}`)
    }

    return response.json()
  }

  signOut() {
    this.accessToken = null
    if (typeof window !== "undefined") {
      window.google?.accounts.id.disableAutoSelect()
    }
  }
}

export const googleCalendarService = GoogleCalendarService.getInstance()

// Extend Window interface for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          renderButton: (element: HTMLElement | null, config: any) => void
          prompt: () => void
          disableAutoSelect: () => void
        }
      }
    }
  }
}
