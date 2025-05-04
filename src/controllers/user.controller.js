const userRepository = require('../repositories/user.repository');
const baseResponse = require('../utils/baseResponse.util');
const bcrypt = require('bcrypt');
const emailRegex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[a-zA-Z]).{8,}$/;
const cloudinary = require('cloudinary').v2;


exports.register = async (req, res, next) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return baseResponse(res, false, 400, "Missing fields", null);
    }
    if (!emailRegex.test(email)) {
        return baseResponse(res, false, 422, "Invalid email format", null);
    }
    if (!passwordRegex.test(password)) {
        return baseResponse(res, false, 422, "Weak password", null);
    }

    try {
        const user = await userRepository.registerUser({
            username,
            email,
            password
        });

        baseResponse(res, true, 201, "User registered", user);
    } catch (err) {
        console.error("Error registering user:", err);
        next(err);
    }
};



exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await userRepository.loginUser(email);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return baseResponse(res, false, 401, "Invalid credentials", null);
        }
        baseResponse(res, true, 200, "Login successful", user);
    } catch (err) {
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        // Validasi input
        if (!req.body.user_id) {
            return baseResponse(res, false, 400, "User ID is required", null);
        }

        let updateData = { ...req.body };
        
        if (req.file) {
            try {
                // Upload ke Cloudinary
                const result = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'user_profiles' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    uploadStream.end(req.file.buffer);
                });
                
                updateData.profile_image_url = result.secure_url;
            } catch (uploadError) {
                console.error("Cloudinary upload error:", uploadError);
                return baseResponse(res, false, 500, "Failed to upload image", null);
            }
        }

        // Update user data
        const user = await userRepository.updateUser(updateData);
        return baseResponse(res, true, 200, "User updated successfully", user);
        
    } catch (err) {
        console.error("Update user error:", err);
        next(err);
    }
}

exports.delete = async (req, res, next) => {
    const { user_id } = req.params;

    try {
        const user = await userRepository.deleteUser(user_id);
        baseResponse(res, true, 200, "User deleted", user);
    } catch (err) {
        next(err);
    }
};

exports.getUserById = async (req, res, next) => {
    const { user_id } = req.params;

    try {
        const user = await userRepository.getUserById(user_id);
        baseResponse(res, true, 200, "User found", user);
    } catch (err) {
        console.error("Error getting user:", err);
        next(err);
    }
};

