import mongoose from 'mongoose';

const quickLinkSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Link name is required'], trim: true },
    link: { type: String, required: [true, 'Link URL is required'], trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const QuickLink = mongoose.model('QuickLink', quickLinkSchema);

export default QuickLink;
