
// app/controllers/productController.js
import mongoose from 'mongoose';
import { Product, Category, ProductOrder } from '../../models/index.js';
import { handleResponse, handleError } from '../../utils/responseHandler.js';

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

export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = await Category.create({ name, description, createdBy: req.user?.id });
        return handleResponse(res, 201, 'Category created', category);
    } catch (error) {
        return handleError(res, error);
    }
};

export const getAllCategory = async (req, res) => {
    try {
        const categories = await Category.find();
        return handleResponse(res, 200, 'Categories fetched successfully', categories);
    } catch (error) {
        return handleError(res, error);
    }
};


export const placeOrder = async (req, res) => {
    try {
        const { products } = req.body; // [{ product, quantity }]
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

        const order = await ProductOrder.create({ user: req.user.id, products: items, totalAmount });

        return handleResponse(res, 201, 'Order placed successfully', order);
    } catch (error) {
        return handleError(res, error);
    }
};

export const getProductAnalytics = async (req, res) => {
    try {
        const match = {};
        if (req.query.productId) {
            match['products.product'] = new mongoose.Types.ObjectId(req.query.productId);
        }

        const analytics = await ProductOrder.aggregate([
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
        ]);

        return handleResponse(res, 200, 'Product analytics fetched', analytics);
    } catch (error) {
        return handleError(res, error);
    }
};


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

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const updated = await Category.findByIdAndUpdate(
            id,
            { name, description },
            { new: true }
        );
        if (!updated) return handleResponse(res, 404, 'Category not found');
        return handleResponse(res, 200, 'Category updated successfully', updated);
    } catch (error) {
        return handleError(res, error);
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('category');
        return handleResponse(res, 200, 'Products fetched successfully', products);
    } catch (error) {
        return handleError(res, error);
    }
};

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