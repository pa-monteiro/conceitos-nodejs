const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user){
    return response.status(400).json({error: "User not found."})
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const existsUsers = users.some(user => user.username === username);

  if(existsUsers){
    return response.status(400).json({error: "Users already exists."})
  }
  const object = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  
  users.push(object);

  return response.status(201).json(object);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const object = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date()
  }
  
  user.todos.push(object)
  return response.status(201).json(object);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;

  const findTodo = user.todos.find(todo => todo.id === id);
  if(!findTodo){
    return response.status(404).json({error: "Todo not found."})
  }

  findTodo.title = title;
  findTodo.deadline = new Date(deadline);

  return response.status(201).json(findTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params

  const findTodo = user.todos.find(todo => todo.id === id);
  if(!findTodo){
    return response.status(404).json({error: "Todo not found."})
  }

  findTodo.done = true;

  return response.status(200).json(findTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);
  if(!todo){
    return response.status(404).json({error: "Not found."})
  }
  user.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;