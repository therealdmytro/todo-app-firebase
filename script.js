const DB_URL = "https://my-project-f878e-default-rtdb.firebaseio.com";

let todos = [];

const list = document.getElementById('todo-list');
const itemCountSpan = document.getElementById('item-count');
const uncheckedCountSpan = document.getElementById('unchecked-count');

const statusContainer = document.createElement('div');
statusContainer.className = 'my-2 fw-bold';
list.parentNode.insertBefore(statusContainer, list);

function showLoading(isLoading) {
  if (isLoading) {
    statusContainer.textContent = 'Завантаження...';
    statusContainer.className = 'my-2 fw-bold text-primary';
  } else {
    statusContainer.textContent = '';
  }
}

function showError(message) {
  statusContainer.textContent = `Помилка: ${message}`;
  statusContainer.className = 'my-2 fw-bold text-danger';
}

function addTodo(todo) {
  return fetch(`${DB_URL}/todos.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    body: JSON.stringify(todo)
  }).then((response) => {
    if (!response.ok) {
      throw new Error('Не вдалося додати запис');
    }
    return response.json();
  });
}

function getTodos() {
  showLoading(true);
  fetch(`${DB_URL}/todos.json`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Не вдалося завантажити дані з БД');
      }
      return response.json();
    })
    .then((data) => {
      showLoading(false);
      if (data) {
        todos = Object.keys(data).map((key) => ({
          id: key,
          text: data[key].text,
          checked: data[key].checked
        }));
      } else {
        todos = [];
      }
      render(todos);
    })
    .catch((error) => {
      showError(error.message);
    });
}

function newTodo() {
  const taskText = prompt('Введіть назву нового завдання:');

  if (taskText && taskText.trim() !== '') {
    const todoData = {
      text: taskText.trim(),
      checked: false
    };

    showLoading(true);
    addTodo(todoData)
      .then((data) => {
        showLoading(false);
        const newObj = {
          id: data.name,
          text: todoData.text,
          checked: todoData.checked
        };

        todos.push(newObj);
        render(todos);
      })
      .catch((error) => {
        showError(error.message);
      });
  }
}

function renderTodo(todo) {
  return `
    <li class="list-group-item d-flex justify-content-between align-items-center">
      <div>
        <input type="checkbox" class="form-check-input me-2" id="${todo.id}" ${todo.checked ? 'checked' : ''} onChange="checkTodo('${todo.id}')" />
        <label for="${todo.id}">
          <span class="${todo.checked ? 'text-success text-decoration-line-through' : ''}">${todo.text}</span>
        </label>
      </div>
      <button class="btn btn-danger btn-sm" onClick="deleteTodo('${todo.id}')">delete</button>
    </li>
  `;
}

function render(todosArray) {
  const htmlElements = todosArray.map(todo => renderTodo(todo));
  list.innerHTML = htmlElements.join('');
  updateCounter();
}

function updateCounter() {
  const totalCount = todos.length;
  const uncheckedCount = todos.filter(todo => !todo.checked).length;

  itemCountSpan.textContent = totalCount;
  uncheckedCountSpan.textContent = uncheckedCount;
}

function deleteTodo(id) {
  showLoading(true);
  fetch(`${DB_URL}/todos/${id}.json`, {
    method: 'DELETE'
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Не вдалося видалити запис');
      }
      showLoading(false);
      todos = todos.filter(todo => String(todo.id) !== String(id));
      render(todos);
    })
    .catch((error) => {
      showError(error.message);
    });
}

function checkTodo(id) {
  const todo = todos.find(item => String(item.id) === String(id));
  if (!todo) return;

  const updatedChecked = !todo.checked;
  showLoading(true);

  fetch(`${DB_URL}/todos/${id}.json`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    body: JSON.stringify({ checked: updatedChecked })
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Не вдалося оновити статус');
      }
      return response.json();
    })
    .then(() => {
      showLoading(false);
      todo.checked = updatedChecked;
      render(todos);
    })
    .catch((error) => {
      showError(error.message);
    });
}

getTodos();