const taskIDDOM = document.querySelector('.task-edit-id')
const taskNameDOM = document.querySelector('.task-edit-name')
const taskCompletedDOM = document.querySelector('.task-edit-completed')
const editFormDOM = document.querySelector('.single-task-form')
const editBtnDOM = document.querySelector('.task-edit-btn')
const formAlertDOM = document.querySelector('.form-alert')
const params = window.location.search
const id = new URLSearchParams(params).get('id')
let tempName
const cookie = getCookie("token");

const showTask = async () => {
  try {
    const {
      data: { task },
    } = await axios.post(`http://localhost:3000/v1/user/tasks/${id}`,{}, {
      headers: {
        "api-key": "D1QVGGm2cjGad0GgFnxS9Q==",
        "token": cookie,
        "accept-language": "en",
        "Content-Type": "application/json",
      },
    })
    const { _id: taskID, completed, name } = task

    taskIDDOM.textContent = taskID  //to add ID in <p> tag
    taskNameDOM.value = name        //to add name in <input> tag
    tempName = name
    if (completed) {
      taskCompletedDOM.checked = true
    }
  } catch (error) {
    console.log(error)
  }
}

showTask()

editFormDOM.addEventListener('submit', async (e) => {
  editBtnDOM.textContent = 'Loading...'
  e.preventDefault()
  try {
    const taskName = taskNameDOM.value
    const taskCompleted = taskCompletedDOM.checked

    const {
      data: { task },
    } = await axios.patch(`/api/v1/tasks/${id}`, {
      name: taskName,
      completed: taskCompleted,  //we are sending this data, and recived response will be stored in var "task"
    })

    const { _id: taskID, completed, name } = task

    taskIDDOM.textContent = taskID
    taskNameDOM.value = name
    tempName = name
    if (completed) {
      taskCompletedDOM.checked = true
    }
    formAlertDOM.style.display = 'block'
    formAlertDOM.textContent = `success, edited task`
    formAlertDOM.classList.add('text-success')
  } catch (error) {
    console.error(error)
    taskNameDOM.value = tempName
    formAlertDOM.style.display = 'block'
    formAlertDOM.innerHTML = `error, please try again`
  }
  editBtnDOM.textContent = 'Edit'
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