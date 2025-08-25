# TimeTracker Buddy

A powerful time tracking application that syncs with Google Calendar to automatically import and categorize your time entries. Perfect for freelancers, consultants, and teams who need to track billable hours and generate detailed timesheets.

## ✨ Features

- **Google Calendar Integration**: Automatically sync events from your Google Calendar
- **Smart Event Parsing**: Extracts job numbers, client names, and phases from event descriptions
- **Time Entry Management**: Add, edit, and delete time entries with detailed categorization
- **Billable Hour Tracking**: Distinguish between billable and non-billable time
- **Analytics & Reporting**: Daily and weekly summaries with visual charts
- **CSV Export**: Export timesheets for invoicing and reporting
- **Dark/Light Theme**: Modern UI with theme switching
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Google Cloud Console account for Calendar API access
- Vercel account (for deployment)

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/google-calendar-timesheet-addon.git
cd google-calendar-timesheet-addon
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Configure your environment variables in `.env.local`:
\`\`\`env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
\`\`\`

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Google Calendar Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins
6. Add the callback URL: `http://localhost:3000/api/auth/callback/google`

## 📊 How It Works

### Event Parsing

TimeTracker Buddy intelligently parses your Google Calendar events:

- **Job Numbers**: Looks for 5-digit numbers in event titles or descriptions
- **Client Names**: Extracts from patterns like "Client: ABC Corp" or analyzes description content
- **Job Phases**: Finds patterns like "Phase: Design" or "Job Phase: 1"
- **Task Types**: Categorizes based on keywords (meeting, development, design, etc.)

### Time Tracking

- Import entire weeks of calendar events with one click
- Manually add, edit, or delete time entries
- Categorize time as billable or non-billable
- Track time across multiple projects and clients

### Reporting

- Daily summaries with category breakdowns
- Weekly summaries with visual charts
- Export to CSV for invoicing
- Filter by category or client

## 🎨 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Authentication**: NextAuth.js with Google OAuth
- **UI Components**: shadcn/ui with Radix UI
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Deployment**: Vercel

## 📱 Screenshots

[Add screenshots of your application here]

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [v0](https://v0.dev) by Vercel
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide React](https://lucide.dev)

## 📞 Support

If you have any questions or need help setting up the application, please open an issue on GitHub.
