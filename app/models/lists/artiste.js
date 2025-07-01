// app/models/artist/Artist.js
import mongoose from 'mongoose';

const artistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Artist = mongoose.model('Artist', artistSchema);
export default Artist;
