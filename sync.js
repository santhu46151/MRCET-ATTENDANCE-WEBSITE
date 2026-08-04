const API_BASE_URL = window.location.origin.includes('file://') || window.location.origin.includes(':5500')
  ? 'http://localhost:3000' 
  : window.location.origin;

// Initialize Synchronization
const token = localStorage.getItem('auth_token');
if (token) {
  initializeSync();
}

async function initializeSync() {
  const syncDot = document.getElementById('sync-dot');
  if (syncDot) {
    syncDot.style.backgroundColor = '#f59e0b'; // yellow for syncing
    syncDot.title = 'Syncing...';
  }

  // Fetch initial data from local Node backend REST API
  try {
    const response = await fetch(`${API_BASE_URL}/api/sync`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });

    if (response.status === 401 || response.status === 403) {
      // Token expired, log out user
      authManager.logout();
      return;
    }

    const data = await response.json();
    if (response.ok) {
      if (data.roster && data.roster.length > 0) {
        window.roster = data.roster;
        localStorage.setItem('attendance_roster', JSON.stringify(data.roster));
      }
      if (data.history) {
        window.attendanceHistory = data.history;
        localStorage.setItem('attendance_history', JSON.stringify(data.history));
      }

      if (syncDot) {
        syncDot.style.backgroundColor = '#10b981'; // green for synced
        syncDot.title = 'Synced to Cloud';
      }

      // Refresh UI representation
      if (typeof window.updateUI === 'function') {
        window.updateUI();
      }
    }
  } catch (err) {
    console.error('Error fetching REST DB sync states:', err);
    if (syncDot) {
      syncDot.style.backgroundColor = '#ef4444'; // red for failed
      syncDot.title = `Sync Error: ${err.message}`;
    }
  }

  // Short-polling interval (every 3 seconds) to emulate real-time sync across devices automatically
  setInterval(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sync`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        let changed = false;

        if (data.roster && JSON.stringify(data.roster) !== localStorage.getItem('attendance_roster')) {
          window.roster = data.roster;
          localStorage.setItem('attendance_roster', JSON.stringify(data.roster));
          changed = true;
        }

        if (data.history && JSON.stringify(data.history) !== localStorage.getItem('attendance_history')) {
          window.attendanceHistory = data.history;
          localStorage.setItem('attendance_history', JSON.stringify(data.history));
          changed = true;
        }

        if (changed && typeof window.updateUI === 'function') {
          window.updateUI();
        }
      }
    } catch (e) {
      console.warn('Interval polling sync failed:', e);
    }
  }, 3000);
}

// Global upload helper called whenever client state is modified
window.uploadStateToCloud = async function(updatedRoster, updatedHistory) {
  const token = localStorage.getItem('auth_token');
  if (!token) return;

  const syncDot = document.getElementById('sync-dot');
  if (syncDot) {
    syncDot.style.backgroundColor = '#f59e0b'; // yellow for syncing
    syncDot.title = 'Syncing changes...';
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ roster: updatedRoster, history: updatedHistory })
    });

    if (response.ok) {
      if (syncDot) {
        syncDot.style.backgroundColor = '#10b981'; // green for synced
        syncDot.title = 'Synced to Cloud';
      }
    } else {
      throw new Error('Failed to update cloud REST database.');
    }
  } catch (err) {
    console.error('REST db save error:', err);
    if (syncDot) {
      syncDot.style.backgroundColor = '#ef4444'; // red for failed
      syncDot.title = `Sync failed: ${err.message}`;
    }
  }
};
