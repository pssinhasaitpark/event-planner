// app/controllers/index.js
import * as userController from './user/user.js';
import * as eventController from './events/event.js';
import * as listController from './lists/artiste.js';
import * as bookingController from './bookings/booking.js';
import * as productController from './products/product.js';
import * as faqController from './pageContent/faq.js';
import * as policyController from './pageContent/policyAndTerms.js';
import * as quickLinkController from './pageContent/quickLink.js';
import * as ourServicesController from './ourServices/ourServices.js';

export {
    userController,
    eventController,
    listController,
    bookingController,
    productController,
    faqController,
    policyController,
    quickLinkController,
    ourServicesController,
};
