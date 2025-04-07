let timerInterval;
let totalSeconds = 0;
let taskId = 1; 
let userId = 1; 

function updateTimerDisplay() {
  const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const secs = String(totalSeconds % 60).padStart(2, '0');
  document.getElementById('timer').textContent = `${hrs}:${mins}:${secs}`;
}

function startTimer() {
  // Notify backend task has started or resumed
  fetch('/api/task/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task_id: taskId, user_id: userId })
  });

  if (!timerInterval) {
    timerInterval = setInterval(() => {
      totalSeconds++;
      updateTimerDisplay();
    }, 1000);
  }
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;

  // Notify backend about pause
  fetch('/api/task/pause', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task_id: taskId })
  });
}

function submitTask() {
  clearInterval(timerInterval);
  timerInterval = null;

  // Notify backend and send total time
  fetch('/api/task/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task_id: taskId, total_seconds: totalSeconds })
  });
}