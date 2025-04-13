const db = require('../database/pg.database');

exports.createItem = async (item) => {
    try {
        const res = await db.query(
            "INSERT INTO items (name, price, store_id, image_url, stock) VALUES ($1, $2, $3, $4, $5) RETURNING *", 
            [item.name, item.price, item.store_id, item.image_url, item.stock]
        );
        return res.rows[0];
    } catch (error) {
        console.error("Error executing query", error);
        throw error;  
    }
};


exports.getItem = async () => {
    try {
        const res = await db.query("SELECT * FROM items");
        return res.rows;
    } catch (error) {
        console.error("Error executing query", error);
        throw error;
    }
};

exports.getItemById = async (id) => {
    try {
        const res = await db.query("SELECT * FROM items WHERE id = $1", [id]);
        if (!res || !res.rows || res.rows.length === 0) return null;

        return res.rows[0];
    } catch (error) {
        console.error("Error executing query", error);
        throw error;
    }
}

exports.getItemByStoreId = async (store_id) => {
    try {
        const res = await db.query("SELECT * FROM items WHERE store_id = $1", [store_id]);
        if (!res || !res.rows || res.rows.length === 0) return null;

        return res.rows;
    } catch (error) {
        console.error("Error executing query", error);
        throw error;
    }
}

exports.updateItem = async (item) => {
    try {
        const itemCheck = await db.query("SELECT * FROM items WHERE id = $1", [item.id]);
        if (!itemCheck || itemCheck.rowCount === 0) {
            throw new Error("Item not found");
        }

        const storeCheck = await db.query("SELECT * FROM stores WHERE id = $1", [item.store_id]);
        if (!storeCheck || storeCheck.rowCount === 0) {
            throw new Error("Store not found");
        }

        const res = await db.query(
            `UPDATE items 
             SET name = $2, price = $3, store_id = $4, image_url = $5, stock = $6 
             WHERE id = $1 
             RETURNING *`,
            [item.id, item.name, item.price, item.store_id, item.image_url, item.stock]
        );

        return res.rows[0];

    } catch (error) {
        console.error("Error executing query", error);
        throw error;
    }
}


exports.deleteItem = async (id) => {
    try {
        const res = await db.query("DELETE FROM items WHERE id = $1 RETURNING *", [id]);
        if(!res || !res.rows || res.rows.length === 0) return null;

        return res.rows[0];
    } catch (error) {
        console.error("Error executing query", error);
        throw error;
    }
}

