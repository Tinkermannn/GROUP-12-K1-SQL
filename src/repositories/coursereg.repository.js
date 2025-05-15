const db = require('../database/pg.database');

exports.createCourseRegistration = async (registration) => {
    const { student_id, course_id, academic_year, semester, status = 'registered' } = registration;
    
    const [result] = await db.execute(
        `INSERT INTO course_registrations 
         (student_id, course_id, academic_year, semester, status) 
         VALUES (?, ?, ?, ?, ?)`,
        [student_id, course_id, academic_year, semester, status]
    );
    
    return exports.getCourseRegistrationById(result.insertId);
};

exports.getAllCourseRegistrations = async () => {
    const [registrations] = await db.execute(
        `SELECT cr.*, 
                s.nim, s.name as student_name, s.major, s.semester as student_semester,
                c.course_code, c.name as course_name, c.credits, c.semester as course_semester
         FROM course_registrations cr
         JOIN students s ON cr.student_id = s.id
         JOIN courses c ON cr.course_id = c.id
         ORDER BY cr.created_at DESC`
    );
    
    return registrations;
};

exports.getCourseRegistrationById = async (id) => {
    const [registrations] = await db.execute(
        `SELECT cr.*, 
                s.nim, s.name as student_name, s.major, s.semester as student_semester,
                c.course_code, c.name as course_name, c.credits, c.semester as course_semester
         FROM course_registrations cr
         JOIN students s ON cr.student_id = s.id
         JOIN courses c ON cr.course_id = c.id
         WHERE cr.id = ?`,
        [id]
    );
    
    return registrations.length > 0 ? registrations[0] : null;
};

exports.updateCourseRegistration = async (registration) => {
    const { id, student_id, course_id, academic_year, semester, status } = registration;
    
    const updateFields = [];
    const updateValues = [];
    
    // Build dynamic update query
    if (student_id !== undefined) {
        updateFields.push('student_id = ?');
        updateValues.push(student_id);
    }
    
    if (course_id !== undefined) {
        updateFields.push('course_id = ?');
        updateValues.push(course_id);
    }
    
    if (academic_year !== undefined) {
        updateFields.push('academic_year = ?');
        updateValues.push(academic_year);
    }
    
    if (semester !== undefined) {
        updateFields.push('semester = ?');
        updateValues.push(semester);
    }
    
    if (status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(status);
    }
    
    if (updateFields.length === 0) {
        return exports.getCourseRegistrationById(id);
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);
    
    await db.execute(
        `UPDATE course_registrations 
         SET ${updateFields.join(', ')}
         WHERE id = ?`,
        updateValues
    );
    
    return exports.getCourseRegistrationById(id);
};

exports.deleteCourseRegistration = async (id) => {
    const registration = await exports.getCourseRegistrationById(id);
    
    if (!registration) {
        return null;
    }
    
    await db.execute(
        `DELETE FROM course_registrations WHERE id = ?`,
        [id]
    );
    
    return registration;
};

exports.findApprovedCoursesByStudentId = async (studentId) => {
    const [approvedCourses] = await db.execute(
        `SELECT cr.course_id
         FROM course_registrations cr
         WHERE cr.student_id = ? AND cr.status = 'approved'`,
        [studentId]
    );
    
    return approvedCourses.map(course => course.course_id);
};

exports.getPrerequisitesForCourse = async (courseId) => {
    const [prerequisites] = await db.execute(
        `SELECT c.*
         FROM courses c
         JOIN course_prerequisites cp ON c.id = cp.prerequisite_course_id
         WHERE cp.course_id = ?`,
        [courseId]
    );
    
    return prerequisites;
};

exports.studentExists = async (studentId) => {
    const [students] = await db.execute(
        `SELECT 1 FROM students WHERE id = ?`,
        [studentId]
    );
    
    return students.length > 0;
};

exports.courseExists = async (courseId) => {
    const [courses] = await db.execute(
        `SELECT 1 FROM courses WHERE id = ?`,
        [courseId]
    );
    
    return courses.length > 0;
};