import { QuickLink } from '../../models/index.js';
import { handleResponse, handleError } from '../../utils/responseHandler.js';

export const createQuickLink = async (req, res) => {
    try {
        const { name, link } = req.body;
        const createdBy = req.user?.id;

        if (!name || !link) {
            return handleResponse(res, 400, 'Name and link are required');
        }

        const quickLink = await QuickLink.create({ name, link, createdBy });
        return handleResponse(res, 201, 'Quick link created successfully', quickLink);
    } catch (error) {
        return handleError(res, error);
    }
};

export const getAllQuickLinks = async (req, res) => {
    try {
        const links = await QuickLink.find().sort({ createdAt: -1 });
        return handleResponse(res, 200, 'Quick links fetched successfully', links);
    } catch (error) {
        return handleError(res, error);
    }
};

export const deleteQuickLink = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await QuickLink.findByIdAndDelete(id);

        if (!deleted) {
            return handleResponse(res, 404, 'Quick link not found');
        }

        return handleResponse(res, 200, 'Quick link deleted successfully');
    } catch (error) {
        return handleError(res, error);
    }
};
