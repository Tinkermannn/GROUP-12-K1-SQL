const db = require('../database/pg.database');

exports.createCourse = async (course) => {
    // Insert the course
    const [courseResult] = await db.execute(
        `INSERT INTO courses (course_code, name, credits, semester, lecturer_id) 
         VALUES (?, ?, ?, ?, ?)`,
        [course.course_code, course.name, course.credits, course.semester, course.lecturer_id]
    );
    
    const courseId = courseResult.insertId;
    
    // If prerequisites exist, insert them into the junction table
    if (course.prerequisites && course.prerequisites.length > 0) {
        const prerequisiteValues = course.prerequisites.map(prereqId => [courseId, prereqId]);
        
        await db.query(
            `INSERT INTO course_prerequisites (course_id, prerequisite_course_id) 
             VALUES ?`,
            [prerequisiteValues]
        );
    }
    
    return exports.getCourseById(courseId);
};

exports.getAllCourses = async () => {
    // Get all courses with basic info
    const [courses] = await db.execute(
        `SELECT c.*, l.name as lecturer_name, l.nidn, l.department
         FROM courses c
         JOIN lecturers l ON c.lecturer_id = l.id
         ORDER BY c.updated_at DESC`
    );
    
    // For each course, get its prerequisites
    for (const course of courses) {
        const [prerequisites] = await db.execute(
            `SELECT c.* 
             FROM courses c
             JOIN course_prerequisites cp ON c.id = cp.prerequisite_course_id
             WHERE cp.course_id = ?`,
            [course.id]
        );
        
        course.prerequisites = prerequisites;
    }
    
    return courses;
};

exports.getCourseById = async (id) => {
    // Get course with lecturer info
    const [courses] = await db.execute(
        `SELECT c.*, l.name as lecturer_name, l.nidn, l.department
         FROM courses c
         JOIN lecturers l ON c.lecturer_id = l.id
         WHERE c.id = ?`,
        [id]
    );
    
    if (courses.length === 0) {
        return null;
    }
    
    const course = courses[0];
    
    // Get prerequisites
    const [prerequisites] = await db.execute(
        `SELECT c.* 
         FROM courses c
         JOIN course_prerequisites cp ON c.id = cp.prerequisite_course_id
         WHERE cp.course_id = ?`,
        [id]
    );
    
    course.prerequisites = prerequisites;
    
    return course;
};

exports.updateCourse = async (course) => {
    // Update course main data
    await db.execute(
        `UPDATE courses 
         SET course_code = ?, name = ?, credits = ?, semester = ?, lecturer_id = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [course.course_code, course.name, course.credits, course.semester, course.lecturer_id, course.id]
    );
    
    // If prerequisites are provided, update the junction table
    if (course.prerequisites !== undefined) {
        // First, delete existing prerequisites
        await db.execute(
            `DELETE FROM course_prerequisites WHERE course_id = ?`,
            [course.id]
        );
        
        // Then, insert new prerequisites
        if (course.prerequisites.length > 0) {
            const prerequisiteValues = course.prerequisites.map(prereqId => [course.id, prereqId]);
            
            await db.query(
                `INSERT INTO course_prerequisites (course_id, prerequisite_course_id) 
                 VALUES ?`,
                [prerequisiteValues]
            );
        }
    }
    
    return exports.getCourseById(course.id);
};

exports.deleteCourse = async (id) => {
    // Get course data before deletion
    const course = await exports.getCourseById(id);
    
    if (!course) {
        return null;
    }
    
    // Delete prerequisites in the junction table
    await db.execute(
        `DELETE FROM course_prerequisites WHERE course_id = ? OR prerequisite_course_id = ?`,
        [id, id]
    );
    
    // Delete the course
    await db.execute(
        `DELETE FROM courses WHERE id = ?`,
        [id]
    );
    
    return course;
};

exports.findByCourseIds = async (courseIds) => {
    if (!courseIds.length) return [];
    
    const placeholders = courseIds.map(() => '?').join(',');
    
    const [courses] = await db.execute(
        `SELECT * FROM courses WHERE id IN (${placeholders})`,
        courseIds
    );
    
    return courses;
};