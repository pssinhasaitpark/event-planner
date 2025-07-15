// middlewares/pdfGenerator.js
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure temp directory exists
const tempDir = path.join(__dirname, '..', 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Clean up old PDFs (keep only one)
const cleanupOldPDFs = () => {
    try {
        const files = fs.readdirSync(tempDir);
        files.forEach(file => {
            if (file.endsWith('.pdf')) {
                fs.unlinkSync(path.join(tempDir, file));
            }
        });
    } catch (error) {
        console.error('Error cleaning up old PDFs:', error);
    }
};

// Generate booking invoice
export const generateBookingInvoice = (data) => {
    return new Promise((resolve, reject) => {
        try {
            // Clean up old PDFs first
            cleanupOldPDFs();

            const doc = new PDFDocument({ 
                size: 'A4', 
                margins: { top: 50, bottom: 50, left: 50, right: 50 } 
            });

            const filename = `booking_invoice_${data.booking._id}_${Date.now()}.pdf`;
            const filepath = path.join(tempDir, filename);

            const stream = fs.createWriteStream(filepath);
            doc.pipe(stream);

            // Header
            doc.fontSize(20)
                .fillColor('#2c3e50')
                .text('EVENT BOOKING INVOICE', 50, 50, { align: 'center' })
                .moveDown();

            // Company Info
            doc.fontSize(14)
                .fillColor('#34495e')
                .text('Your Event Company', 50, 90)
                .fontSize(10)
                .fillColor('#7f8c8d')
                .text('123 Event Street, City, State 12345', 50, 110)
                .text('Phone: +91 1234567890 | Email: info@eventcompany.com', 50, 125)
                .moveDown();

            // Invoice Details Box
            doc.rect(50, 160, 495, 80)
                .stroke('#bdc3c7')
                .fillColor('#ecf0f1')
                .rect(50, 160, 495, 25)
                .fill();

            doc.fillColor('#2c3e50')
                .fontSize(12)
                .text('Invoice Details', 60, 170);

            // Invoice Info
            doc.fillColor('#34495e')
                .fontSize(10)
                .text(`Invoice Number: INV-${data.booking._id.toString().slice(-8).toUpperCase()}`, 60, 200)
                .text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 60, 215)
                .text(`Payment Status: ${data.booking.paymentStatus || 'Pending'}`, 300, 200)
                .text(`Booking ID: ${data.booking._id}`, 300, 215);

            // Customer Details
            doc.fillColor('#2c3e50')
                .fontSize(12)
                .text('Bill To:', 60, 260);

            doc.fillColor('#34495e')
                .fontSize(10)
                .text(`${data.user.name}`, 60, 280)
                .text(`${data.user.email}`, 60, 295)
                .moveDown();

            // Event Details Box
            doc.fillColor('#34495e')
                .rect(50, 330, 495, 25)
                .fill();

            doc.fillColor('#ffffff')
                .fontSize(12)
                .text('Event Details', 60, 340);

            // Event Information
            let currentY = 365;
            doc.fillColor('#34495e')
                .fontSize(10)
                .text(`Event: ${data.event.title}`, 60, currentY)
                .text(`Venue: ${data.event.venue}, ${data.event.city}`, 60, currentY + 15)
                .text(`Date: ${new Date(data.event.eventDate).toLocaleString()}`, 60, currentY + 30)
                .text(`Booking Date: ${new Date(data.booking.createdAt || Date.now()).toLocaleString()}`, 60, currentY + 45);

            // Payment Details
            const paymentTop = currentY + 80;
            doc.fillColor('#2c3e50')
                .fontSize(12)
                .text('Payment Details:', 60, paymentTop);

            doc.fillColor('#34495e')
                .fontSize(10)
                .text(`Amount: ₹${data.booking.totalAmount ? data.booking.totalAmount.toFixed(2) : '0.00'}`, 60, paymentTop + 20)
                .text(`Payment Method: ${data.booking.paymentMethod || 'N/A'}`, 60, paymentTop + 35)
                .text(`Transaction ID: ${data.booking.transactionId || 'N/A'}`, 60, paymentTop + 50);

            // Total Section
            const totalTop = paymentTop + 80;
            doc.fillColor('#2c3e50')
                .fontSize(14)
                .text('Total Amount:', 400, totalTop)
                .text(`₹${data.booking.totalAmount ? data.booking.totalAmount.toFixed(2) : '0.00'}`, 480, totalTop);

            // Footer
            doc.fontSize(8)
                .fillColor('#95a5a6')
                .text('Thank you for booking with us! Event details will be sent separately.', 50, 700, { align: 'center' })
                .text('For any queries, contact us at support@eventcompany.com', 50, 715, { align: 'center' });

            doc.end();

            stream.on('finish', () => {
                resolve(filepath);
            });

            stream.on('error', (error) => {
                reject(error);
            });

        } catch (error) {
            reject(error);
        }
    });
};

// Generate product invoice
export const generateProductInvoice = (orderData) => {
    return new Promise((resolve, reject) => {
        try {
            // Clean up old PDFs first
            cleanupOldPDFs();

            const doc = new PDFDocument({ 
                size: 'A4', 
                margins: { top: 50, bottom: 50, left: 50, right: 50 } 
            });

            const filename = `product_invoice_${orderData.order._id}_${Date.now()}.pdf`;
            const filepath = path.join(tempDir, filename);

            const stream = fs.createWriteStream(filepath);
            doc.pipe(stream);

            // Header
            doc.fontSize(20)
                .fillColor('#2c3e50')
                .text('PRODUCT INVOICE', 50, 50, { align: 'center' })
                .moveDown();

            // Company Info
            doc.fontSize(14)
                .fillColor('#34495e')
                .text('Your Store Name', 50, 90)
                .fontSize(10)
                .fillColor('#7f8c8d')
                .text('123 Store Street, City, State 12345', 50, 110)
                .text('Phone: +91 1234567890 | Email: info@store.com', 50, 125)
                .moveDown();

            // Invoice Details Box
            doc.rect(50, 160, 495, 80)
                .stroke('#bdc3c7')
                .fillColor('#ecf0f1')
                .rect(50, 160, 495, 25)
                .fill();

            doc.fillColor('#2c3e50')
                .fontSize(12)
                .text('Invoice Details', 60, 170);

            // Invoice Info
            doc.fillColor('#34495e')
                .fontSize(10)
                .text(`Invoice Number: INV-${orderData.order._id.toString().slice(-8).toUpperCase()}`, 60, 200)
                .text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 60, 215)
                .text(`Payment Status: ${orderData.order.paymentStatus}`, 300, 200)
                .text(`Order ID: ${orderData.order.razorpay_order_id || 'N/A'}`, 300, 215);

            // Customer Details
            doc.fillColor('#2c3e50')
                .fontSize(12)
                .text('Bill To:', 60, 260);

            doc.fillColor('#34495e')
                .fontSize(10)
                .text(`${orderData.user.name}`, 60, 280)
                .text(`${orderData.user.email}`, 60, 295)
                .moveDown();

            // Table Header
            const tableTop = 340;
            doc.fillColor('#34495e')
                .rect(50, tableTop, 495, 25)
                .fill();

            doc.fillColor('#ffffff')
                .fontSize(10)
                .text('Product', 60, tableTop + 8)
                .text('Quantity', 280, tableTop + 8)
                .text('Unit Price', 360, tableTop + 8)
                .text('Total', 480, tableTop + 8);

            // Table Rows
            let currentY = tableTop + 25;
            let subtotal = 0;

            orderData.products.forEach((item) => {
                const itemTotal = item.quantity * item.price;
                subtotal += itemTotal;

                doc.fillColor('#34495e')
                    .fontSize(10)
                    .text(item.product.name, 60, currentY + 8)
                    .text(`${item.quantity}`, 280, currentY + 8)
                    .text(`₹${item.price.toFixed(2)}`, 360, currentY + 8)
                    .text(`₹${itemTotal.toFixed(2)}`, 480, currentY + 8);

                // Draw row line
                doc.moveTo(50, currentY + 25)
                    .lineTo(545, currentY + 25)
                    .stroke('#bdc3c7');

                currentY += 25;
            });

            // Total Section
            const totalTop = currentY + 20;
            doc.fillColor('#2c3e50')
                .fontSize(12)
                .text('Subtotal:', 400, totalTop)
                .text(`₹${subtotal.toFixed(2)}`, 480, totalTop);

            doc.fontSize(12)
                .text('Tax (18% GST):', 400, totalTop + 20)
                .text(`₹${(subtotal * 0.18).toFixed(2)}`, 480, totalTop + 20);

            doc.fontSize(14)
                .text('Total Amount:', 400, totalTop + 45)
                .text(`₹${orderData.order.totalAmount.toFixed(2)}`, 480, totalTop + 45);

            // Footer
            doc.fontSize(8)
                .fillColor('#95a5a6')
                .text('Thank you for your purchase! Items will be delivered within 3-5 business days.', 50, 700, { align: 'center' })
                .text('For any queries, contact us at support@store.com', 50, 715, { align: 'center' });

            doc.end();

            stream.on('finish', () => {
                resolve(filepath);
            });

            stream.on('error', (error) => {
                reject(error);
            });

        } catch (error) {
            reject(error);
        }
    });
};

// Cleanup function to be called after sending file
export const cleanupPDF = (filepath) => {
    try {
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }
    } catch (error) {
        console.error('Error cleaning up PDF:', error);
    }
};