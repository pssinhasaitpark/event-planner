    // app/models/event/Event.js
    import mongoose from 'mongoose';


    const eventSchema = new mongoose.Schema({
        title: { type: String, require: true },
        description: { type: String, require: true },
        banner: { type: String },
        gallery: [{ type: String }],
        video: { type: String },
        city: { type: String },
        eventDate: { type: Date, required: true },
        eventTime: { type: String, required: true },
        duration: { type: String, required: true },

        location: {
            address: { type: String, required: true },
            gmapLink: { type: String },
        },

        ageLimit: {
            ticketsNeededFor: { type: String, default: '8 yrs & above' },
            entryAllowedFor: { type: String, default: '8 yrs & above' },
        },

        layout: { type: String, enum: ['Indoor', 'Outdoor'], default: 'Indoor' },
        seating: { type: String, enum: ['Seated', 'Standing'], default: 'Seated' },
        kidFriendly: { type: Boolean, default: false },
        petFriendly: { type: Boolean, default: false },

        prohibitedItems: [{ type: String }],

        instructions: { type: String },
        termsAndConditions: { type: String },
        faq: [{ question: String, answer: String }],

        ticketCategories: [{
            name: { type: String, required: true },
            price: { type: Number, required: true },
            perks: [{ type: String }],
            totalQuantity: { type: Number, required: true },
            remainingQuantity: { type: Number, required: true },
        }],

        artists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artist' }],

        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }, { timestamps: true });

    const Event = mongoose.model('Event', eventSchema);
    export default Event;
