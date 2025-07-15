import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { handleResponse } from "../utils/responseHandler.js";

export const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return handleResponse(res, 401, "No token, access denied", null, true);

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded.id).select("id role");
    if (!user) return handleResponse(res, 401, "Invalid token user", null, true);

    req.user = {
      id: user._id.toString(),
      role: user.role
    };

    next();
  } catch (err) {
    return handleResponse(res, 401, "Login required to view result", null, true);
  }
};

export const signToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
};

export const signResetToken = (email) => {
  return jwt.sign({ email }, process.env.RESET_TOKEN_SECRET, { expiresIn: '1h' });
};

export const verifyResetToken = (token) => {
  return jwt.verify(token, process.env.RESET_TOKEN_SECRET);
};


export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      // Fetch full user from DB
      const user = await User.findById(decoded.id).select("age gender profession");
      req.user = user || null;
    } catch {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  console.log("req.user?.role",req.user?.role);
  
  if (req.user?.role !== 'admin') {
    return handleResponse(res, 403, 'Access denied', null, true);
  }
  next();
};