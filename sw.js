// sw.js - Service Worker for Prayer Time Notifications

let prayerTimesData = null;
let notificationsEnabled = false;
let scheduledTimeouts = []; // Store timeout IDs

// Function to clear existing scheduled notifications
function cancelNotifications() {
    console.log('[SW] Cancelling scheduled notifications...');
    scheduledTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    scheduledTimeouts = [];
}

// Function to schedule notifications for the next 24-48 hours
function scheduleNotifications() {
    cancelNotifications(); // Clear any old schedules first

    if (!notificationsEnabled || !prayerTimesData) {
        console.log('[SW] Scheduling cancelled (Notifications disabled or no prayer times data)');
        return;
    }

    console.log('[SW] Scheduling notifications...');
    const prayersToNotify = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const now = new Date();
    let scheduledCount = 0;

    // Check today and tomorrow
    for (let dayOffset = 0; dayOffset <= 1; dayOffset++) {
        const checkDate = new Date(now);
        checkDate.setDate(now.getDate() + dayOffset);
        const month = String(checkDate.getMonth() + 1);
        const day = String(checkDate.getDate());

        if (prayerTimesData[month] && prayerTimesData[month][day]) {
            const timings = prayerTimesData[month][day];
            const dateStr = `<span class="math-inline">\{checkDate\.getFullYear\(\)\}\-</span>{String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            for (const prayerKey in timings) {
                // Convert JSON key (lowercase) to match prayersToNotify (TitleCase) if needed
                const prayerNameProperCase = prayerKey.charAt(0).toUpperCase() + prayerKey.slice(1);

                if (prayersToNotify.includes(prayerNameProperCase) && timings[prayerKey]) {
                    const timeStr = timings[prayerKey]; // e.g., "17:01"
                     const [hours, minutes] = timeStr.split(':').map(Number);

                     if (!isNaN(hours) && !isNaN(minutes)) {
                        const prayerDateTime = new Date(`<span class="math-inline">\{dateStr\}T</span>{timeStr}:00`);

                         // Calculate delay - ensure time is in the future
                         const delay = prayerDateTime.getTime() - now.getTime();

                         if (delay > 0) {
                            // Schedule notification 1 minute before? (Optional)
                            // const notifyDelay = delay > 60000 ? delay - 60000 : delay;
                            const notifyDelay = delay; // Notify exactly on time for now

                            const timeoutId = setTimeout(() => {
                                showNotification(prayerNameProperCase, timeStr);
                                // Remove this specific timeout ID from the array after it fires
                                scheduledTimeouts = scheduledTimeouts.filter(id => id !== timeoutId);
                                // Optional: Reschedule automatically after the last prayer?
                                // if (prayerNameProperCase === 'Isha' && scheduledTimeouts.length === 0) {
                                //     console.log('[SW] Last prayer notification sent, rescheduling for next day.');
                                //     setTimeout(scheduleNotifications, 5000); // Reschedule after 5 seconds
                                // }
                            }, notifyDelay);

                            scheduledTimeouts.push(timeoutId);
                            scheduledCount++;
                            // console.log(`[SW] Scheduled: ${prayerNameProperCase} at ${prayerDateTime.toLocaleString()} (Delay: ${Math.round(notifyDelay / 1000)}s)`);
                         }
                     }
                }
            }
        }
    }

    console.log(`[SW] Scheduling complete. ${scheduledCount} notifications scheduled.`);

    // Schedule a re-check/reschedule after the last potential prayer (e.g., 1 hour after Isha)
    // Or simply rely on activate/message events to keep it updated.
    // For robustness, let's schedule a daily re-check around Fajr time + offset
     scheduleDailyRescheduler();
}

// sw.js

// ... (الكود السابق في الملف) ...

function scheduleDailyRescheduler() {
    // Cancel any previous reschedule timer to avoid duplicates
    // (You might need a specific way to track the reschedule timeout ID if needed)
    // For simplicity, we assume the main cancelNotifications clears all timeouts,
    // or we rely on this running infrequently enough not to cause issues.

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1); // Get tomorrow's date

    // --- CHANGE THIS LINE ---
    // Set time to exactly midnight (00 hours, 00 minutes, 00 seconds, 00 ms) for the start of tomorrow
    tomorrow.setHours(0, 0, 0, 0);
    // --- END CHANGE ---


    const delay = tomorrow.getTime() - now.getTime(); // Calculate delay until midnight tomorrow

    if (delay > 0) {
       // Use a variable specific to the reschedule timeout if you need to cancel it independently later
       const rescheduleTimeoutId = setTimeout(() => {
            console.log("[SW] Daily rescheduler triggered at midnight.");
            // Rerun the main scheduling logic for the new day
            // Ensure prayerTimesData is available before calling
            if (notificationsEnabled && prayerTimesData) {
                 scheduleNotifications();
            } else {
                 console.log("[SW] Midnight Rescheduler: Cannot run scheduleNotifications (disabled or no data).");
            }
            // Optional: Remove this specific timeout ID if tracked separately
            // scheduledTimeouts = scheduledTimeouts.filter(id => id !== rescheduleTimeoutId);
        }, delay);

        // Optional: Add this ID to the main tracking array if cancelNotifications clears everything
        scheduledTimeouts.push(rescheduleTimeoutId);
         console.log(`[SW] Daily rescheduler set for ${tomorrow.toLocaleString()} (Midnight)`);
    } else {
        // This case should ideally not happen if now is always before midnight
        console.warn("[SW] Could not set daily rescheduler, calculated delay was not positive.");
    }
}


// ... (بقية الكود في ملف sw.js مثل scheduleNotifications, showNotification, event listeners etc.) ...


// Function to display the notification
function showNotification(prayerName, timeStr) {
    if (!notificationsEnabled) return; // Double check

    console.log(`[SW] Showing notification for ${prayerName} at ${timeStr}`);
    const title = `حان الآن وقت صلاة ${prayerName}`;
    const options = {
        body: `الأذان حسب توقيت السالمية - ${formatTime12HourSW(timeStr)}`,
        icon: 'mosque_images/icon-192.png', // Main icon
        badge: 'mosque_images/icon-192.png', // Small icon/badge (optional)
        vibrate: [200, 100, 200], // Optional vibration pattern
        tag: `prayer-notification-<span class="math-inline">\{prayerName\}\-</span>{new Date().toLocaleDateString()}`, // Unique tag per prayer per day
        renotify: true, // Make sound/vibration even if tag exists (optional)
        // actions: [ // Optional buttons
        //   { action: 'dismiss', title: 'إغلاق' },
        // ]
    };

    // Use self.registration.showNotification
    self.registration.showNotification(title, options)
        .catch(err => console.error('[SW] Error showing notification:', err));
}

 // Helper to format time in SW (cannot access DOM functions)
 function formatTime12HourSW(timeString24) {
     if (typeof timeString24 !== 'string') return '--:--';
     const parts = timeString24.split(':');
     if (parts.length !== 2) return '--:--';
     let hour = parseInt(parts[0], 10);
     const minute = parseInt(parts[1], 10);
     if (isNaN(hour) || isNaN(minute)) return '--:--';

     const period = hour >= 12 ? 'م' : 'ص';
     hour = hour % 12;
     if (hour === 0) hour = 12; // Handle midnight/noon

     return `<span class="math-inline">\{hour\}\:</span>{String(minute).padStart(2, '0')} ${period}`;
 }


// --- Service Worker Event Listeners ---

self.addEventListener('install', event => {
    console.log('[SW] Install event');
    // Force the waiting service worker to become the active service worker.
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('[SW] Activate event');
    // Take control of all clients under this service worker's scope immediately.
    event.waitUntil(self.clients.claim());
    // Attempt to schedule notifications on activation if enabled previously
    // Need to potentially request data if not already present
     if (notificationsEnabled && prayerTimesData) {
        scheduleNotifications();
     } else {
        console.log('[SW] Activation: Cannot schedule yet (Notifications disabled or no data)');
     }
});

self.addEventListener('message', event => {
    console.log('[SW] Message received:', event.data);
    if (event.data) {
        switch (event.data.type) {
            case 'SET_PRAYER_TIMES':
                prayerTimesData = event.data.payload;
                console.log('[SW] Prayer times data updated.');
                // If notifications are already enabled, reschedule with new times
                if (notificationsEnabled) {
                    scheduleNotifications();
                }
                break;
            case 'SET_NOTIFICATIONS_ENABLED':
                notificationsEnabled = event.data.payload;
                console.log(`[SW] Notifications enabled status set to: ${notificationsEnabled}`);
                if (notificationsEnabled && prayerTimesData) {
                    scheduleNotifications(); // Schedule if enabled and data exists
                } else if (!notificationsEnabled) {
                    cancelNotifications(); // Cancel if disabled
                }
                // Optional: Send confirmation back to client
                // event.source.postMessage({ type: 'NOTIFICATION_STATUS', message: `SW: Notifications ${notificationsEnabled ? 'enabled' : 'disabled'}` });
                break;
            case 'SCHEDULE_NOTIFICATIONS': // Explicit request to schedule
                 if (notificationsEnabled && prayerTimesData) {
                     scheduleNotifications();
                 }
                 break;
             default:
                 console.log('[SW] Unknown message type received.');
        }
    }
});

// Optional: Listen for notification clicks (if needed later)
// self.addEventListener('notificationclick', event => {
//   console.log('[SW] Notification click Received.', event.notification.tag);
//   event.notification.close();
//   // Add logic here, e.g., open the app
//   event.waitUntil(
//     clients.openWindow('/') // Opens the main page
//   );
// });