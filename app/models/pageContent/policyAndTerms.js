import mongoose from 'mongoose';

const policySchema = new mongoose.Schema({
    type: { type: String, enum: ['terms', 'privacy', 'about'], required: [true, 'Policy type is required'], unique: true, lowercase: true, trim: true },
    content: { type: String, required: [true, 'Policy content is required'], trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Policy = mongoose.model('Policy', policySchema);

export default Policy;
