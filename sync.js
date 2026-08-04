// Static offline mode - server synchronizations and intervals removed.
document.addEventListener('DOMContentLoaded', () => {
  const syncDot = document.getElementById('sync-dot');
  if (syncDot) {
    syncDot.style.backgroundColor = '#10b981'; // green to represent offline-local storage active
    syncDot.title = 'Offline Storage Mode';
  }
});
