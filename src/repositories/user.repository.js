const db = require('../database/pg.database');
const bcrypt = require('bcrypt');

exports.createUser = async (userData) => {
    const { username, email, password, role } = userData;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const [result] = await db.execute(
        `INSERT INTO users (username, email, password, role) 
         VALUES (?, ?, ?, ?)`,
        [username, email, hashedPassword, role]
    );
    
    const userId = result.insertId;
    
    // Get the created user (excluding password)
    const [users] = await db.execute(
        `SELECT id, username, email, role, created_at, updated_at 
         FROM users 
         WHERE id = ?`,
        [userId]
    );
    
    return users[0];
};

exports.getAllUsers = async () => {
    const [users] = await db.execute(
        `SELECT id, username, email, role, created_at, updated_at 
         FROM users 
         ORDER BY created_at DESC`
    );
    
    return users;
};

exports.getUserById = async (id) => {
    const [users] = await db.execute(
        `SELECT id, username, email, role, created_at, updated_at 
         FROM users 
         WHERE id = ?`,
        [id]
    );
    
    return users.length > 0 ? users[0] : null;
};

exports.findByUsername = async (username) => {
    const [users] = await db.execute(
        `SELECT id FROM users WHERE username = ?`,
        [username]
    );
    
    return users.length > 0;
};

exports.findByEmail = async (email) => {
    const [users] = await db.execute(
        `SELECT id FROM users WHERE email = ?`,
        [email]
    );
    
    return users.length > 0;
};

exports.updateUser = async (userData) => {
    const { id, username, email, password, role } = userData;
    
    const updateFields = [];
    const updateValues = [];
    
    // For each property in userData, add it to the update query
    if (username !== undefined) {
        updateFields.push('username = ?');
        updateValues.push(username);
    }
    
    if (email !== undefined) {
        updateFields.push('email = ?');
        updateValues.push(email);
    }
    
    if (role !== undefined) {
        updateFields.push('role = ?');
        updateValues.push(role);
    }
    
    // Handle password separately if it's being updated
    if (password !== undefined) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        updateFields.push('password = ?');
        updateValues.push(hashedPassword);
    }
    
    if (updateFields.length === 0) {
        return exports.getUserById(id);
    }
    
    // Add the update timestamp
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    
    // Add the id for the WHERE clause
    updateValues.push(id);
    
    await db.execute(
        `UPDATE users 
         SET ${updateFields.join(', ')} 
         WHERE id = ?`,
        updateValues
    );
    
    return exports.getUserById(id);
};

exports.deleteUser = async (id) => {
    const user = await exports.getUserById(id);
    
    if (!user) {
        return null;
    }
    
    await db.execute(
        `DELETE FROM users WHERE id = ?`,
        [id]
    );
    
    return user;
};

exports.findUserByEmailWithPassword = async (email) => {
    const [users] = await db.execute(
        `SELECT * FROM users WHERE email = ?`,
        [email]
    );
    
    return users.length > 0 ? users[0] : null;
};