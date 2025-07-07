// controllers/productController.js
import mongoose from 'mongoose';
import crypto from 'crypto';
import { Product, Category, ProductOrder } from '../../models/index.js';
import { handleResponse, handleError } from '../../utils/responseHandler.js';
import { razorpay } from '../../middlewares/razorpayInstance.js';

// Create Product
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, category } = req.body;
        const images = req.convertedFiles?.images || [];

        const newProduct = await Product.create({ name, description, price, stock, images, category, createdBy: req.user?.id });

        return handleResponse(res, 201, 'Product created successfully', newProduct);
    } catch (error) {
        return handleError(res, error);
    }
};

// Get All Products with Filters and Pagination
export const getAllProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, minPrice, maxPrice, category, inStock } = req.query;

        const query = {};

        if (search) query.name = { $regex: search, $options: 'i' };
        if (category) query.category = category;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }
        if (inStock === 'true') query.stock = { $gt: 0 };

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Product.countDocuments(query);

        const products = await Product.find(query)
            .populate('category')
            .skip(skip)
            .limit(parseInt(limit));

        return handleResponse(res, 200, 'Products fetched successfully', {
            products,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        return handleError(res, error);
    }
};

// Get Single Product
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id).populate('category');
        if (!product) return handleResponse(res, 404, 'Product not found');
        return handleResponse(res, 200, 'Product fetched successfully', product);
    } catch (error) {
        return handleError(res, error);
    }
};

// Update Product
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const newImages = req.convertedFiles?.images || [];

        const product = await Product.findById(id);
        if (!product) return handleResponse(res, 404, 'Product not found');

        const updatedData = {
            name: updates.name ?? product.name,
            description: updates.description ?? product.description,
            price: updates.price ?? product.price,
            stock: updates.stock ?? product.stock,
            category: updates.category ?? product.category,
            images: newImages.length > 0 ? newImages : product.images
        };

        const updated = await Product.findByIdAndUpdate(id, updatedData, { new: true });
        return handleResponse(res, 200, 'Product updated successfully', updated);
    } catch (error) {
        return handleError(res, error);
    }
};

// Delete Product
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Product.findByIdAndDelete(id);
        if (!deleted) return handleResponse(res, 404, 'Product not found');
        return handleResponse(res, 200, 'Product deleted successfully');
    } catch (error) {
        return handleError(res, error);
    }
};

// Create Category
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = await Category.create({ name, description, createdBy: req.user?.id });
        return handleResponse(res, 201, 'Category created', category);
    } catch (error) {
        return handleError(res, error);
    }
};

// Get All Categories
export const getAllCategory = async (req, res) => {
    try {
        const categories = await Category.find();
        return handleResponse(res, 200, 'Categories fetched successfully', categories);
    } catch (error) {
        return handleError(res, error);
    }
};

// Get Category By ID
export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id);
        if (!category) return handleResponse(res, 404, 'Category not found');
        return handleResponse(res, 200, 'Category fetched successfully', category);
    } catch (error) {
        return handleError(res, error);
    }
};

// Update Category
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const updated = await Category.findByIdAndUpdate(id, { name, description }, { new: true });
        if (!updated) return handleResponse(res, 404, 'Category not found');
        return handleResponse(res, 200, 'Category updated successfully', updated);
    } catch (error) {
        return handleError(res, error);
    }
};

// Create Razorpay Order
export const createRazorpayOrder = async (req, res) => {
    try {
        const { amount } = req.body;

        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `order_rcptid_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        return handleResponse(res, 200, 'Razorpay order created', order);
    } catch (error) {
        return handleError(res, error);
    }
};

// Verify Razorpay Payment and Place Order
export const verifyAndPlaceOrder = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, products } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return handleResponse(res, 400, 'Payment verification failed');
        }

        let totalAmount = 0;
        const items = [];

        for (const item of products) {
            const product = await Product.findById(item.product);
            if (!product || product.stock < item.quantity) {
                return handleResponse(res, 400, 'Product not available or insufficient stock');
            }

            product.stock -= item.quantity;
            await product.save();

            items.push({ product: product._id, quantity: item.quantity, price: product.price });
            totalAmount += product.price * item.quantity;
        }

        const order = await ProductOrder.create({
            user: req.user.id,
            products: items,
            totalAmount,
            razorpay_order_id,
            razorpay_payment_id
        });

        return handleResponse(res, 201, 'Order placed successfully', order);
    } catch (error) {
        return handleError(res, error);
    }
};

// Place Order (Manual Success for COD/Test)
export const placeOrder = async (req, res) => {
    try {
        const { products } = req.body;
        let totalAmount = 0;
        const items = [];

        for (const item of products) {
            const product = await Product.findById(item.product);
            if (!product || product.stock < item.quantity) {
                return handleResponse(res, 400, 'Product not available or insufficient stock');
            }

            product.stock -= item.quantity;
            await product.save();

            items.push({ product: product._id, quantity: item.quantity, price: product.price });
            totalAmount += product.price * item.quantity;
        }

        const order = await ProductOrder.create({
            user: req.user.id,
            products: items,
            totalAmount,
            paymentStatus: 'Success'
        });

        return handleResponse(res, 201, 'Order placed successfully (COD/Test)', order);
    } catch (error) {
        return handleError(res, error);
    }
};

// Get All Orders
export const getAllOrders = async (req, res) => {
    try {
        const orders = await ProductOrder.find();
        return handleResponse(res, 200, 'Orders fetched successfully', orders);
    } catch (error) {
        return handleError(res, error);
    }
};

// Product Analytics
export const getProductAnalytics = async (req, res) => {
    try {
        const { productId, month, year, startDate, endDate, page = 1, limit = 10 } = req.query;

        const match = {};

        if (productId) {
            match['products.product'] = new mongoose.Types.ObjectId(productId);
        }

        // Date filtering logic
        if (month && year) {
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 1);
            match.createdAt = { $gte: start, $lt: end };
        } else if (year) {
            const start = new Date(year, 0, 1);
            const end = new Date(Number(year) + 1, 0, 1);
            match.createdAt = { $gte: start, $lt: end };
        } else if (startDate && endDate) {
            match.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const parsedLimit = parseInt(limit);

        const basePipeline = [
            { $match: match },
            { $unwind: '$products' },
            {
                $group: {
                    _id: '$products.product',
                    totalSold: { $sum: '$products.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$products.quantity', '$products.price'] } },
                    orders: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: '$productDetails' },
            {
                $project: {
                    _id: 0,
                    productId: '$productDetails._id',
                    name: '$productDetails.name',
                    totalSold: 1,
                    totalRevenue: 1,
                    orders: 1
                }
            },
            { $sort: { totalSold: -1 } }
        ];

        const totalResult = await ProductOrder.aggregate([...basePipeline]);
        const paginatedResult = await ProductOrder.aggregate([
            ...basePipeline,
            { $skip: skip },
            { $limit: parsedLimit }
        ]);

        return handleResponse(res, 200, 'Product analytics fetched', {
            total: totalResult.length,
            page: parseInt(page),
            totalPages: Math.ceil(totalResult.length / parsedLimit),
            data: paginatedResult
        });
    } catch (error) {
        return handleError(res, error);
    }
};
