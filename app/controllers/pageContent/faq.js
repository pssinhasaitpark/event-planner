import { FAQ } from '../../models/index.js';
import { handleResponse, handleError } from '../../utils/responseHandler.js';

export const createFAQ = async (req, res) => {
    try {
        const { question, answer } = req.body;
        const createdBy = req.user?.id;

        if (!question || !answer) {
            return handleResponse(res, 400, 'Question and answer are required');
        }

        const faq = await FAQ.create({ question, answer, createdBy });
        return handleResponse(res, 201, 'FAQ created successfully', faq);
    } catch (error) {
        return handleError(res, error);
    }
};

export const getAllFAQs = async (req, res) => {
    try {
        const faqs = await FAQ.find().sort({ createdAt: -1 });
        return handleResponse(res, 200, 'FAQs retrieved successfully', faqs);
    } catch (error) {
        return handleError(res, error);
    }
};

export const deleteFAQ = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedFAQ = await FAQ.findByIdAndDelete(id);

        if (!deletedFAQ) {
            return handleResponse(res, 404, 'FAQ not found');
        }

        return handleResponse(res, 200, 'FAQ deleted successfully');
    } catch (error) {
        return handleError(res, error);
    }
};
