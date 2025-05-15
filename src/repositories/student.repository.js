const db = require('../database/pg.database');

exports.createStudent = async (studentData) => {
    const { user_id, nim, name, major, semester } = studentData;
    
    const [result] = await db.execute(
        `INSERT INTO students (user_id, nim, name, major, semester) 
         VALUES (?, ?, ?, ?, ?)`,
        [user_id, nim, name, major, semester]
    );
    
    return exports.getStudentById(result.insertId);
};

exports.getAllStudents = async () => {
    const [students] = await db.execute(
        `SELECT s.*, u.username, u.email, u.role
         FROM students s
         JOIN users u ON s.user_id = u.id
         ORDER BY s.updated_at DESC`
    );
    
    return students;
};

exports.getStudentById = async (id) => {
    const [students] = await db.execute(
        `SELECT s.*, u.username, u.email, u.role
         FROM students s
         JOIN users u ON s.user_id = u.id
         WHERE s.id = ?`,
        [id]
    );
    
    return students.length > 0 ? students[0] : null;
};

exports.findByNim = async (nim) => {
    const [students] = await db.execute(
        `SELECT * FROM students WHERE nim = ?`,
        [nim]
    );
    
    return students.length > 0 ? students[0] : null;
};

exports.updateStudent = async (studentData) => {
    const { id, user_id, nim, name, major, semester } = studentData;
    
    const updateFields = [];
    const updateValues = [];
    
    if (user_id !== undefined) {
        updateFields.push('user_id = ?');
        updateValues.push(user_id);
    }
    
    if (nim !== undefined) {
        updateFields.push('nim = ?');
        updateValues.push(nim);
    }
    
    if (name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(name);
    }
    
    if (major !== undefined) {
        updateFields.push('major = ?');
        updateValues.push(major);
    }
    
    if (semester !== undefined) {
        updateFields.push('semester = ?');
        updateValues.push(semester);
    }
    
    if (updateFields.length === 0) {
        return exports.getStudentById(id);
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);
    
    await db.execute(
        `UPDATE students 
         SET ${updateFields.join(', ')}
         WHERE id = ?`,
        updateValues
    );
    
    return exports.getStudentById(id);
};

exports.deleteStudent = async (id) => {
    const student = await exports.getStudentById(id);
    
    if (!student) {
        return null;
    }
    
    await db.execute(
        `DELETE FROM students WHERE id = ?`,
        [id]
    );
    
    return student;
};

exports.checkUserExists = async (userId) => {
    const [users] = await db.execute(
        `SELECT 1 FROM users WHERE id = ?`,
        [userId]
    );
    
    return users.length > 0;
};