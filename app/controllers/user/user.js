// app/controllers/user/user.js
import { User } from "../../models/index.js";
import { handleError, handleResponse } from "../../utils/responseHandler.js";

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

export const getUserPurchasesAndBookings = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch bookings sorted by newest
        const bookings = await Booking.find({ user: userId, paymentStatus: 'paid' })
            .sort({ createdAt: -1 })
            .populate('event', 'title city eventDate banner')
            .select('-__v');

        // Fetch product orders sorted by newest
        const orders = await ProductOrder.find({ user: userId })
            .sort({ createdAt: -1 })
            .populate('products.product', 'name price images')
            .select('-__v');

        return handleResponse(res, 200, 'User purchases and bookings fetched', {
            bookings,
            orders
        });
    } catch (error) {
        return handleError(res, error);
    }
};