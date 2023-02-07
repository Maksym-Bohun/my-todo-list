"use strict";

const addTodoBtn = document.querySelector(".add-todo-btn");
const addReminderBtn = document.querySelector(".add-reminder-btn");
const closeBtns = document.querySelectorAll(".close-btn");
const addTodoBlock = document.querySelector(".add-todo");
const addReminderBlock = document.querySelector(".add-reminder");
const todoBlocks = document.querySelectorAll(".todo");
const todoList = document.querySelector(".todo-list");
const submitBtn = document.querySelector(".submit-btn");
const submitReminderBtn = document.querySelector(".submit-reminder-btn");
const overlay = document.querySelector(".overlay");
const removeNotBtn = document.querySelector(".notification-btn");
const deadlineWarningIcon = document.querySelector(".deadline-warning-icon");
const taskWarningIcon = document.querySelector(".task-warning-icon");
const closeReminderBtn = document.querySelector(".reminder-close-btn");
let audioInterval, audio, timeout, deadlineTimeout;

let generalArray = [];
let todoArray = [];
let remindersArray = [];

const getMonthName = function (monthNumber) {
  const date = new Date();
  date.setMonth(Number(monthNumber) - 1);

  return date.toLocaleString("en-US", { month: "short" });
};

class Todo {
  constructor(task, deadline, type, count) {
    this.task = task;
    this.deadline = this.convertDate(deadline);
    this.type = type;
    this.count;
  }

  convertDate(deadline) {
    const [deadlineDate, deadlineTime] = [
      deadline.split("T")[0],
      deadline.split("T")[1],
    ];

    const [deadlineYear, deadlineMonth, deadlineDay] = [
      deadlineDate.split("-")[0],
      deadlineDate.split("-")[1],
      deadlineDate.split("-")[2],
    ];

    return `${getMonthName(
      deadlineMonth
    )} ${deadlineDay} ${deadlineYear} ${deadlineTime}`;
  }
}

const validValues = function (arrayType) {
  const taskInput = document.querySelector(
    `${arrayType == todoArray ? ".task-input" : ".event-input"}`
  ).value;
  const deadlineInput = document.querySelector(
    `${arrayType === todoArray ? ".date-time-input" : ".event-time-input"}`
  ).value;
  if (taskInput && deadlineInput && calculateSeconds(deadlineInput) > 0) {
    return true;
  }
};

const getValues = function (arrayType) {
  const taskInput = document.querySelector(
    `${arrayType == todoArray ? ".task-input" : ".event-input"}`
  );
  const deadlineInput = document.querySelector(
    `${arrayType === todoArray ? ".date-time-input" : ".event-time-input"}`
  );
  if (validValues(arrayType)) {
    generalArray.push(
      new Todo(
        taskInput.value,
        deadlineInput.value,
        `${arrayType === todoArray ? "todo" : "reminder"}`
      )
    );
    distributeTodos();
    clearInputs();
    return true;
  } else {
    if (!taskInput.value && calculateSeconds(deadlineInput.value) > 0) {
      taskWarningIcon.classList.remove("hidden");
      taskInput.classList.add("warning");
      return false;
    } else if (
      (taskInput.value && !deadlineInput.value) ||
      calculateSeconds(deadlineInput.value) < 0
    ) {
      deadlineWarningIcon.classList.remove("hidden");
      deadlineInput.classList.add("warning");
      return false;
    } else {
      taskWarningIcon.classList.remove("hidden");
      taskInput.classList.add("warning");
      deadlineWarningIcon.classList.remove("hidden");
      deadlineInput.classList.add("warning");
      return false;
    }
  }
};

////// Event Listeners //////

document.addEventListener("click", (e) => {
  if (e.target.closest(".close-btn")) {
    e.target.closest(".todo").classList.add("hidden");
    generalArray.splice(e.target.closest(".todo").dataset.id, 1);
    clearInputs();
  }
});

document.addEventListener("click", (e) => {
  if (e.target.closest(".reminder-close-btn")) {
    const num = e.target.closest(".reminder").dataset.id;
    let temp;
    remindersArray.forEach((todo, i) => {
      if (todo.count === num) {
        temp = i;
      }
    });
    remindersArray.splice(temp, 1);
    generalArray.splice(num, 1);
    if (temp) remindersArray.splice(temp, 1);
    updateTodoList();
    deactivateReminder();
  }
});

addTodoBtn.addEventListener("click", (e) => {
  if (
    !addReminderBlock.classList.contains("hidden") &&
    !addReminderBlock.classList.contains("todo-hidden")
  ) {
    addReminderBlock.classList.add("todo-hidden");
    setTimeout(() => {
      addReminderBlock.classList.add("hidden");
      addTodoBlock.classList.remove("hidden");
      addTodoBlock.classList.remove("todo-hidden");
    }, 300);
  } else {
    addTodoBlock.classList.remove("hidden");
    addTodoBlock.classList.remove("todo-hidden");
  }
});

addReminderBtn.addEventListener("click", () => {
  if (
    !addTodoBlock.classList.contains("hidden") &&
    !addTodoBlock.classList.contains("todo-hidden")
  ) {
    addTodoBlock.classList.add("todo-hidden");
    setTimeout(() => {
      addTodoBlock.classList.add("hidden");
      addReminderBlock.classList.remove("hidden");
      addReminderBlock.classList.remove("todo-hidden");
    }, 300);
  } else {
    addReminderBlock.classList.remove("hidden");
    addReminderBlock.classList.remove("todo-hidden");
  }
});

submitBtn.addEventListener("click", () => {
  if (getValues(todoArray)) {
    addTodoBlock.classList.add("todo-hidden");
    setTimeout(() => {
      addTodoBlock.classList.add("hidden");
    }, 300);

    displayTodos();
    updateTodoList();
  }
});

submitReminderBtn.addEventListener("click", () => {
  if (getValues(remindersArray)) {
    addReminderBlock.classList.add("todo-hidden");
    setTimeout(() => {
      addReminderBlock.classList.add("hidden");
    }, 300);
    updateTodoList();
  }
});

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("checker")) {
    const checker = document.querySelector(".checker");
    checker.classList.add("checker-filled");
    console.log(e.target.closest(".todo"));
    let temp1, temp2;
    todoArray.forEach((todo, i) => {
      if (todo.count === e.target.closest(".todo").dataset.id) {
        temp1 = i;
      }
    });
    generalArray.forEach((todo, i) => {
      if (todo.count === e.target.closest(".todo").dataset.id) {
        temp2 = i;
      }
    });
    todoArray.splice(temp1, 1);
    generalArray.splice(temp2, 1);
    setTimeout(() => {
      e.target.closest(".todo").classList.add("completed-todo");
    }, 1000);
    setTimeout(() => {
      e.target.closest(".todo").classList.add("hidden");
    }, 2000);
  }
});

//////// Hover listener  ////////
{
  document.addEventListener("mouseover", (e) => {
    if (e.target && e.target.closest(".current-todo")) {
      const todoTarget = e.target.closest(".current-todo");
      todoTarget.classList.add("todo-active");
      if (todoTarget.classList.contains("todo-active")) {
        const children = todoTarget.children;
        children[children.length - 1].classList.remove("hidden");
      }
    }
  });

  document.addEventListener("mouseout", (e) => {
    if (e.target && e.target.closest(".current-todo")) {
      const todoTarget = e.target.closest(".current-todo");
      todoTarget.classList.remove("todo-active");
      const children = todoTarget.children;
      children[children.length - 1].classList.add("hidden");
    }
  });
}
/////////////////////////////////////////////

const displayTodos = function () {
  todoList.innerHTML = "";
  generalArray.forEach((todo, i) => {
    let html;
    if (todo.type === "todo") {
      html = `
    <div data-id="${todo.count}" class="current-todo todo todo--${todo.count}">
    <div class="checker ">&nbsp;</div>
        <p>${todo.task}</p>
          
        <div class="todo-deadline">
        <p class="details-header">Deadline</p>
        <p class="date">${todo.deadline}</p>
        </div>
        
        <div class="close-btn hidden">
            <img src="icons/x-circle.svg" />
          </div>
        </div>
    `;
    }

    if (todo.type === "reminder") {
      html = `
      <div data-id="${todo.count}" class="current-todo todo reminder todo--${
        todo.count
      }">
          <p class='reminder-event'>${todo.task}</p>
            
          <div class="todo-deadline">
          <p class="details-header">${todo.deadline.slice(0, -5)}</p>
          <p class="date">${todo.deadline.slice(-5)}</p>
          </div>
          
          <div class="reminder-close-btn hidden">
            <img src="icons/x-circle.svg" />
          </div>
          </div>
      `;
    }
    todoList.insertAdjacentHTML("afterbegin", html);
  });
};

const calculateSeconds = function (cur) {
  const now = new Date();
  return new Date(cur).getTime() - now.getTime();
};

const checkDeadline = function () {
  todoArray.map((cur, i) => {
    if (calculateSeconds(cur.deadline) <= 0) {
      document.querySelector(`.todo--${i}`).children[2].classList.add("late");
    }
  });
};

const updateTodoList = function () {
  clearTimeout(deadlineTimeout);
  clearTimeout(timeout);
  distributeTodos();

  todoArray.forEach((todo) => {
    deadlineTimeout = setTimeout(() => {
      checkDeadline();
    }, calculateSeconds(todo.deadline));
  });

  remindersArray.forEach((reminder) => {
    if (calculateSeconds(reminder.deadline) > 0) {
      timeout = setTimeout(() => {
        activateReminder();
      }, calculateSeconds(reminder.deadline));
    }
  });
  displayTodos();

  if (
    (generalArray.length > 3 &&
      addTodoBlock.classList.contains(".hidden") &&
      addReminderBlock.classList.contains(".hidden")) ||
    (generalArray.length > 2 &&
      (!addTodoBlock.classList.contains(".hidden") ||
        addReminderBlock.classList.contains(".hidden")))
  )
    todoList.classList.add("scroll-list");

  taskWarningIcon.classList.add("hidden");
  deadlineWarningIcon.classList.add("hidden");
  document.querySelector(".date-time-input").classList.remove("warning");
  document.querySelector(".event-time-input").classList.remove("warning");
  document.querySelector(".task-input").classList.remove("warning");
  document.querySelector(".event-input").classList.remove("warning");
};

const activateReminder = function () {
  console.log("Reminder activated");
  audio = new Audio("reflection.mp3");
  overlay.classList.remove("hidden");
  audio.play();
  audioInterval = setInterval(() => {
    audio.play();
  }, 4500);
};

const deactivateReminder = function () {
  updateTodoList();
  clearInterval(audioInterval);
  clearTimeout(timeout);
  if (audio) audio.pause();
  overlay.classList.add("hidden");
  generalArray.forEach((reminder) => {
    if (
      reminder.type === "reminder" &&
      calculateSeconds(reminder.deadline) <= 0
    ) {
      generalArray.splice(reminder.count, 1);
    }
    updateTodoList();
  });

  remindersArray.forEach((reminder, i) => {
    if (calculateSeconds(reminder.deadline) <= 0) {
      remindersArray.splice(i, 1);
    }
  });
  console.log("Reminder DEactivated");
  console.log(remindersArray);
  console.log(generalArray);
  updateTodoList();
};

const clearInputs = function () {
  document.querySelector(".task-input").value = "";
  document.querySelector(".date-time-input").value = "";
  document.querySelector(".event-input").value = "";
  document.querySelector(".event-time-input").value = "";
};

removeNotBtn.addEventListener("click", deactivateReminder);

const distributeTodos = function () {
  generalArray.forEach((todo, i) => {
    todo.count = i;
    if (todo.type === "reminder" && !remindersArray.includes(todo)) {
      remindersArray.push(todo);
      console.log(todo);
    }

    if (todo.type === "todo" && !todoArray.includes(todo)) {
      todoArray.push(todo);
      console.log(todo);
    }
  });
};
