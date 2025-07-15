// app/controllers/bookingController.js
import { Booking, Event, User } from '../../models/index.js';
import qrcode from 'qrcode';
import { handleResponse, handleError } from '../../utils/responseHandler.js';
import crypto from 'crypto';
import { razorpay } from '../../middlewares/razorpayInstance.js';
import { cleanupPDF, generateBookingInvoice } from '../../middlewares/pdfGenerator.js';
import path from 'path';
import fs from 'fs';
import { bookingConfirmationTemplate, sendEmail } from '../../middlewares/mailer.js';


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

        const user = await User.findById(req.user.id);
        await sendEmail(user.email, '🎫 Your Booking is Confirmed!', bookingConfirmationTemplate({ name: user.name, event, booking }));

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

// Event Detailed Analytics
export const getEventDetailedAnalytics = async (req, res) => {
    try {
        const { eventId, month, year, startDate, endDate, page = 1, limit = 10 } = req.query;

        const matchQuery = { paymentStatus: 'paid' };
        if (eventId) matchQuery.event = eventId;

        // Date filtering logic
        if (month && year) {
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 1);
            matchQuery.createdAt = { $gte: start, $lt: end };
        } else if (year) {
            const start = new Date(year, 0, 1);
            const end = new Date(Number(year) + 1, 0, 1);
            matchQuery.createdAt = { $gte: start, $lt: end };
        } else if (startDate && endDate) {
            matchQuery.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const bookings = await Booking.find(matchQuery);

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
                category: event.category,
                date: event.eventDate,
                totalSales,
                totalTickets,
                ticketCategoryStats: ticketStats
            });
        }

        // Grouped by city and category
        const grouped = {};
        for (const item of analyticsList) {
            const key = `${item.city}_${item.category || 'Uncategorized'}`;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(item);
        }

        const groupedArray = Object.entries(grouped).map(([key, events]) => {
            const [city, category] = key.split('_');
            return {
                city,
                category,
                events
            };
        });

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const paginated = groupedArray.slice(skip, skip + parseInt(limit));

        return handleResponse(res, 200, 'Event analytics', {
            total: groupedArray.length,
            page: parseInt(page),
            totalPages: Math.ceil(groupedArray.length / parseInt(limit)),
            data: paginated
        });
    } catch (error) {
        return handleError(res, error);
    }
};

// Get All Bookings (Filtered & Paginated)
export const getAllBookings = async (req, res) => {
    try {
        const { eventId, city, month, year, startDate, endDate, page = 1, limit = 10 } = req.query;

        const match = {};
        if (eventId) match.event = eventId;

        // Date filters
        if (month && year) {
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 1);
            match.createdAt = { $gte: start, $lt: end };
        } else if (year) {
            const start = new Date(year, 0, 1);
            const end = new Date(Number(year) + 1, 0, 1);
            match.createdAt = { $gte: start, $lt: end };
        } else if (startDate && endDate) {
            match.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        // Initial find
        let bookingsQuery = Booking.find(match)
            .populate({ path: 'event', select: 'title city eventDate' })
            .populate({ path: 'user', select: 'name email' });

        // Filter by city after event populate
        if (city) {
            const allBookings = await bookingsQuery;
            const filtered = allBookings.filter(b => b.event?.city?.toLowerCase() === city.toLowerCase());
            const total = filtered.length;
            const paginated = filtered.slice((page - 1) * limit, page * limit);
            return handleResponse(res, 200, 'Filtered bookings by city', {
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / limit),
                data: paginated
            });
        } else {
            const total = await Booking.countDocuments(match);
            const skip = (parseInt(page) - 1) * parseInt(limit);

            const bookings = await Booking.find(match)
                .populate('event', 'title city eventDate')
                .populate('user', 'name email')
                .skip(skip)
                .limit(parseInt(limit));

            return handleResponse(res, 200, 'All bookings fetched', {
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / limit),
                data: bookings
            });
        }
    } catch (error) {
        return handleError(res, error);
    }
};

// Generate and download booking invoice
export const downloadBookingInvoice = async (req, res) => {
    try {
        const { bookingId } = req.params;

        // Fetch booking with populated data
        const booking = await Booking.findById(bookingId)
            .populate('user', 'name email')
            .populate('event', 'title venue city eventDate');

        if (!booking) {
            return handleResponse(res, 404, 'Booking not found');
        }

        // // Check if user owns this booking (optional security check)
        // if (booking.user._id.toString() !== req.user.id) {
        //     return handleResponse(res, 403, 'Unauthorized access to booking');
        // }

        // // Check if payment is completed (optional - you might want to allow invoice for all bookings)
        // if (booking.paymentStatus !== 'Success' && booking.paymentStatus !== 'Confirmed') {
        //     return handleResponse(res, 400, 'Invoice can only be generated for successful bookings');
        // }

        // Prepare data for PDF generation
        const bookingData = {
            booking,
            user: booking.user,
            event: booking.event
        };

        // Generate PDF invoice
        const pdfPath = await generateBookingInvoice(bookingData);
        const absolutePdfPath = path.resolve(pdfPath);

        // Verify the file exists and is not empty
        if (!fs.existsSync(absolutePdfPath)) {
            return handleResponse(res, 500, 'Generated invoice file not found');
        }

        const stat = fs.statSync(absolutePdfPath);
        if (stat.size === 0) {
            return handleResponse(res, 500, 'Generated invoice is empty');
        }

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="booking_invoice_${booking._id}.pdf"`);

        // Send the file
        res.sendFile(absolutePdfPath, (err) => {
            if (err) {
                console.error('Error sending file:', err);
                return handleResponse(res, 500, 'Error sending invoice');
            }

            // Clean up after sending
            setTimeout(() => {
                cleanupPDF(absolutePdfPath);
            }, 1000);
        });

    } catch (error) {
        console.error('Booking invoice download error:', error);
        return handleError(res, error);
    }
};