"use client"

import { useEffect, useRef } from "react"

interface GoogleSignInProps {
  onSignIn: (user: any) => void
  onError: (error: Error) => void
}

export function GoogleSignIn({ onSignIn, onError }: GoogleSignInProps) {
  const buttonRef = useRef<HTMLDivElement>(null)
  const scriptLoaded = useRef(false)

  useEffect(() => {
    if (scriptLoaded.current) return

    const loadGoogleScript = () => {
      const script = document.createElement("script")
      script.src = "https://accounts.google.com/gsi/client"
      script.async = true
      script.defer = true
      script.onload = initializeGoogleSignIn
      document.head.appendChild(script)
      scriptLoaded.current = true
    }

    const initializeGoogleSignIn = () => {
      if (!window.google) {
        onError(new Error("Google Sign-In failed to load"))
        return
      }

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      })

      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          width: 250,
          text: "signin_with",
        })
      }
    }

    const handleCredentialResponse = async (response: any) => {
      try {
        // Decode JWT to get user info
        const payload = JSON.parse(atob(response.credential.split(".")[1]))

        // Exchange for access token
        const tokenResponse = await fetch("/api/auth/google-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idToken: response.credential,
            // Request Calendar API scopes
            scopes: [
              "https://www.googleapis.com/auth/calendar.readonly",
              "https://www.googleapis.com/auth/calendar.events",
            ],
          }),
        })

        if (!tokenResponse.ok) {
          throw new Error("Failed to get access token")
        }

        const tokens = await tokenResponse.json()

        const user = {
          id: payload.sub,
          name: payload.name,
          email: payload.email,
          picture: payload.picture,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        }

        onSignIn(user)
      } catch (error) {
        onError(error as Error)
      }
    }

    loadGoogleScript()
  }, [onSignIn, onError])

  return (
    <div className="flex flex-col items-center space-y-4">
      <div ref={buttonRef} id="google-signin-button" />
      <p className="text-sm text-gray-600 text-center">Sign in with your Google account to access your calendar</p>
    </div>
  )
}
