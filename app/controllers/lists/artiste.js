// app/controllers/artistController.js
import Artist from '../../models/lists/artiste.js';
import { handleResponse, handleError } from '../../utils/responseHandler.js';

export const createArtist = async (req, res) => {
    try {
        const { name, description } = req.body;
        const image = req.convertedFiles?.images?.[0] || null;

        const newArtist = await Artist.create({ name, image, description, createdBy: req.user?.id });

        return handleResponse(res, 201, 'Artist created successfully', newArtist);
    } catch (error) {
        return handleError(res, error);
    }
};

export const getAllArtists = async (req, res) => {
    try {
        const artists = await Artist.find().sort({ createdAt: -1 });
        return handleResponse(res, 200, 'Artists fetched successfully', artists);
    } catch (error) {
        return handleError(res, error);
    }
};

export const getArtistById = async (req, res) => {
    try {
        const artist = await Artist.findById(req.params.id);
        if (!artist) return handleResponse(res, 404, 'Artist not found');
        return handleResponse(res, 200, 'Artist fetched successfully', artist);
    } catch (error) {
        return handleError(res, error);
    }
};

export const updateArtist = async (req, res) => {
    try {
        const { id } = req.params;
        const artist = await Artist.findById(id);
        if (!artist) return handleResponse(res, 404, 'Artist not found');

        const updates = req.body;
        const newImage = req.convertedFiles?.images?.[0];

        const updatedData = {
            name: updates.name ?? artist.name,
            description: updates.description ?? artist.description,
            image: newImage ?? artist.image
        };

        const updatedArtist = await Artist.findByIdAndUpdate(id, updatedData, { new: true });

        return handleResponse(res, 200, 'Artist updated successfully', updatedArtist);
    } catch (error) {
        return handleError(res, error);
    }
};

export const deleteArtist = async (req, res) => {
    try {
        const deleted = await Artist.findByIdAndDelete(req.params.id);
        if (!deleted) return handleResponse(res, 404, 'Artist not found');
        return handleResponse(res, 200, 'Artist deleted successfully');
    } catch (error) {
        return handleError(res, error);
    }
};
