function addTodo() {
  const title = document.getElementById('todoInput').value;

  fetch('http://localhost:8080/api/todos/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: title }),
  })
    .then((response) =>
      response.json().then((data) => {
        if (!response.ok) {
          handleError(response.status, data);
          throw new Error('Request failed with status ' + response.status);
        }
        return data;
      })
    )
    .then((newTodo) => {
      addTodoToUI(newTodo);
      document.getElementById('todoInput').value = '';
      document.getElementById('todoInput').focus();
    })
    .catch((error) => {
      console.error(error);
    });
}

function handleError(status, data) {
  if (status === 400) {
    alert(data.message || 'Validation error');
  } else {
    console.error('Network response was not ok');
  }
}

function fetchTodos() {
  fetch('http://localhost:8080/api/todos/items', {
    method: 'GET',
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }
      return response.json();
    })
    .then((allItems) => {
      allItems.forEach((item) => addTodoToUI(item));
    })
    .catch((error) => console.error('Error:', error));
}

function deleteTodo(todoId) {
  fetch(`http://localhost:8080/api/todos/items/${todoId}`, {
    method: 'DELETE',
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          throw new Error(error.message);
        });
      }
      removeTodoFromUI(todoId);
    })
    .catch((error) => {
      console.error(error);
    });
}

function editTodo(todoId) {
  const todoItem = document.getElementById(`todo-${todoId}`);
  const todoTitleElement = todoItem.querySelector('.content-container span');
  const currentTitle = todoTitleElement.textContent;

  const newTitle = prompt('Edit the title of the todo', currentTitle);

  fetch(`http://localhost:8080/api/todos/items/${todoId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: newTitle }),
  })
    .then((response) =>
      response.json().then((data) => {
        if (!response.ok) {
          handleError(response.status, data);
          throw new Error('Request failed with status ' + response.status);
        }
        return data;
      })
    )
    .then((updatedTodo) => {
      updateTodoInUI(todoId, updatedTodo);
    })
    .catch((error) => console.error(error));
}

function toggleTodoCompletion(todoId) {
  fetch(`http://localhost:8080/api/todos/items/complete/${todoId}`, {
    method: 'PUT',
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to toggle completion status');
      }
      return response.json();
    })
    .then((updatedTodo) => {
      const todoItem = document.getElementById(`todo-${todoId}`);
      todoItem.className = updatedTodo.completed ? 'completed' : '';
    })
    .catch((error) => console.error('Error:', error));
}

function toggleTodoChecked(todoId, event) {
  event.stopPropagation();
  fetch(`http://localhost:8080/api/todos/items/check/${todoId}`, {
    method: 'PUT',
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to toggle checked status');
      }
      return response.json();
    })
    .then((updatedTodo) => {
      const starButton = document.querySelector(`#todo-${todoId} .star-button`);
      if (starButton) {
        starButton.innerHTML = updatedTodo.checked ? '★' : '☆';
        starButton.classList.toggle('checked', updatedTodo.checked);
      }
    })
    .catch((error) => console.error('Error:', error));
}

function removeTodoFromUI(todoId) {
  const todoItem = document.getElementById(`todo-${todoId}`);
  if (todoItem) {
    todoItem.remove();
  }
}

function createStarButtonContainer(todo) {
  const container = document.createElement('div');
  container.classList.add('star-button-container');

  const starButton = document.createElement('button');
  starButton.innerHTML = todo.checked ? '★' : '☆';
  starButton.classList.add('star-button');
  starButton.onclick = () => toggleTodoChecked(todo.id, event);

  container.appendChild(starButton);
  return container;
}

function createContentContainer(todo) {
  const container = document.createElement('div');
  container.classList.add('content-container');

  const todoTitle = document.createElement('span');
  todoTitle.textContent = todo.title;
  container.appendChild(todoTitle);

  container.appendChild(createButton('Edit', () => editTodo(todo.id)));
  container.appendChild(createButton('Delete', () => deleteTodo(todo.id)));

  return container;
}

function createButton(text, onClick) {
  const button = document.createElement('button');
  button.textContent = text;
  button.onclick = onClick;
  return button;
}

function addTodoToUI(todo) {
  const todoList = document.getElementById('todoList');
  const todoItem = document.createElement('li');
  todoItem.id = `todo-${todo.id}`;
  todoItem.className = todo.completed ? 'completed' : '';
  todoItem.classList.add('todo-item');

  todoItem.onclick = () => toggleTodoCompletion(todo.id);

  const starButtonContainer = createStarButtonContainer(todo);
  const contentContainer = createContentContainer(todo);

  todoItem.appendChild(starButtonContainer);
  todoItem.appendChild(contentContainer);

  if (todoList.firstChild) {
    todoList.insertBefore(todoItem, todoList.firstChild);
  } else {
    todoList.appendChild(todoItem);
  }
}

function updateTodoInUI(todoId, updatedTodo) {
  const todoItem = document.getElementById(`todo-${todoId}`);
  if (todoItem) {
    todoItem.innerHTML = '';
    todoItem.className = updatedTodo.completed ? 'completed' : '';
    todoItem.classList.add('todo-item');

    const starButtonContainer = createStarButtonContainer(updatedTodo);
    const contentContainer = createContentContainer(updatedTodo);

    todoItem.appendChild(starButtonContainer);
    todoItem.appendChild(contentContainer);
  }
}
