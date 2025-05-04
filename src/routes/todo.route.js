const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todo.controller');

router.post('/', todoController.createTodo);
router.get('/user/:user_id', todoController.getTodosByUserId);
router.get('/:todo_id', todoController.getTodoById);
router.put('/', todoController.updateTodo);
router.delete('/:todo_id', todoController.deleteTodo);

module.exports = router;
