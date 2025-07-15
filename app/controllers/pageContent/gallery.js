import Gallery from '../../models/pageContent/gallery.js';
import { handleResponse, handleError } from '../../utils/responseHandler.js';
import { deleteFiles } from '../../middlewares/upload.js';

export const createGallery = async (req, res) => {
    try {
        const { title, description } = req.body;
        const images = req.convertedFiles?.images || [];
        const videos = req.convertedFiles?.videos || [];

        const gallery = await Gallery.create({ title, description, imageGallery: images, videoGallery: videos });

        return handleResponse(res, 201, 'Gallery created successfully', gallery);
    } catch (error) {
        return handleError(res, error);

    }
};

export const getAllGalleries = async (req, res) => {
    try {
        const { page = 1, limit = 10, isActive } = req.query;
        const filter = {};

        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const total = await Gallery.countDocuments(filter);
        const galleries = await Gallery.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        return handleResponse(res, 200, 'Gallery list fetched', {
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
            galleries
        });
    } catch (error) {
        return handleError(res, error);
    }
};

export const getGalleryById = async (req, res) => {
    try {
        const gallery = await Gallery.findById(req.params.id);
        if (!gallery) return handleResponse(res, 404, 'Gallery not found');
        return handleResponse(res, 200, 'Gallery fetched', gallery);
    } catch (error) {
        return handleError(res, error);
    }
};

export const updateGallery = async (req, res) => {
    try {
        const gallery = await Gallery.findById(req.params.id);
        if (!gallery) return handleResponse(res, 404, 'Gallery not found');

        const { title, description, isActive } = req.body;
        const { images = [], videos = [] } = req.convertedFiles || {};

        // Optional cleanup of old files (can be removed if preserving)
        if (images.length > 0) await deleteFiles(gallery.imageGallery);
        if (videos.length > 0) await deleteFiles(gallery.videoGallery);

        gallery.title = title || gallery.title;
        gallery.description = description || gallery.description;
        gallery.imageGallery = images.length > 0 ? images : gallery.imageGallery;
        gallery.videoGallery = videos.length > 0 ? videos : gallery.videoGallery;
        if (isActive !== undefined) gallery.isActive = isActive;

        await gallery.save();
        return handleResponse(res, 200, 'Gallery updated successfully', gallery);
    } catch (error) {
        return handleError(res, error);
    }
};

export const deleteGallery = async (req, res) => {
    try {
        const gallery = await Gallery.findById(req.params.id);
        if (!gallery) return handleResponse(res, 404, 'Gallery not found');

        await deleteFiles([...gallery.imageGallery, ...gallery.videoGallery]);
        await gallery.deleteOne();

        return handleResponse(res, 200, 'Gallery deleted successfully');
    } catch (error) {
        return handleError(res, error);
    }
};
