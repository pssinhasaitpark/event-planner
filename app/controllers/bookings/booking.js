// app/controllers/bookingController.js
import { Booking, Event } from '../../models/index.js';
import qrcode from 'qrcode';
import { handleResponse, handleError } from '../../utils/responseHandler.js';
import crypto from 'crypto';
import { razorpay } from '../../middlewares/razorpayInstance.js';



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

export const getEventDetailedAnalytics = async (req, res) => {
    try {
        const { eventId } = req.query;

        const matchQuery = { paymentStatus: 'paid' };
        if (eventId) matchQuery.event = eventId;

        const bookings = await Booking.find(matchQuery);

        // Group bookings by event
        const bookingsByEvent = {};
        for (const booking of bookings) {
            const eid = booking.event.toString();
            if (!bookingsByEvent[eid]) bookingsByEvent[eid] = [];
            bookingsByEvent[eid].push(booking);
        }

        const allEventIds = Object.keys(bookingsByEvent);
        const events = await Event.find(eventId ? { _id: eventId } : { _id: { $in: allEventIds } });

        const analyticsList = [];

        for (const event of events) {
            const ticketStats = {};
            let totalSales = 0;
            let totalTickets = 0;

            for (const category of event.ticketCategories) {
                ticketStats[category.name] = {
                    total: category.totalQuantity,
                    sold: 0,
                    remaining: category.remainingQuantity,
                    price: category.price
                };
            }

            const eventBookings = bookingsByEvent[event._id.toString()] || [];

            for (const booking of eventBookings) {
                if (ticketStats[booking.ticketCategory]) {
                    ticketStats[booking.ticketCategory].sold += booking.quantity;
                    totalTickets += booking.quantity;
                    totalSales += booking.amount;
                }
            }

            analyticsList.push({
                eventId: event._id,
                title: event.title,
                city: event.city,
                date: event.eventDate,
                totalSales,
                totalTickets,
                ticketCategoryStats: ticketStats
            });
        }

        return handleResponse(res, 200, 'Event analytics', eventId ? analyticsList[0] : analyticsList);
    } catch (error) {
        return handleError(res, error);
    }
};

export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().populate('event', 'title city eventDate').populate('user', 'name email');

        return handleResponse(res, 200, 'All bookings fetched', bookings);
    } catch (error) {
        return handleError(res, error);
    }
};

