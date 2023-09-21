// const { DomainVerificationOutlined } = require("@mui/icons-material");

/* global axios */
const itemTemplate = document.querySelector("#todo-item-template");
const todoList = document.querySelector("#todos");
const homePage = document.querySelector("#home-page");
const detailPage = document.querySelector("#edit-todo-page");

const addTodoButton = document.querySelector("#todo-add");
const saveTodoButton = document.querySelector("button.save-todo");
const cancelTodoButton = document.querySelector("button.cancel-todo");
const todoDateInput = document.querySelector("#todo-date-input");
const todoMoodInput = document.querySelector("#todo-mood-input");
const todoTagInput = document.querySelector("#todo-tag-input");
const todoDescriptionInput = document.querySelector("#todo-content-input");
const editTodoButton = document.querySelector("button.edit-todo");
const backToHomeButton = document.querySelector("button.back-to-home-page");
const todoDateShow = document.querySelector("#todo-date-show");

const moodFilter = document.querySelector("#filter-mood");
const tagFilter = document.querySelector("#filter-tag");

const instance = axios.create({
  baseURL: "http://localhost:8000/api",
});

async function main() {
  getNowDate();
  detailPage.style.display = "none";
  setupEventListeners();
  try {
    const todos = await getTodos();
    todos.forEach((todo) => renderTodo(todo));
  } catch (error) {
    alert("Failed to load todos!");
  }
}

function inputsEnabled() {
  todoTagInput.disabled = false;
  todoMoodInput.disabled = false;
  todoDescriptionInput.disabled = false;
  return;
}

function inputsDisabled() {
  todoTagInput.disabled = true;
  todoMoodInput.disabled = true;
  todoDescriptionInput.disabled = true;
  todoDateInput.disabled = true;
  return;
}

function inputsInitialization() {
  todoMoodInput.value = "";
  todoTagInput.value = "";
  todoDescriptionInput.value = "";
  todoDescriptionInput.placeholder = "enter your content";
  return;
}

function setupEventListeners() {
  addTodoButton.addEventListener("click", () => {
    console.log("addTodoButton clicked");
    detailPage.dataset.status = "add-new";
    cancelTodoButton.style.display = "initial";
    saveTodoButton.style.display = "initial";
    editTodoButton.style.display = "none";
    todoDateInput.disabled = true;
    inputsInitialization();
    inputsEnabled();
    todoDateShow.innerHTML = getNowDate();
    todoDateShow.dataset.initialValue = getNowDate();
    todoDateInput.style.display="none";
    
    detailPage.style.display = "initial"; // ="block"?
    homePage.style.display = "none";
  });
  saveTodoButton.addEventListener("click", async () => {
    let date = (detailPage.dataset.status === "editing")?todoDateInput.value:getNowDate() ;

    let content = todoDescriptionInput.value;
    let tag = todoTagInput.value;
    let mood = todoMoodInput.value;
    if (detailPage.dataset.status !== "view") {
      if(detailPage.dataset.status!=="add-new"){
        if (!date) {
          if (detailPage.dataset.status === "editing") {
            date = todoDateInput.placeholder;
          } else {
            date = getNowDate();
          }
        } else {
          if (dateChecker(date) === "false") {
            return;
          }
          date = dateChecker(date);
        }
      }
      
      if (!content) {
        if (detailPage.dataset.status === "editing") {
          content = todoDescriptionInput.placeholder;
        } else {
          alert("Please enter diary content!");
          return;
        }
      }
      if (!tag) {
        alert("Please select a tag!");
        return;
      }
      if (!mood) {
        alert("Please enter a mood!");
        console.log(mood);
        return;
      }
      console.log(detailPage.dataset.status);
      try {
        if (detailPage.dataset.status === "add-new") {
          const todo = await createTodo({ date, content, tag, mood });
          renderTodo(todo);
        } else if (detailPage.dataset.status === "editing") {
          const updatedTodo = await updateTodoStatus(detailPage.dataset.id, {
            date,
            content,
            tag,
            mood,
          });
          console.log(updatedTodo);
          const originalTodo = document.getElementById(detailPage.dataset.id);
          console.log("originalTodo: ", originalTodo);
          updateTodoInHomePage(originalTodo, updatedTodo);

          console.log("updated");
        }
      } catch (error) {
        console.log(error);
        alert("Failed to save diary!");
        return;
      }
    }

    // todoDateInput.placeholder = "";
    todoDescriptionInput.placeholder = content;
    todoTagInput.dataset.initialValue = tag;
    todoMoodInput.dataset.initialValue = mood;
    detailPage.dataset.status = "view";
    todoDateShow.innerHTML = date;
    backToHomeButton.style.display = "initial";
    saveTodoButton.style.display = "none";
    cancelTodoButton.style.display = "none";
    inputsDisabled();
    todoDateInput.style.display = "none";

    // detailPage.style.display = "none";
    // homePage.style.display = "initial";
    console.log("after display changed");
  });
  cancelTodoButton.addEventListener("click", () => {
    if (detailPage.dataset.status === "editing") {
      todoDescriptionInput.value = todoDescriptionInput.placeholder;
      todoDateInput.value = todoDateInput.placeholder;
      todoDateShow.innerHTML = todoDateShow.dataset.initialValue;
      todoMoodInput.value = todoMoodInput.dataset.initialValue;
      todoTagInput.value = todoTagInput.dataset.initialValue;
      detailPage.dataset.status = "view";
    } else if (detailPage.dataset.status === "add-new") {
      detailPage.dataset.status = "";

      inputsInitialization();
      todoDateInput.placeholder = "";
      todoDateShow.innerHTML = "";
      detailPage.style.display = "none";
      homePage.style.display = "initial";
    }

    inputsDisabled();
    todoDateInput.style.display = "none";

    backToHomeButton.style.display = "initial";
    cancelTodoButton.style.display = "none";
    saveTodoButton.style.display = "none";
    // detailPage.style.display = "none";
    // homePage.style.display = "initial";
  });
  editTodoButton.addEventListener("click", () => {
    detailPage.dataset.status = "editing";
    backToHomeButton.style.display = "none";
    cancelTodoButton.style.display = "initial";
    saveTodoButton.style.display = "initial";
    inputsEnabled();
    todoDateInput.style.display = "initial";
    todoDateInput.disabled = false;
  });
  backToHomeButton.addEventListener("click", () => {
    // todoDateInput.placeholder = "";
    // todoDescriptionInput.placeholder = "";
    detailPage.dataset.status = "";
    // todoDateShow.innerHTML = "";
    detailPage.style.display = "none";
    homePage.style.display = "initial";
  });
  moodFilter.addEventListener("change", filtered);
  tagFilter.addEventListener("change", filtered);
}

async function deleteTodoElement(id) {
  try {
    await deleteTodoById(id);
  } catch (error) {
    alert("Failed to delete todo!");
  } finally {
    const todo = document.getElementById(id);
    todo.remove();
  }
}

function renderTodo(todo) {
  const item = createTodoElement(todo);
  todoList.appendChild(item);
}

function createTodoElement(todo) {
  const item = itemTemplate.content.cloneNode(true);
  const container = item.querySelector(".todo-item");
  container.id = todo.id;
  console.log(todo);
  //   const checkbox = item.querySelector(`input[type="checkbox"]`);
  //   checkbox.checked = todo.completed;
  //   checkbox.dataset.id = todo.id;
  const date = item.querySelector("div.todo-date");
  console.log(date);
  date.innerText = todo.date;
  const content = item.querySelector("p.todo-content");
  content.innerText = todo.content;
  const tag = item.querySelector("div.todo-tag");
  tag.innerText = todo.tag;
  const mood = item.querySelector("div.todo-mood");
  mood.innerText = todo.mood;
  const deleteButton = item.querySelector("button.delete-todo");
  deleteButton.dataset.id = todo.id;
  deleteButton.addEventListener("click", () => {
    event.stopPropagation();
    deleteTodoElement(todo.id);
  });
  container.addEventListener("click", () => {
    TodoClicked(todo.id);
  });
  return item;
}

async function getTodos() {
  const response = await instance.get("/todos");
  return response.data;
}

async function getTodo(todoId) {
  const response = await instance.get(`/todos/${todoId}`);
  return response.data;
}

async function createTodo(todo) {
  const response = await instance.post("/todos", todo);
  return response.data;
}

// eslint-disable-next-line no-unused-vars
async function updateTodoStatus(id, todo) {
  const response = await instance.put(`/todos/${id}`, todo);
  return response.data;
}

async function deleteTodoById(id) {
  const response = await instance.delete(`/todos/${id}`);
  return response.data;
}

async function TodoClicked(todoId) {
  console.log("todoClicked");
  try {
    const todo = await getTodo(todoId);
    detailPage.dataset.status = "view";
    const inputs = detailPage.querySelectorAll("input");
    console.log("inputs = ", inputs);
    for (let input of inputs) {
      input.disabled = "disabled";
    }
    // set initial input value
    detailPage.dataset.id = todo.id;
    todoDateInput.placeholder = todo.date;
    todoMoodInput.value = todo.mood;
    todoTagInput.value = todo.tag;
    todoMoodInput.dataset.initialValue = todo.mood;
    todoTagInput.dataset.initialValue = todo.tag;
    todoDescriptionInput.placeholder = todo.content;
    todoDateShow.innerHTML = todo.date;
    todoDateShow.dataset.initialValue = todo.date;

    document.querySelector("button.cancel-todo").style.display = "none";
    document.querySelector("button.save-todo").style.display = "none";

    inputsDisabled();
    todoDateInput.style.display = "none";

    editTodoButton.style.display = "initial";

    homePage.style.display = "none";
    detailPage.style.display = "initial";
  } catch (error) {
    console.log(error);
    alert("Failed to load todos!");
  }
}

function updateTodoInHomePage(oldTodo, newTodo) {
  oldTodo.querySelector("div.todo-date").innerText = newTodo.date;
  oldTodo.querySelector("p.todo-content").innerText = newTodo.content;
  oldTodo.querySelector("div.todo-tag").innerText = newTodo.tag;
  oldTodo.querySelector("div.todo-mood").innerText = newTodo.mood;
  return;
}

function filtered() {
  const tagInput = tagFilter.value;
  const moodInput = moodFilter.value;
  const todos = homePage.querySelectorAll("div.todo-item");
  console.log(todos);
  console.log("tage input = ", tagInput);
  if (tagInput === "no-filter") {
    if (moodInput === "no-filter")
      for (let todo of todos) {
        todo.style.display = "initial";
      }
    else {
      Array.from(todos).map((todo) => {
        if (todo.querySelector(".todo-mood").innerText !== moodInput) {
          todo.style.display = "none";
        } else {
          todo.style.display = "initial";
        }
      });
    }
  } else {
    if (moodInput === "no-filter") {
      Array.from(todos).map((todo) => {
        if (todo.querySelector(".todo-tag").innerText !== tagInput) {
          todo.style.display = "none";
        } else {
          todo.style.display = "initial";
        }
      });
    } else {
      Array.from(todos).map((todo) => {
        if (
          todo.querySelector(".todo-mood").innerText !== moodInput ||
          todo.querySelector(".todo-tag").innerText !== tagInput
        ) {
          todo.style.display = "none";
        } else {
          todo.style.display = "initial";
        }
      });
    }
  }
}

function dateChecker(dateInput) {
  let dayNumbers = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const dayInWeek=["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  if (dateInput.length !== 10) {
    alert("length of date not correct!");
    return "false";
  }
  for (let i = 0; i < 10; i++) {
    if (
      parseInt(
        dateInput[i].charCodeAt() < 48 ||
          parseInt(dateInput[i].charCodeAt() > 57),
      ) &&
      (i !== 4 || i !== 7)
    ) {
      alert("format of date not correct!");
      return "false";
    }
  }
  const year = parseInt(dateInput.substring(0, 4));
  const month = parseInt(dateInput.substring(5, 7));
  const date = parseInt(dateInput.substring(8, 10));
  if (year % 4 == 0 && (year % 100 !== 0 || year % 400 == 0))
    dayNumbers[2] = 29;
  if (month > 12 || month < 1) {
    alert("month not valid");
    return "false";
  }
  if (date > dayNumbers[month] || date < 1) {
    alert("date not valid");
    return "false";
  }
  dateInput[4]="-";
  dateInput[7]="-";
  const editedTime = new Date(year, month-1, date);
  console.log("editedTime.getDay()", editedTime.getDay(),dayInWeek[editedTime.getDay()]);
  dateInput = dateInput.concat("(", dayInWeek[editedTime.getDay()], ')');
  console.log("new date Input", dateInput);
  return dateInput;
}

function getNowDate() {
  const nowTime = new Date();
  const dayInWeek=["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  let month = "" + (nowTime.getMonth() + 1);
  let day = "" + nowTime.getDate();
  let year = nowTime.getFullYear();
  let date = "";

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;
  date = dayInWeek[nowTime.getDay()];
  console.log([year, month, day].join(".") + "(" + date + ")");
  return [year, month, day].join(".") + "(" + date + ")";
}

main();
