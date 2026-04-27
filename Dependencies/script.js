// DOM Elements
const timeDisplay = document.getElementById('time');
const dateDisplay = document.getElementById('date');
const clockDisplay = document.querySelector('.clock-display');
const statusBadge = document.getElementById('statusBadge');
const statusText = document.getElementById('statusText');
const errorToast = document.getElementById('errorMessage');

// State
let wakeLock = null;
let isLocked = false;

// Initialize App
function init() {
    updateClock();
    setInterval(updateClock, 1000);
    
    // Setup event listeners
    statusBadge.addEventListener('click', handleToggle);
    
    // Handle visibility changes (browser tab switching)
    document.addEventListener('visibilitychange', async () => {
        if (wakeLock !== null && document.visibilityState === 'visible') {
            await requestWakeLock();
        }
    });

    // Check API support
    if (!('wakeLock' in navigator)) {
        showError("System error: 0x80040154");
    }
}

// Clock Functionality
function updateClock() {
    const now = new Date();
    
    if (timeDisplay) {
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeDisplay.textContent = `${hours}:${minutes}`;
    }
    
    if (dateDisplay) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateDisplay.textContent = now.toLocaleDateString(undefined, options);
    }
}

// Wake Lock Functionality
async function requestWakeLock() {
    try {
        wakeLock = await navigator.wakeLock.request('screen');
        isLocked = true;
        
        wakeLock.addEventListener('release', () => {
            // When automatically released (e.g. minified)
            if (isLocked) { // We didn't release it manually
                // It will be re-acquired on visibility change
            }
        });
        
        updateUI();
    } catch (err) {
        showError(`Err: ${err.message}`);
    }
}

async function releaseWakeLock() {
    if (wakeLock !== null) {
        await wakeLock.release();
        wakeLock = null;
        isLocked = false;
        updateUI();
    }
}

function handleToggle() {
    if (isLocked) {
        releaseWakeLock();
    } else {
        requestWakeLock();
    }
}

// UI Updates
function updateUI() {
    if (isLocked) {
        // Active State
        statusBadge.classList.add('active');
        statusText.textContent = "Sync Active";
    } else {
        // Inactive State
        statusBadge.classList.remove('active');
        statusText.textContent = "Sync Paused";
    }
}

function showError(message) {
    errorToast.textContent = message;
    errorToast.style.display = 'block';
    
    setTimeout(() => {
        errorToast.style.display = 'none';
    }, 4000);
}

// Start
init();
