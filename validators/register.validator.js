import Joi from 'joi';

export const registerValidator = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  firstName: Joi.string().min(3).max(30).required(),
  lastName: Joi.string().min(3).max(30).required(),
  phone: Joi.string().pattern(new RegExp('^[0-9]{10}$')).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
  birthdate: Joi.date().iso().default(new Date().toISOString()),
  address: Joi.string().default('bursa/nilüfer/çekirge'),
  city: Joi.string().default('İstanbul'),
  state: Joi.string().default('Türkiye'),
  postalCode: Joi.string().default('16000'),
});

export const passwordValidator = Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required();

