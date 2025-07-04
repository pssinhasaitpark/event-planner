import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
    question: { type: String, required: [true, 'Question is required'], trim: true },
    answer: { type: String, required: [true, 'Answer is required'], trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const FAQ = mongoose.model('FAQ', faqSchema);

export default FAQ;
