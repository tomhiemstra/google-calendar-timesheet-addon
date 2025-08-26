import { type NextRequest, NextResponse } from "next/server"
import { OAuth2Client } from "google-auth-library"

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NEXTAUTH_URL + "/api/auth/callback/google",
)

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()

    // Verify the ID token
    const ticket = await oauth2Client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 })
    }

    // Exchange for access token with Calendar scope
    const { tokens } = await oauth2Client.getAccessToken({
      code: idToken, // This is simplified - in production you'd use proper OAuth flow
      scope: [
        "https://www.googleapis.com/auth/calendar.readonly",
        "https://www.googleapis.com/auth/calendar.events",
      ].join(" "),
    })

    return NextResponse.json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expiry_date,
    })
  } catch (error) {
    console.error("Token exchange error:", error)
    return NextResponse.json({ error: "Failed to exchange token" }, { status: 500 })
  }
}
