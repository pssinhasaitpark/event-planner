import { Policy } from '../../models/index.js';
import { handleResponse, handleError } from '../../utils/responseHandler.js';

export const upsertPolicy = async (req, res) => {
    try {
        const { type, content } = req.body;
        const createdBy = req.user?.id;

        if (!type || !content) {
            return handleResponse(res, 400, 'Type and content are required');
        }

        const policyType = type.toLowerCase();
        const existing = await Policy.findOne({ type: policyType });

        let updatedPolicy;
        if (existing) {
            existing.content = content;
            updatedPolicy = await existing.save();
        } else {
            updatedPolicy = await Policy.create({ type: policyType, content, createdBy });
        }

        return handleResponse(res, 200, 'Policy saved successfully', updatedPolicy);
    } catch (error) {
        return handleError(res, error);
    }
};

export const getPolicyByType = async (req, res) => {
    try {
        const { type } = req.params;
        const policyType = type.toLowerCase();

        const policy = await Policy.findOne({ type: policyType });
        if (!policy) return handleResponse(res, 404, 'Policy not found');

        return handleResponse(res, 200, 'Policy fetched', policy);
    } catch (error) {
        return handleError(res, error);
    }
};
