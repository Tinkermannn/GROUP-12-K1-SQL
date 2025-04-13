const db = require('../database/pg.database');
const bcrypt = require('bcrypt');
const saltRounds = 10;


exports.userRegister = async (user) => {
    try {
        const check = await db.query(`SELECT * FROM users WHERE email = $1`, [user.email]);
        if (check.rows.length > 0) {
            throw new Error("Email already used");
        }
        if (check.rows.length > 0) {
            const err = new Error("Email already used");
            err.status = 409;
            throw err;
        }
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);

        const res = await db.query(
            `INSERT INTO users (name, email, password) 
             VALUES ($1, $2, $3) 
             RETURNING *`,
            [user.name, user.email, hashedPassword] 
        );
        return res.rows[0];
        
    } catch (error) {
        console.error("Error executing query", error);
        throw(error);
    }
};

exports.userLogin = async (user) => {
    try {
        const res = await db.query(
            `SELECT * FROM users WHERE email = $1`,
            [user.email] 
        );
        return res.rows[0];
    } catch (error) {
        console.error("Error executing query", error);
    }
};

exports.getUserbyEmail = async (email) => {
    try {
        const res = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        return res.rows[0];
    } catch (error) {
        console.error("Error executing query", error);
    }
}

exports.updateUser = async (user) => {
    try {
        const hashedPassword = await bcrypt.hash(user.password, saltRounds)
        const res = await  db.query(
            "UPDATE users SET email = $2, password = $3, name = $4  WHERE id = $1 RETURNING *", [user.id, user.email, hashedPassword, user.name]
        );
        return res.rows[0];
    } catch (error) {
        console.error("Error executing query", error);
    }
}

exports.deleteUser = async (id) => {
    try {
        const res = await db.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
        return res.rows[0];
    } catch (error) {
        console.error("Error executing query", error);
    }
}

exports.topUp = async (id, balance) => {
    try {
        const res = await db.query("UPDATE users SET balance = balance + $2 WHERE id = $1 RETURNING *", [id, balance]);
        return res.rows[0];
    } catch (error) {
        console.error("Error executing query", error);
    }
}