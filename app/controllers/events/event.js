// app/controllers/eventController.js
import Event from '../../models/events/event.js';
import { handleResponse, handleError } from '../../utils/responseHandler.js';

const safeJsonParse = (input, fallback = null) => {
    try {
        return typeof input === 'string' ? JSON.parse(input) : input;
    } catch (e) {
        console.warn('Invalid JSON input:', input);
        return fallback;
    }
};

export const createEvent = async (req, res) => {
    try {
        const {
            title, description, eventDate, eventTime, duration, location, ageLimit,
            layout, seating, kidFriendly, petFriendly, instructions, termsAndConditions,
            faq, prohibitedItems, ticketCategories, city, artists
        } = req.body;

        const images = req.convertedFiles?.images || [];
        const videos = req.convertedFiles?.videos || [];

        const parsedCategories = safeJsonParse(ticketCategories, []) ?? [];
        const formattedCategories = parsedCategories.map(cat => ({ ...cat, remainingQuantity: cat.totalQuantity }));

        const parsedArtists = safeJsonParse(artists, []) ?? [];
        const parsedLocation = safeJsonParse(location, {}) ?? {};
        const parsedAgeLimit = safeJsonParse(ageLimit, {}) ?? {};
        const parsedFaq = safeJsonParse(faq, []) ?? [];
        const parsedProhibitedItems = safeJsonParse(prohibitedItems, []) ?? [];

        const newEvent = await Event.create({
            title,
            description,
            banner: images[0] || null,
            gallery: images.slice(1),
            video: videos[0] || null,
            eventDate,
            eventTime,
            duration,
            location: parsedLocation,
            ageLimit: parsedAgeLimit,
            layout,
            seating,
            kidFriendly,
            petFriendly,
            instructions,
            termsAndConditions,
            faq: parsedFaq,
            prohibitedItems: parsedProhibitedItems,
            ticketCategories: formattedCategories,
            artists: parsedArtists,
            city,
            createdBy: req.user?.id
        });

        return handleResponse(res, 201, 'Event created successfully', newEvent);
    } catch (error) {
        console.error('Error in createEvent:', error);
        return handleError(res, error);
    }
};

//for client with querry filters
export const getAllEvents = async (req, res) => {
    try {
        const { page = 1, limit = 10, title, city, layout, seating, kidFriendly, petFriendly, artist, startDate, endDate } = req.query;

        const query = {};

        if (title) query.title = { $regex: title, $options: 'i' };
        if (city) query.city = city;
        if (layout) query.layout = layout;
        if (seating) query.seating = seating;
        if (kidFriendly !== undefined) query.kidFriendly = kidFriendly === 'true';
        if (petFriendly !== undefined) query.petFriendly = petFriendly === 'true';
        if (artist) query.artists = artist;

        // Date range filtering
        if (startDate && endDate) {
            query.eventDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
        } else if (startDate) {
            query.eventDate = { $gte: new Date(startDate) };
        } else if (endDate) {
            query.eventDate = { $lte: new Date(endDate) };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Event.countDocuments(query);

        const events = await Event.find(query)
            .sort({ eventDate: 1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select('_id title banner eventDate location city');

        return handleResponse(res, 200, 'Events fetched successfully', {
            events,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error('Error in getAllEvents:', error);
        return handleError(res, error);
    }
};

//for admin
export const getAllEventsAdmin = async (req, res) => {
    try {
        const events = await Event.find().sort({ eventDate: 1 });
        return handleResponse(res, 200, 'Events fetched successfully', events);
    } catch (error) {
        return handleError(res, error);
    }
};

export const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('artists');
        if (!event) return handleResponse(res, 404, 'Event not found');
        return handleResponse(res, 200, 'Event fetched successfully', event);
    } catch (error) {
        return handleError(res, error);
    }
};

export const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findById(id);
        if (!event) return handleResponse(res, 404, 'Event not found');

        const updates = req.body;

        if (typeof updates.faq === 'string') updates.faq = JSON.parse(updates.faq);
        if (typeof updates.prohibitedItems === 'string') updates.prohibitedItems = JSON.parse(updates.prohibitedItems);
        if (typeof updates.location === 'string') updates.location = JSON.parse(updates.location);
        if (typeof updates.ageLimit === 'string') updates.ageLimit = JSON.parse(updates.ageLimit);
        if (typeof updates.ticketCategories === 'string') updates.ticketCategories = JSON.parse(updates.ticketCategories);
        if (typeof updates.retainGallery === 'string') updates.retainGallery = JSON.parse(updates.retainGallery);

        const newImages = req.convertedFiles?.images || [];
        let banner = event.banner;
        let gallery = [...event.gallery];

        if (newImages.length > 0) {
            if (newImages[0]) banner = newImages[0];
            const newGallery = newImages.slice(1);
            const retainedGallery = updates.retainGallery || [];
            gallery = [...retainedGallery, ...newGallery];
        }

        const newVideos = req.convertedFiles?.videos || [];
        let video = event.video;

        if (newVideos.length > 0) {
            video = newVideos[0];
        } else if (updates.removeVideo === 'true' || updates.removeVideo === true) {
            video = null;
        }

        const updatedData = {
            title: updates.title ?? event.title,
            description: updates.description ?? event.description,
            eventDate: updates.eventDate ?? event.eventDate,
            eventTime: updates.eventTime ?? event.eventTime,
            duration: updates.duration ?? event.duration,
            location: updates.location ?? event.location,
            ageLimit: updates.ageLimit ?? event.ageLimit,
            layout: updates.layout ?? event.layout,
            seating: updates.seating ?? event.seating,
            kidFriendly: updates.kidFriendly ?? event.kidFriendly,
            petFriendly: updates.petFriendly ?? event.petFriendly,
            instructions: updates.instructions ?? event.instructions,
            termsAndConditions: updates.termsAndConditions ?? event.termsAndConditions,
            faq: updates.faq ?? event.faq,
            prohibitedItems: updates.prohibitedItems ?? event.prohibitedItems,
            ticketCategories: updates.ticketCategories ?? event.ticketCategories,
            banner,
            gallery,
            video
        };

        const updatedEvent = await Event.findByIdAndUpdate(id, updatedData, { new: true });
        return handleResponse(res, 200, 'Event updated successfully', updatedEvent);
    } catch (error) {
        console.error('Event update failed:', error);
        return handleError(res, error);
    }
};

export const deleteEvent = async (req, res) => {
    try {
        const deleted = await Event.findByIdAndDelete(req.params.id);
        if (!deleted) return handleResponse(res, 404, 'Event not found');
        return handleResponse(res, 200, 'Event deleted successfully');
    } catch (error) {
        return handleError(res, error);
    }
};
