import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  mobile: Joi.string()
  .pattern(/^[0-9]{10}$/)  
  .required()
  .messages({
    'string.pattern.base': 'Mobile number must be exactly 10 digits.',
    'string.empty': 'Mobile number is required.',
  }),
  role: Joi.string().valid('user', 'admin').optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const resetSchema = Joi.object({
  newPassword: Joi.string().min(6).required(),
  confirmPassword: Joi.ref('newPassword')
});

export const forgetSchema = Joi.object({
  email: Joi.string().email().required()
});
