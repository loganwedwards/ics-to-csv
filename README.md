# ICS to CSV Converter

<img width="952" height="719" alt="image" src="https://github.com/user-attachments/assets/8933ae32-1945-45dd-91ad-d940da621ab0" />


🔒 **Privacy-First Calendar Converter** - Convert your ICS calendar files to CSV format with complete privacy protection.

## 🛡️ Privacy & Security

**Your data never leaves your device.** This application processes all calendar files entirely in your browser - no uploads to servers, no cloud processing, no data collection.

- ✅ **100% Client-Side Processing** - All conversion happens locally in your browser
- ✅ **No Server Uploads** - Your calendar data stays on your device
- ✅ **No Data Collection** - It won't track, store, or analyze your information
- ✅ **No Network Requests** - Works completely offline after initial load
- ✅ **Open Source** - Full transparency in how your data is handled

## ✨ Features

- 📅 Convert ICS calendar files to CSV spreadsheet format
- 🔄 Support for all major calendar applications (Google Calendar, Outlook, Apple Calendar, etc.)
- 📊 Preview events before downloading
- 📋 Copy to clipboard functionality
- 🎯 Drag & drop file upload
- 📱 Responsive design for desktop and mobile

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ics-to-csv
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3003`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 📖 How to Use

1. **Export your calendar** as an ICS file from your calendar application:
   - **Google Calendar**: Settings → Import & Export → Export
   - **Outlook**: File → Save Calendar → Save as type: iCalendar Format
   - **Apple Calendar**: File → Export → Export

2. **Upload the ICS file** using the drag & drop area or file picker

3. **Preview the converted events** in the table

4. **Download the CSV file** or copy to clipboard

5. **Open in your spreadsheet app** (Excel, Google Sheets, Numbers, etc.)

## 🔧 Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Pure JavaScript** ICS parsing (no external libraries)

## 📊 Supported Event Fields

The converter extracts these fields from your calendar events:

- Title (Summary)
- Start Date & Time
- End Date & Time
- Description
- Location
- Organizer
- Status
- UID (Unique Identifier)
- Created Date
- Last Modified Date

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## AI Disclaimer

This project was bootstrapped and built with Claude by Anthropic.

## 🔍 Privacy Notice

This application is designed with privacy as the top priority. All processing occurs locally in your browser using JavaScript. No calendar data is transmitted to any server or external service. The application can work completely offline after the initial page load.
