const formDOM = document.querySelector('.task-form')
const taskInputDOM = document.querySelector('.task-input')
const formAlertDOM = document.querySelector('.form-alert')
const loadingDOM = document.querySelector('.loading-text')
const tasksDOM = document.querySelector('.tasks')

const cookie = getCookie("token");

let timerInterval;
let totalSeconds = 0;
let currentTaskID = null;

function updateTimerDisplay(taskID) {
  const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const secs = String(totalSeconds % 60).padStart(2, '0');
  const timerElement = document.querySelector(`#timer-${taskID}`);
  if (timerElement) {
    timerElement.textContent = `${hrs}:${mins}:${secs}`;
  }
}

async function startTimer(taskID) {
  if (currentTaskID && currentTaskID !== taskID) {
    await pauseTimer(currentTaskID);
    totalSeconds = 0;
  }

  currentTaskID = taskID;

  try {
    await axios.post('http://localhost:3000/v1/user/startTask', JSON.stringify({ task_id: taskID }), {
      headers: {
        "api-key": "D1QVGGm2cjGad0GgFnxS9Q==",
        "token": cookie,
        "accept-language": "en",
        "Content-Type": "application/json",
      },
    });

    if (!timerInterval) {
      timerInterval = setInterval(() => {
        totalSeconds++;
        // updateTimerDisplay(taskID);
      }, 1000);
    }
    showTasks();
  } catch (error) {
    console.error("Error starting task:", error);
  }
}

async function pauseTimer(taskID) {
  clearInterval(timerInterval);
  timerInterval = null;

  try {
    await axios.post('http://localhost:3000/v1/user/pauseTask', JSON.stringify({ task_id: taskID }), {
      headers: {
        "api-key": "D1QVGGm2cjGad0GgFnxS9Q==",
        "token": cookie,
        "accept-language": "en",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error pausing task:", error);
  }
}

async function submitTask(taskID) {
  clearInterval(timerInterval);
  timerInterval = null;

  try {
    await axios.post('http://localhost:3000/v1/user/submitTask', JSON.stringify({ task_id: taskID, total_seconds: totalSeconds }), {
      headers: {
        "api-key": "D1QVGGm2cjGad0GgFnxS9Q==",
        "token": cookie,
        "accept-language": "en",
        "Content-Type": "application/json",
      },
    });
    currentTaskID = null; // Reset the current task ID
    totalSeconds = 0; // Reset the timer
    showTasks();
  } catch (error) {
    console.error("Error submitting task:", error);
  }
}

// Update the `showTasks` function to include unique IDs for each timer element
const showTasks = async (status = 'all') => {
  loadingDOM.style.visibility = 'visible';
  try {
    const response = await axios.post('http://localhost:3000/v1/user/getTasks', {}, {
      headers: {
        "api-key": "D1QVGGm2cjGad0GgFnxS9Q==",
        "token": cookie,
        "accept-language": "en",
        "Content-Type": "application/json",
      },
    });

    const tasks = response.data.data;
    console.log("task:", tasks);

    if (tasks.length < 1) {
      tasksDOM.innerHTML = '<h5 class="empty-list">No tasks in your list</h5>';
      loadingDOM.style.visibility = 'hidden';
      return;
    }

    let filteredTasks = [];

    if (status === 'all') {
      filteredTasks = tasks;
    } else {
      filteredTasks = tasks.filter((task) => task.status === status);
    }

    if (filteredTasks.length < 1) {
      tasksDOM.innerHTML = `<h5 class="empty-list">No ${status} tasks in your list</h5>`;
      loadingDOM.style.visibility = 'hidden';
      return;
    }

    const allTasks = filteredTasks
      .map((task) => {
        const { status, id: taskID, name, description, start, end, total_time } = task;
        return `
          <div class="single-task">
            <h5><span><i class="far fa-check-circle"></i></span>${name}</h5>
            <p>Description: ${description || 'No description provided'}</p>
            <p>Status: ${status}</p>
            <p>Start: ${start}</p>
            <p>End: ${end}</p>
            <p>Total Time: ${total_time}</p>
            <div id="timer-${taskID}">00:00:00</div>
            <button onclick="startTimer('${taskID}')" ${status === 'completed' ? 'disabled' : ''}>Play</button>
            <button onclick="pauseTimer('${taskID}')" ${status === 'completed' ? 'disabled' : ''}>Pause</button>
            <button onclick="submitTask('${taskID}')" ${status === 'completed' ? 'disabled' : ''}>Submit</button>
            <div class="task-links">
              <!-- edit link -->
              <a href="task.html?id=${taskID}" class="edit-link ${status === 'completed' ? 'disabled-link' : ''}">
                <i class="fas fa-edit"></i>
              </a>
              <!-- delete btn -->
              <button type="button" class="delete-btn" data-id="${taskID}" ${status === 'completed' ? 'disabled' : ''}>
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        `;
      })
      .join('');
    tasksDOM.innerHTML = allTasks;
  } catch (error) {
    console.log(error);
    tasksDOM.innerHTML =
      '<h5 class="empty-list">There was an error, please try later....</h5>';
  }
  loadingDOM.style.visibility = 'hidden';
};

showTasks();

// delete task /api/tasks/:id

tasksDOM.addEventListener('click', async (e) => {
  const el = e.target
  if (el.parentElement.classList.contains('delete-btn')) {
    loadingDOM.style.visibility = 'visible'
    const id = el.parentElement.dataset.id
    console.log("id", id)
    // const cookie = getCookie("token");
    try {
      const response = await axios.post(`http://localhost:3000/v1/user/deleteTask/${id}`, {}, {
        headers: {
          "api-key": "D1QVGGm2cjGad0GgFnxS9Q==",
          "token": cookie,
          "accept-language": "en",
          "Content-Type": "application/json",
        },
      });
      console.log("task:", response)
      showTasks()
      taskInputDOM.value = ''
      formAlertDOM.style.display = 'block'
      formAlertDOM.textContent = `success, task deleted`
      formAlertDOM.classList.add('text-success')
    } catch (error) {
      console.log(error)
      formAlertDOM.style.display = 'block'
      formAlertDOM.innerHTML = `error, please try again`
    }
  }
  loadingDOM.style.visibility = 'hidden'
})

// form
formDOM.addEventListener('submit', async (e) => {
  e.preventDefault()   //priventing from page reload when task is submited
  // const cookie = getCookie("token");

  // Collect form data
  const formData = new FormData(formDOM);
  const taskData = {
    name: formData.get('name'),
    description: formData.get('description'),
    deadline: formData.get('deadline'),
  };

  try {
    console.log("taskData:", taskData)
    const response = await axios.post('http://localhost:3000/v1/user/addTask', JSON.stringify(taskData), {
      headers: {
        "api-key": "D1QVGGm2cjGad0GgFnxS9Q==",
        "token": cookie,
        "accept-language": "en",
        "Content-Type": "application/json",
      },
    });

    console.log("task:", response)


    showTasks()
    taskInputDOM.value = ''
    formAlertDOM.style.display = 'block'
    formAlertDOM.textContent = `success, task added`
    formAlertDOM.classList.add('text-success')
  } catch (error) {
    console.log(error)
    formAlertDOM.style.display = 'block'
    formAlertDOM.innerHTML = `error, please try again`
  }
  setTimeout(() => {
    formAlertDOM.style.display = 'none'
    formAlertDOM.classList.remove('text-success')
  }, 3000)
})

function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for (const c of ca) {
    const trimmedCookie = c.trim();
    if (trimmedCookie.startsWith(name)) {
      return trimmedCookie.substring(name.length, trimmedCookie.length);
    }
  }
  return "";
}