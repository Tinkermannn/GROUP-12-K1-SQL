const db = require('../database/pg.database');
const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.registerUser = async ({ username, email, password }) => {
    const existing = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
        const err = new Error("Email already used");
        err.status = 409;
        throw err;
    }

    const hash = await bcrypt.hash(password, saltRounds);
    const result = await db.query(`
        INSERT INTO users (username, email, password)
        VALUES ($1, $2, $3)
        RETURNING *
    `, [username, email, hash]);

    return result.rows[0];
};

exports.loginUser = async (email) => {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0];
};

exports.updateUser = async (user) => {
    try {
        const userCheck = await db.query("SELECT * FROM users WHERE user_id = $1", [user.user_id]);
        if (!userCheck || userCheck.rowCount === 0) {
            throw new Error("User not found");
        }
        
        // Jika password ada dan perlu dienkripsi
        let password = user.password;
        if (password) {
            password = await bcrypt.hash(password, 10);
        } else {
            password = userCheck.rows[0].password; // Gunakan password lama
        }
        
        // Ambil nilai yang ada jika tidak ada nilai baru yang diberikan
        const username = user.username || userCheck.rows[0].username;
        const email = user.email || userCheck.rows[0].email;
        const profile_image_url = user.profile_image_url || userCheck.rows[0].profile_image_url;
        
        const res = await db.query(
            `UPDATE users 
             SET username = $2, email = $3, password = $4, profile_image_url = $5 
             WHERE user_id = $1 
             RETURNING *`,
            [user.user_id, username, email, password, profile_image_url]
        );
        
        return res.rows[0];
    } catch (error) {
        console.error("Error executing query", error);
        throw error;
    }
}

exports.deleteUser = async (user_id) => {
    const result = await db.query("DELETE FROM users WHERE user_id = $1 RETURNING *", [user_id]);
    return result.rows[0];
};

exports.getUserById = async (user_id) => {
    const result = await db.query(
        "SELECT * FROM users WHERE user_id = $1",
        [user_id]
    );

    if (result.rows.length === 0) {
        const err = new Error("User not found");
        err.status = 404;
        throw err;
    }

    return result.rows[0];
};
