const logEvent = (eventType, data) => {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      eventType,
      data
    };

    // Get existing logs from localStorage
    let logData = [];
    const existingLogs = localStorage.getItem('logdataevents');
    if (existingLogs) {
      logData = JSON.parse(existingLogs);
    }

    // Add new log entry
    logData.push(logEntry);

    // Save back to localStorage
    localStorage.setItem('logdataevents', JSON.stringify(logData));
  } catch (error) {
    console.error('Error logging event:', error);
  }
};

export default logEvent;
