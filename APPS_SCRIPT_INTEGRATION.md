# Google Apps Script Integration

## Overview
This application can receive enhanced timesheet data from a Google Apps Script add-on that runs inside Google Calendar.

## Webhook Endpoint
Your Apps Script should POST data to:
\`\`\`
POST /api/timesheet-import
\`\`\`

## Expected Data Format
\`\`\`javascript
{
  "eventId": "calendar_event_id",
  "calendarId": "user_calendar_id", 
  "customFields": {
    "jobNumber": "70123",
    "clientName": "ABC Corp",
    "jobPhase": "Phase 1",
    "billableType": "Billable",
    "taskType": "meeting",
    "notes": "Additional notes"
  },
  "eventData": {
    "title": "Client Meeting",
    "description": "Meeting description",
    "start": "2025-08-26T09:00:00Z",
    "end": "2025-08-26T10:00:00Z",
    "location": "Conference Room A"
  }
}
\`\`\`

## Apps Script Example
\`\`\`javascript
function sendTimesheetData(eventId, customFields) {
  const webhookUrl = 'https://your-app.vercel.app/api/timesheet-import';
  
  const payload = {
    eventId: eventId,
    calendarId: 'primary',
    customFields: customFields,
    eventData: {
      title: 'Meeting Title',
      start: '2025-08-26T09:00:00Z',
      end: '2025-08-26T10:00:00Z'
    }
  };
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload)
  };
  
  try {
    const response = UrlFetchApp.fetch(webhookUrl, options);
    console.log('Response:', response.getContentText());
  } catch (error) {
    console.error('Error sending data:', error);
  }
}
\`\`\`

## Testing
You can test the webhook endpoint using curl:
\`\`\`bash
curl -X POST http://localhost:3000/api/timesheet-import \\
  -H "Content-Type: application/json" \\
  -d '{
    "eventId": "test_event_123",
    "calendarId": "primary",
    "customFields": {
      "jobNumber": "70123",
      "clientName": "Test Client"
    },
    "eventData": {
      "title": "Test Meeting",
      "start": "2025-08-26T09:00:00Z",
      "end": "2025-08-26T10:00:00Z"
    }
  }'
\`\`\`
