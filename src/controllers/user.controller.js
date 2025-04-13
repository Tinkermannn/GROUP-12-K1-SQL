const userRepository = require('../repositories/user.repository');
const baseResponse = require('../utils/baseResponse.util');
const bcrypt = require('bcrypt');

const emailRegex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[a-zA-Z]).{8,}$/;

exports.userRegister = async (req, res, next) => {
    const { name, email, password } = req.query;

    if (!name || !email || !password) {
        return baseResponse(res, false, 400, "Missing name, email, or password", null);
    }

    if(!emailRegex.test(email) && !passwordRegex.test(password)) {
        return baseResponse(res, false, 422, "Invalid email and password format", null);
    } else if(!emailRegex.test(email)) {
        return baseResponse(res, false, 422, "Invalid email format", null);
    } else if (!passwordRegex.test(password)) {
        return baseResponse(res, false, 422, "Invalid password format", null);
    }

    try {
        const user = await userRepository.userRegister({ name, email, password });
        baseResponse(res, true, 201, "User created", user);
    } catch (error) {
        next(error);
    }
};

exports.userLogin = async (req, res, next) => {
    const { email, password } = req.query;

    if (!email || !password) {
        return baseResponse(res, false, 400, "Missing email or password", null);
    }

    try {
        const user = await userRepository.userLogin({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return baseResponse(res, false, 401, "Invalid email or password", null);
        }

        baseResponse(res, true, 200, "Login success", user);

    } catch (error) {
        next(error);
    }
};

exports.getUserbyEmail = async (req, res, next) => {
    try {
        const user = await userRepository.getUserbyEmail(req.params.email);

        if(user) {
            baseResponse(res, true, 200, "User Found", user);
        } else {
            baseResponse(res, false, 404, "User not found", null);
        }
    } catch (error) {
        next(error);
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        const { id, email, password, name } = req.body; 

        if(!emailRegex.test(email) && !passwordRegex.test(password)) {
            return baseResponse(res, false, 422, "Invalid email and password format", null);
        } else if(!emailRegex.test(email)) {
            return baseResponse(res, false, 422, "Invalid email format", null);
        } else if (!passwordRegex.test(password)) {
            return baseResponse(res, false, 422, "Invalid password format", null);
        }

        const user = await userRepository.updateUser({ id, email, password, name });

        if(user) {
            baseResponse(res, true, 200, "User updated", user);
        } else {
            baseResponse(res, false, 404, "User not found", null);
        }
    } catch (error) {
        next(error);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        const user = await userRepository.deleteUser(req.params.id);

        if(user) {
            baseResponse(res, true, 200, "User deleted", user);
        } else {
            baseResponse(res, false, 404, "User not found", null);
        }
    } catch (error) {
        next(error);
    }
};

exports.topUp = async (req, res, next) => {
    try {
        const { id, amount } = req.query;

        if (!id) {
            return baseResponse(res, false, 404, "User not found", null); 
        }

        const numBalance = parseInt(amount);
        if (numBalance <= 0) {
            return baseResponse(res, false, 422, "Amount must be larger than 0", null);
        }

        const user = await userRepository.topUp(id, numBalance);
        return baseResponse(res, true, 200, "Top up successful", user);

    } catch (error) {
        next(error);
    }
};
