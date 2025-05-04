const todoRepository = require('../repositories/todo.repository');
const baseResponse = require('../utils/baseResponse.util');

exports.createTodo = async (req, res, next) => {
    try {
        const { user_id, title, description, priority, due_date } = req.body;

        if (!user_id || !title) {
            return baseResponse(res, false, 400, "Missing user_id or title", null);
        }

        const todo = await todoRepository.createTodo({ user_id, title, description, priority, due_date });
        return baseResponse(res, true, 201, "Todo created", todo);
    } catch (error) {
        next(error);
    }
};

exports.getTodosByUserId = async (req, res, next) => {
    try {
        const todos = await todoRepository.getTodosByUserId(req.params.user_id);
        return baseResponse(res, true, 200, "Todos fetched", todos);
    } catch (error) {
        next(error);
    }
};

exports.getTodoById = async (req, res, next) => {
    try {
        const todo = await todoRepository.getTodoById(req.params.todo_id);
        if (todo) {
            return baseResponse(res, true, 200, "Todo found", todo);
        } else {
            return baseResponse(res, false, 404, "Todo not found", null);
        }
    } catch (error) {
        next(error);
    }
};

exports.updateTodo = async (req, res, next) => {
    try {
        const { todo_id, title, description, status, priority, due_date } = req.body;

        if (!todo_id) {
            return baseResponse(res, false, 400, "Missing todo_id", null);
        }

        const todo = await todoRepository.updateTodo({ todo_id, title, description, status, priority, due_date });
        if (todo) {
            return baseResponse(res, true, 200, "Todo updated", todo);
        } else {
            return baseResponse(res, false, 404, "Todo not found", null);
        }
    } catch (error) {
        next(error);
    }
};

exports.deleteTodo = async (req, res, next) => {
    try {
        const todo = await todoRepository.deleteTodo(req.params.todo_id);
        if (todo) {
            return baseResponse(res, true, 200, "Todo deleted", todo);
        } else {
            return baseResponse(res, false, 404, "Todo not found", null);
        }
    } catch (error) {
        next(error);
    }
};
