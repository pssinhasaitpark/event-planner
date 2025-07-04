import { Service } from '../../models/index.js';
import { handleResponse, handleError } from '../../utils/responseHandler.js';

export const createService = async (req, res) => {
    try {
        const { title, description, icon, isActive } = req.body;

        if (!title || !description) {
            return handleResponse(res, 400, 'Title and description are required');
        }

        const service = await Service.create({ title, description, icon, isActive, createdBy: req.user?.id });

        return handleResponse(res, 201, 'Service created successfully', service);
    } catch (error) {
        return handleError(res, error);
    }
};

export const getAllServices = async (req, res) => {
    try {
        const services = await Service.find();
        return handleResponse(res, 200, 'Services fetched successfully', services);
    } catch (error) {
        return handleError(res, error);
    }
};

export const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedService = await Service.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });

        if (!updatedService) {
            return handleResponse(res, 404, 'Service not found');
        }

        return handleResponse(res, 200, 'Service updated successfully', updatedService);
    } catch (error) {
        return handleError(res, error);
    }
};

export const deleteService = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedService = await Service.findByIdAndDelete(id);
        if (!deletedService) {
            return handleResponse(res, 404, 'Service not found');
        }

        return handleResponse(res, 200, 'Service deleted successfully');
    } catch (error) {
        return handleError(res, error);
    }
};
