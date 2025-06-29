document.addEventListener('DOMContentLoaded', () => {
    const notificationButton = document.querySelector('.notification-button');
    if (notificationButton) {
        notificationButton.addEventListener('click', showNotificationPopup);
    }
});

async function showNotificationPopup() {
    // Create overlay element (the blurred backdrop)
    const overlay = document.createElement('div');
    overlay.className = 'notification-overlay';

    // Create popup container with header and a container for emails
    const popup = document.createElement('div');
    popup.className = 'notification-popup';
    popup.innerHTML = `
        <button class="close-notification" aria-label="Close">&times;</button>
        <div class="notification-header">
            <h2>Latest Emails</h2>
        </div>
        <div id="emails-container">
            <div class="loading-indicator">
                <div class="loading-spinner"></div>
            </div>
        </div>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    // Prevent body scrolling when popup is open
    document.body.style.overflow = 'hidden';

    // Add popup appearing animation effect
    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 10);

    // Set up close events
    const closeButton = popup.querySelector('.close-notification');
    closeButton.addEventListener('click', () => removeNotificationPopup(overlay));
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            removeNotificationPopup(overlay);
        }
    });

    // Setup escape key to close
    document.addEventListener('keydown', handleEscapeKey);
    
    function handleEscapeKey(e) {
        if (e.key === 'Escape') {
            removeNotificationPopup(overlay);
            document.removeEventListener('keydown', handleEscapeKey);
        }
    }


    // Fetch and display emails
    const emailsContainer = popup.querySelector('#emails-container');
    await loadEmails(emailsContainer);
}

async function loadEmails(container) {
    try {
        const emails = await fetchLatestEmails();
        displayEmails(emails, container);
    } catch (error) {
        console.error('Error fetching emails:', error);
        // Define 5 dummy emails to show in case of errors
        const dummyEmails = [
            {
                subject: "Welcome to BRAINwave!",
                from: "noreply@brainwave.com",
                snippet: "Thank you for signing up for BRAINwave. We're excited to have you join our community of innovators and thinkers."
            },
            {
                subject: "Your Weekly Update",
                from: "updates@brainwave.com",
                snippet: "Here's what happened this week in your network. 3 new connections, 5 new content recommendations, and 2 upcoming events."
            },
            {
                subject: "Don't miss our new features",
                from: "features@brainwave.com",
                snippet: "We've added new functionalities to improve your experience. Check out our enhanced AI assistant, improved notifications, and more!"
            },
            {
                subject: "Security Alert",
                from: "security@brainwave.com",
                snippet: "We noticed a new sign-in on your account. If this wasn't you, please review your account activity and update your password."
            },
            {
                subject: "Invitation to join our Beta",
                from: "beta@brainwave.com",
                snippet: "You're invited to try out our latest beta features. Join now to get early access to our upcoming AI-powered productivity tools."
            }
        ];
        displayEmails(dummyEmails, container);
    }
}

function removeNotificationPopup(overlay) {
    // Add fade-out animation
    overlay.style.opacity = '0';
    
    // Remove overlay after animation completes
    setTimeout(() => {
        overlay.remove();
        // Re-enable body scrolling
        document.body.style.overflow = '';
    }, 300);
}

async function fetchLatestEmails() {
    // Simulate network delay for demo purposes
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Ensure that the Gmail API is loaded
    await gapi.client.load('gmail', 'v1');
    
    // List messages with a maximum of 5 results
    const listResponse = await gapi.client.gmail.users.messages.list({
        'userId': 'me',
        'maxResults': 5
    });
    
    const messages = listResponse.result.messages || [];
    
    // For each message, get full details including headers and snippet
    const emailDetails = await Promise.all(messages.map(async (msg) => {
        const msgResponse = await gapi.client.gmail.users.messages.get({
            'userId': 'me',
            'id': msg.id,
            'format': 'full'
        });
        const headers = msgResponse.result.payload.headers;
        const subjectHeader = headers.find(h => h.name === "Subject");
        const fromHeader = headers.find(h => h.name === "From");
        const dateHeader = headers.find(h => h.name === "Date");
        
        return {
            id: msg.id,
            subject: subjectHeader ? subjectHeader.value : "(No Subject)",
            from: fromHeader ? fromHeader.value : "(Unknown Sender)",
            date: dateHeader ? new Date(dateHeader.value) : new Date(),
            snippet: msgResponse.result.snippet
        };
    }));
    
    // Sort by date (newest first)
    return emailDetails.sort((a, b) => b.date - a.date);
}

function displayEmails(emails, container) {
    if (!emails.length) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No emails found.</p>
                <p>Your inbox is empty at the moment.</p>
            </div>
        `;
        return;
    }
    
    // Build HTML for each email
    let html = '<ul class="email-list">';
    emails.forEach(email => {
        // Format the date if available
        const dateDisplay = email.date ? formatDate(email.date) : '';
        
        html += `
            <li class="email-item" data-email-id="${email.id || ''}">
                <h3 class="email-subject">${email.subject}</h3>
                <p class="email-from">
                    <strong>From:</strong> ${email.from}
                    ${dateDisplay ? `<span style="float:right;color:#999;font-size:12px;">${dateDisplay}</span>` : ''}
                </p>
                <p class="email-snippet">${email.snippet}</p>
            </li>
        `;
    });
    html += '</ul>';
    
    container.innerHTML = html;
    
    // Add click event to each email item to show full email (could expand in future)
    const emailItems = container.querySelectorAll('.email-item');
    emailItems.forEach(item => {
        item.addEventListener('click', () => {
            // Visual feedback for click
            item.style.backgroundColor = '#f0f7ff';
            
            // Here you could implement showing the full email or redirecting to the email
            console.log('Email clicked:', item.dataset.emailId);
        });
    });
}

// Helper function to format date
function formatDate(date) {
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        // Today: show time
        return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        // This week: show day name
        return date.toLocaleDateString([], {weekday: 'short'});
    } else {
        // Older: show date
        return date.toLocaleDateString([], {month: 'short', day: 'numeric'});
    }
}