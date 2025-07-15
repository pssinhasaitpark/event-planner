// app/controllers/index.js
import * as userController from './user/user.js';
import * as authController from './user/auth.js';
import * as eventController from './events/event.js';
import * as listController from './lists/artiste.js';
import * as bookingController from './bookings/booking.js';
import * as productController from './products/product.js';
import * as faqController from './pageContent/faq.js';
import * as policyController from './pageContent/policyAndTerms.js';
import * as quickLinkController from './pageContent/quickLink.js';
import * as ourServicesController from './ourServices/ourServices.js';
import * as galleryController from './pageContent/gallery.js';

export {
    authController,
    userController,
    eventController,
    listController,
    bookingController,
    productController,
    faqController,
    policyController,
    quickLinkController,
    ourServicesController,
    galleryController,
};
