// app/controllers/user/user.js
import { User } from "../../models/index.js";
import bcrypt from "bcryptjs";
import { signResetToken, signToken, verifyResetToken } from "../../middlewares/jwt.js";
import { forgetSchema, loginSchema, registerSchema, resetSchema } from "../Validators/userValidators.js";
import { handleError, handleResponse } from "../../utils/responseHandler.js";
import { sendPasswordResetSuccessEmail, sendRegisterWelcomeMail, sendResetEmail, } from "../../middlewares/mailer.js";


export const register = async (req, res) => {
    try {
        const { error } = registerSchema.validate(req.body);
        if (error) return handleResponse(res, 400, error.details[0].message);

        const { name, email, password, mobile } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return handleResponse(res, 400, "User already exists");

        const hashed = await bcrypt.hash(password, 10);
        const newUser = await User.create({ name, email, password: hashed, mobile,  role: 'user' });

        const token = signToken({ id: newUser._id });

        const { password: _, ...userWithoutPassword } = newUser.toObject();

        // 📧 Send welcome mail
        await sendRegisterWelcomeMail(email, name);

        return handleResponse(res, 201, "Registered and logged in successfully. Welcome email sent.", {
            token,
            user: userWithoutPassword,
        });
    } catch (err) {
        return handleError(res, err);
    }
};


export const login = async (req, res) => {
    try {
        const { error } = loginSchema.validate(req.body);
        if (error) return handleResponse(res, 400, error.details[0].message);

        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return handleResponse(res, 400, "Invalid credentials");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return handleResponse(res, 400, "Invalid credentials");

        const token = signToken({ id: user._id });
        return handleResponse(res, 200, "Login successful", { token, role: user.role });
    } catch (err) {
        return handleError(res, err);
    }
};

export const createAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return handleResponse(res, 400, "Admin already exists");

        const hashed = await bcrypt.hash(password, 10);
        await User.create({ name, email, password: hashed, role: 'admin' });

        return handleResponse(res, 201, "Admin created successfully");
    } catch (err) {
        return handleError(res, err);
    }
};

export const forgetPassword = async (req, res) => {
    try {
        const { error } = forgetSchema.validate(req.body);
        if (error) return handleResponse(res, 400, error.details[0].message);

        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return handleResponse(res, 404, "User not found");

        const resetToken = signResetToken(email);
        await sendResetEmail(email, resetToken);

        return handleResponse(res, 200, "Password reset email sent", { token: resetToken });
    } catch (err) {
        return handleError(res, err);
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { newPassword, confirmPassword } = req.body;
        const { token } = req.query;

        const { error } = resetSchema.validate(req.body);
        if (error) return handleResponse(res, 400, error.details[0].message);

        const { email } = verifyResetToken(token);
        const user = await User.findOne({ email });
        if (!user) return handleResponse(res, 404, 'User not found');

        if (newPassword !== confirmPassword) {
            return handleResponse(res, 400, 'Passwords do not match');
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        await sendPasswordResetSuccessEmail(user.email, user.name);


        return handleResponse(res, 200, 'Password has been reset successfully');
    } catch (err) {
        return handleResponse(res, 400, 'Invalid or expired token');
    }
};

//  Get all users
export const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        return handleResponse(res, 200, 'Users fetched successfully', users);
    } catch (err) {
        return handleError(res, err);
    }
};

//  Get user by ID
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return handleResponse(res, 404, 'User not found');
        return handleResponse(res, 200, 'User fetched successfully', user);
    } catch (err) {
        return handleError(res, err);
    }
};

//  Update user
export const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return handleResponse(res, 404, 'User not found');

        // Update only the provided fields
        Object.keys(req.body).forEach((key) => {
            if (req.body[key] !== undefined) {
                user[key] = req.body[key];
            }
        });

        const updatedUser = await user.save();
        return handleResponse(res, 200, 'User updated successfully', updatedUser);
    } catch (err) {
        return handleError(res, err);
    }
};


// Delete user
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return handleResponse(res, 404, 'User not found');
        return handleResponse(res, 200, 'User deleted successfully');
    } catch (err) {
        return handleError(res, err);
    }
};


export const me = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');  
        return handleResponse(res, 200, 'user data fetched successfully', user);

    } catch (error) {
        // console.error(error);
        return handleError(res, error);
    }
};