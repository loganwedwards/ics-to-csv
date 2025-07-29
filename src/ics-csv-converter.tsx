import { useState, useCallback } from 'react';
import { Upload, Download, FileText, Calendar, CheckCircle, AlertCircle, Copy } from 'lucide-react';

interface Event {
  summary: string;
  dtstart: string;
  dtend: string;
  description: string;
  location: string;
  organizer: string;
  status: string;
  uid: string;
  created: string;
  lastModified: string;
}

const ICSToCSVConverter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const parseICSFile = useCallback((content: string): Event[] => {
    const events: Event[] = [];
    const lines = content.split(/\r?\n/);
    let currentEvent: Event | null = null;
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      
      // Handle line folding (lines starting with space or tab)
      while (i + 1 < lines.length && (lines[i + 1].startsWith(' ') || lines[i + 1].startsWith('\t'))) {
        i++;
        line += lines[i].substring(1);
      }
      
      if (line === 'BEGIN:VEVENT') {
        currentEvent = {
          summary: '',
          dtstart: '',
          dtend: '',
          description: '',
          location: '',
          organizer: '',
          status: '',
          uid: '',
          created: '',
          lastModified: ''
        };
      } else if (line === 'END:VEVENT' && currentEvent) {
        events.push(currentEvent);
        currentEvent = null;
      } else if (currentEvent && line.includes(':')) {
        const colonIndex = line.indexOf(':');
        const property = line.substring(0, colonIndex).toUpperCase();
        const value = line.substring(colonIndex + 1);
        
        // Handle different property formats
        const baseProperty = property.split(';')[0];
        
        switch (baseProperty) {
          case 'SUMMARY':
            currentEvent.summary = value;
            break;
          case 'DTSTART':
            currentEvent.dtstart = formatDateTime(value);
            break;
          case 'DTEND':
            currentEvent.dtend = formatDateTime(value);
            break;
          case 'DESCRIPTION':
            currentEvent.description = value.replace(/\\n/g, ' ').replace(/\\,/g, ',').replace(/\\\\/g, '\\');
            break;
          case 'LOCATION':
            currentEvent.location = value;
            break;
          case 'ORGANIZER': {
            // Extract email from ORGANIZER field
            const emailMatch = value.match(/mailto:([^;]+)/);
            currentEvent.organizer = emailMatch ? emailMatch[1] : value;
            break;
          }
          case 'STATUS':
            currentEvent.status = value;
            break;
          case 'UID':
            currentEvent.uid = value;
            break;
          case 'CREATED':
            currentEvent.created = formatDateTime(value);
            break;
          case 'LAST-MODIFIED':
            currentEvent.lastModified = formatDateTime(value);
            break;
        }
      }
    }
    
    return events;
  }, []);

  const formatDateTime = (dateTimeString: string): string => {
    if (!dateTimeString) return '';
    
    // Handle different datetime formats
    if (dateTimeString.includes('T')) {
      // Format: YYYYMMDDTHHMMSSZ or YYYYMMDDTHHMMSS
      const cleanDateTime = dateTimeString.replace(/[TZ]/g, '');
      if (cleanDateTime.length >= 8) {
        const year = cleanDateTime.substring(0, 4);
        const month = cleanDateTime.substring(4, 6);
        const day = cleanDateTime.substring(6, 8);
        const hour = cleanDateTime.substring(8, 10) || '00';
        const minute = cleanDateTime.substring(10, 12) || '00';
        const second = cleanDateTime.substring(12, 14) || '00';
        
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
      }
    } else if (dateTimeString.length === 8) {
      // Format: YYYYMMDD (date only)
      const year = dateTimeString.substring(0, 4);
      const month = dateTimeString.substring(4, 6);
      const day = dateTimeString.substring(6, 8);
      return `${year}-${month}-${day}`;
    }
    
    return dateTimeString;
  };

  const handleFileUpload = useCallback(async (uploadedFile: File | null) => {
    if (!uploadedFile) return;
    
    if (!uploadedFile.name.toLowerCase().endsWith('.ics')) {
      setError('Please select a valid ICS file');
      return;
    }

    setIsProcessing(true);
    setError('');
    setFile(uploadedFile);

    try {
      const content = await uploadedFile.text();
      const parsedEvents = parseICSFile(content);
      
      if (parsedEvents.length === 0) {
        setError('No events found in the ICS file');
      } else {
        setEvents(parsedEvents);
      }
    } catch (err) {
      setError('Error parsing ICS file: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsProcessing(false);
    }
  }, [parseICSFile]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileUpload(droppedFile);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const generateCSVContent = () => {
    const headers = [
      'Title',
      'Start Date',
      'End Date', 
      'Description',
      'Location',
      'Organizer',
      'Status',
      'UID',
      'Created',
      'Last Modified'
    ];
    
    const csvRows = events.map(event => [
      escapeCSVField(event.summary || ''),
      escapeCSVField(event.dtstart || ''),
      escapeCSVField(event.dtend || ''),
      escapeCSVField(event.description || ''),
      escapeCSVField(event.location || ''),
      escapeCSVField(event.organizer || ''),
      escapeCSVField(event.status || ''),
      escapeCSVField(event.uid || ''),
      escapeCSVField(event.created || ''),
      escapeCSVField(event.lastModified || '')
    ]);

    return [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');
  };

  const convertToCSV = () => {
    console.log('🔍 Download button clicked');
    console.log('📊 Events to convert:', events.length);
    
    try {
      const csvContent = generateCSVContent();
      console.log('✅ CSV content generated, length:', csvContent.length);
      console.log('📝 First 200 chars:', csvContent.substring(0, 200));
      
      const fileName = file ? file.name.replace(/\.ics$/i, '.csv') : 'calendar_events.csv';
      console.log('📁 File name:', fileName);
      
      // Create and trigger download
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      console.log('💾 Blob created, size:', blob.size, 'bytes');
      
      const url = window.URL.createObjectURL(blob);
      console.log('🔗 Object URL created:', url);
      
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      
      console.log('🔗 Link element created with href:', a.href, 'download:', a.download);
      
      document.body.appendChild(a);
      console.log('📎 Link added to DOM');
      
      a.click();
      console.log('🖱️ Link clicked');
      
      // Cleanup
      setTimeout(() => {
        try {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          console.log('🧹 Cleanup completed');
        } catch (cleanupError) {
          console.error('❌ Cleanup error:', cleanupError);
        }
      }, 100);
      
      console.log('✅ Download process completed');
      
    } catch (error) {
      console.error('❌ Download failed with error:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'Unknown error');
    }
  };

  const copyToClipboard = async () => {
    try {
      const csvContent = generateCSVContent();
      await navigator.clipboard.writeText(csvContent);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = generateCSVContent();
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err2) {
        console.error('Fallback copy failed:', err2);
      }
      document.body.removeChild(textArea);
    }
  };

  const escapeCSVField = (field: string | null | undefined): string => {
    if (field == null) return '';
    const str = String(field);
    // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Calendar className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">ICS to CSV Converter</h1>
        </div>
        <p className="text-gray-600">Convert your calendar files to spreadsheet format</p>
      </div>

      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-700">
            Drop your ICS file here or click to browse
          </p>
          <p className="text-sm text-gray-500">
            Supports .ics calendar files from Google Calendar, Outlook, Apple Calendar, and more
          </p>
        </div>
        <input
          type="file"
          accept=".ics"
          onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
        >
          Choose File
        </label>
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 text-blue-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Processing your calendar file...
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Success State */}
      {events.length > 0 && (
        <div className="mt-8 space-y-6">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Success!</span>
              <span>Found {events.length} calendar event{events.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Preview */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Preview (showing first 5 events)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Title</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Start Date</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">End Date</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {events.slice(0, 5).map((event, index) => (
                    <tr key={index} className="border-t border-gray-100">
                      <td className="px-4 py-2 text-gray-900">{event.summary || 'No title'}</td>
                      <td className="px-4 py-2 text-gray-600">{event.dtstart || 'No start date'}</td>
                      <td className="px-4 py-2 text-gray-600">{event.dtend || 'No end date'}</td>
                      <td className="px-4 py-2 text-gray-600">{event.location || 'No location'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {events.length > 5 && (
              <div className="bg-gray-50 px-4 py-2 text-sm text-gray-600 border-t border-gray-200">
                ... and {events.length - 5} more events
              </div>
            )}
          </div>

          {/* Download and Copy Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={convertToCSV}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Download className="w-5 h-5" />
              Download CSV File
            </button>
            <button
              onClick={copyToClipboard}
              className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium ${
                copySuccess 
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Copy className="w-5 h-5" />
              {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="font-medium text-gray-900 mb-3">How to use:</h3>
        <ol className="space-y-2 text-sm text-gray-600">
          <li><strong>1.</strong> Export your calendar as an ICS file from your calendar app</li>
          <li><strong>2.</strong> Upload the ICS file using the area above</li>
          <li><strong>3.</strong> Preview the converted events</li>
          <li><strong>4.</strong> Download your CSV file and open it in Excel, Google Sheets, or any spreadsheet app</li>
        </ol>
      </div>
    </div>
  );
};

export default ICSToCSVConverter;