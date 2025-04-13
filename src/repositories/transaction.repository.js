const db = require('../database/pg.database');

exports.createTransaction = async (transaction) => {
    try {
        const itemResult = await db.query(
            "SELECT price FROM items WHERE id = $1", 
            [transaction.item_id]
        );

        if (itemResult.rows.length === 0) {
            throw new Error("Item tidak ditemukan");
        }

        const unit_price = itemResult.rows[0].price;
        const total = transaction.quantity * unit_price;

        const res = await db.query(
            "INSERT INTO transactions (item_id, quantity, user_id, total) VALUES ($1, $2, $3, $4) RETURNING *", 
            [transaction.item_id, transaction.quantity, transaction.user_id, total]
        );

        return res.rows[0];
    } catch (error) {
        console.error("Error executing query", error);
        throw error;
    }
};

exports.payTransaction = async (id) => {
    try {
        const transactionRes = await db.query(
            "SELECT * FROM transactions WHERE id = $1 AND status = 'pending'", 
            [id]
        );
        
        if (transactionRes.rowCount === 0) {
            return { error: "Failed to pay, transaction not found or already paid." };
        }

        const { item_id, user_id, quantity, total } = transactionRes.rows[0];

        const itemRes = await db.query("SELECT * FROM items WHERE id = $1", [item_id]);
        if (itemRes.rowCount === 0 || itemRes.rows[0].stock < quantity) {
            return { error: "Failed to pay, insufficient item stock." };
        }

        const userRes = await db.query("SELECT * FROM users WHERE id = $1", [user_id]);
        if (userRes.rowCount === 0 || userRes.rows[0].balance < total) {
            return { error: "Failed to pay, insufficient balance." };
        }

        await db.query("UPDATE items SET stock = stock - $1 WHERE id = $2", [quantity, item_id]);
        await db.query("UPDATE users SET balance = balance - $1 WHERE id = $2", [total, user_id]);

        const updatedTransaction = await db.query(
            "UPDATE transactions SET status = 'paid' WHERE id = $1 RETURNING *", 
            [id]
        );

        return updatedTransaction.rows[0];

    } catch (error) {
        console.error("Error executing query", error);
        return { error: "Server error occurred during transaction." };
    }
};


exports.deleteTransactionById = async (id) => {
    try {
        const res = await db.query("DELETE FROM transactions WHERE id = $1 RETURNING *", [id]);
        return res.rows[0];
    } catch (error) {
        console.error("Error executing query", error);
        throw error;
    }
}

exports.getTransaction = async () => {
    try {
        const query = `
            SELECT
                t.id,
                t.user_id,
                t.item_id,
                t.quantity,
                t.total,
                t.status,
                t.created_at,
                row_to_json(u.*) AS "user",
                row_to_json(i.*) AS "item"
            FROM transactions t
            JOIN users u   ON u.id = t.user_id
            JOIN items i   ON i.id = t.item_id;`
        const res = await db.query(query);
        return res.rows;
    } catch (error) {
        console.error("Error executing query", error);
        throw error;
    }
}
