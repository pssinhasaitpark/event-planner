import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
    title: { type: String, required: [true, 'Service title is required'], trim: true },
    description: { type: String, required: [true, 'Service description is required'], trim: true },
    icon: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Service = mongoose.model('Service', serviceSchema);

export default Service;
