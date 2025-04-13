const db = require('../database/pg.database');

exports.getAllStores = async () => {
    try {
        const res = await db.query("SELECT * FROM stores");
        return res.rows;
    } catch (error) {
        console.error("Error executing query", error);
        throw error;
    }
};


exports.createStore = async (store) => {
    try {
        const checkStore = await db.query("SELECT * FROM stores WHERE name = $1 AND address = $2", [store.name, store.address]);
        
        if (checkStore.rows.length > 0)
            throw new Error("Store already exist");
        
        const res = await db.query(
            "INSERT INTO stores (name, address) VALUES ($1, $2) RETURNING *",
            [store.name, store.address]
        );
        return res.rows[0];
    } catch (error) {
        console.error("Error executing query", error);
        throw error;
    }
};

exports.getStoresbyID = async (id) => {
    try {
        const res = await db.query("SELECT * FROM stores WHERE id = $1", [id]);
        return res.rows[0];
    } catch (error) {
        console.error("Error executing query", error);
        throw error;
    }
}

exports.updateStore = async (store) => {
    try {
        const res = await db.query("UPDATE stores SET name = $2, address = $3 WHERE id = $1 RETURNING *", [store.id, store.name, store.address]);
        return res.rows[0];
    } catch (error) {
        console.error("Error executing query", error);
        throw error;
    }
}

exports.deleteStore = async (id) => {
    try {
        const res = await db.query("DELETE FROM stores WHERE id = $1 RETURNING *", [id]);
        return res.rows[0];
    } catch (error) {
        console.error("Error executing query", error);
        throw error;
    }
}

