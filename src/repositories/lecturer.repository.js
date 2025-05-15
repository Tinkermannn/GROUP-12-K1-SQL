const db = require('../database/pg.database');

exports.createLecturer = async (lecturerData) => {
    const { name, nidn, department } = lecturerData;
    
    const [result] = await db.execute(
        `INSERT INTO lecturers (name, nidn, department) 
         VALUES (?, ?, ?)`,
        [name, nidn, department]
    );
    
    return exports.getLecturerById(result.insertId);
};

exports.getAllLecturers = async () => {
    const [lecturers] = await db.execute(
        `SELECT * FROM lecturers ORDER BY updated_at DESC`
    );
    
    return lecturers;
};

exports.getLecturerById = async (id) => {
    const [lecturers] = await db.execute(
        `SELECT * FROM lecturers WHERE id = ?`,
        [id]
    );
    
    return lecturers.length > 0 ? lecturers[0] : null;
};

exports.findByNidn = async (nidn) => {
    const [lecturers] = await db.execute(
        `SELECT * FROM lecturers WHERE nidn = ?`,
        [nidn]
    );
    
    return lecturers.length > 0 ? lecturers[0] : null;
};

exports.updateLecturer = async (lecturerData) => {
    const { id, name, nidn, department } = lecturerData;
    
    await db.execute(
        `UPDATE lecturers 
         SET name = ?, nidn = ?, department = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [name, nidn, department, id]
    );
    
    return exports.getLecturerById(id);
};

exports.deleteLecturer = async (id) => {
    const lecturer = await exports.getLecturerById(id);
    
    if (!lecturer) {
        return null;
    }
    
    await db.execute(
        `DELETE FROM lecturers WHERE id = ?`,
        [id]
    );
    
    return lecturer;
};