const db = require('../database/pg.database');

exports.createTodo = async (todo) => {
    const res = await db.query(
        `INSERT INTO todos (user_id, title, description, priority, due_date)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [todo.user_id, todo.title, todo.description, todo.priority, todo.due_date]
    );
    return res.rows[0];
};

exports.getTodosByUserId = async (user_id) => {
    const res = await db.query(
        `SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at DESC`,
        [user_id]
    );
    return res.rows;
};

exports.getTodoById = async (todo_id) => {
    const res = await db.query(
        `SELECT * FROM todos WHERE todo_id = $1`,
        [todo_id]
    );
    return res.rows[0];
};

exports.updateTodo = async (todo) => {
    const res = await db.query(
        `UPDATE todos
         SET title = $2, description = $3, status = $4, priority = $5, due_date = $6, updated_at = CURRENT_TIMESTAMP
         WHERE todo_id = $1
         RETURNING *`,
        [todo.todo_id, todo.title, todo.description, todo.status, todo.priority, todo.due_date]
    );
    return res.rows[0];
};

exports.deleteTodo = async (todo_id) => {
    const res = await db.query(
        `DELETE FROM todos WHERE todo_id = $1 RETURNING *`,
        [todo_id]
    );
    return res.rows[0];
};
