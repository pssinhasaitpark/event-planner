// app/controllers/bookingController.js
import { Booking, Event } from '../../models/index.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import qrcode from 'qrcode';
import { handleResponse, handleError } from '../../utils/responseHandler.js';
import mongoose from 'mongoose';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

export const createBooking = async (req, res) => {
    try {
        const { eventId, ticketCategory, quantity } = req.body;

        const event = await Event.findById(eventId);
        if (!event) return handleResponse(res, 404, 'Event not found');

        const category = event.ticketCategories.find(cat => cat.name === ticketCategory);
        if (!category) return handleResponse(res, 400, 'Invalid ticket category');
        if (category.remainingQuantity < quantity) return handleResponse(res, 400, 'Not enough tickets available');

        const amount = category.price * quantity * 100; 

        const razorpayOrder = await razorpay.orders.create({
            amount,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
        });

        const booking = await Booking.create({
            user: req.user.id,
            event: eventId,
            ticketCategory,
            quantity,
            amount: amount / 100,
            razorpayOrderId: razorpayOrder.id,
            paymentStatus: 'pending'
        });

        return handleResponse(res, 200, 'Booking initiated', { booking, razorpayOrder });
    } catch (error) {
        return handleError(res, error);
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

        const body = razorpayOrderId + '|' + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpaySignature) {
            return handleResponse(res, 400, 'Payment verification failed');
        }

        const booking = await Booking.findOneAndUpdate(
            { razorpayOrderId },
            { paymentStatus: 'paid', razorpayPaymentId },
            { new: true }
        );

        if (!booking) {
            return handleResponse(res, 404, 'Booking not found for payment update');
        }

        const qrData = `${booking._id}|${booking.event}|${booking.user}`;
        const qrCodeUrl = await qrcode.toDataURL(qrData);

        booking.qrCodeUrl = qrCodeUrl;
        await booking.save();

        const event = await Event.findById(booking.event);
        const category = event.ticketCategories.find(cat => cat.name === booking.ticketCategory);
        category.remainingQuantity -= booking.quantity;
        await event.save();

        return handleResponse(res, 200, 'Payment verified and booking confirmed', booking);
    } catch (error) {
        return handleError(res, error);
    }
};

export const scanQrCode = async (req, res) => {
    try {
        const { data } = req.params;
        const [bookingId, eventId, userId] = data.split('|');

        const booking = await Booking.findOne({
            _id: bookingId,
            event: eventId,
            user: userId,
            paymentStatus: 'paid'
        }).populate('event user');

        if (!booking) {
            return handleResponse(res, 404, 'Invalid or unpaid QR code');
        }

        return handleResponse(res, 200, 'QR verified', booking);
    } catch (error) {
        return handleError(res, error);
    }
};

export const getEventAnalytics = async (req, res) => {
    try {
        const matchStage = { paymentStatus: 'paid' };
        if (req.query.eventId) {
            matchStage.event = new mongoose.Types.ObjectId(req.query.eventId);
        }

        const analytics = await Booking.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$event",
                    totalSales: { $sum: "$amount" },
                    totalTickets: { $sum: "$quantity" },
                    bookings: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "events",
                    localField: "_id",
                    foreignField: "_id",
                    as: "eventDetails"
                }
            },
            { $unwind: "$eventDetails" },
            {
                $project: {
                    _id: 0,
                    eventId: "$eventDetails._id",
                    title: "$eventDetails.title",
                    city: "$eventDetails.city",
                    date: "$eventDetails.eventDate",
                    totalSales: 1,
                    totalTickets: 1,
                    bookings: 1
                }
            },
            { $sort: { date: -1 } }
        ]);

        return handleResponse(res, 200, 'Event analytics fetched successfully', analytics);
    } catch (error) {
        return handleError(res, error);
    }
};
