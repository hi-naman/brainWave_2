// Google Calendar Tasks Integration Script
let gapi; // Google API client

// Initialize the Google API client
function initGoogleCalendarClient() {
    gapi = window.gapi;
    gapi.load('client:auth2', initClient);
}

// Configure and initialize the API client
function initClient() {
    gapi.client.init({
        apiKey: 'YOUR_GOOGLE_API_KEY',
        clientId: 'YOUR_GOOGLE_CLIENT_ID',
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
        scope: "https://www.googleapis.com/auth/calendar"
    }).then(() => {
        // Client is initialized and ready
        console.log('Google Calendar API initialized');
    }).catch((error) => {
        console.error('Error initializing Google Calendar API', error);
    });
}

// Function to add a task to Google Calendar
async function addTaskToGoogleCalendar(taskName) {
    try {
        const event = {
            'summary': taskName,
            'start': {
                'dateTime': new Date().toISOString(),
                'timeZone': 'Your_Timezone' // e.g., 'America/New_York'
            },
            'end': {
                'dateTime': new Date(new Date().getTime() + 60*60*1000).toISOString(), // 1 hour duration
                'timeZone': 'Your_Timezone'
            }
        };

        const response = await gapi.client.calendar.events.insert({
            'calendarId': 'primary',
            'resource': event
        });

        console.log('Task added to Google Calendar:', response);
        return response.result.htmlLink;
    } catch (error) {
        console.error('Error adding task to Google Calendar', error);
        return null;
    }
}

// Modify existing addTask function to sync with Google Calendar
function addTask() {
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    
    if (taskInput.value.trim() === '') return;

    // First, add to local task list
    const li = document.createElement('li');
    li.innerHTML = `
        ${taskInput.value}
        <span class="delete-task" onclick="deleteTask(this)">✖</span>
    `;
    taskList.appendChild(li);

    // Then sync with Google Calendar
    if (gapi && gapi.auth2 && gapi.auth2.getAuthInstance().isSignedIn.get()) {
        addTaskToGoogleCalendar(taskInput.value);
    }

    // Clear input
    taskInput.value = '';
}

// Load Google API script
function loadGoogleCalendarScript() {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = initGoogleCalendarClient;
    document.head.appendChild(script);
}

// Call this when the page loads
window.addEventListener('load', loadGoogleCalendarScript);
