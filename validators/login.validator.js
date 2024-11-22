import Joi from "joi";

export const loginValidator = Joi.object({
  username: Joi.string().required().max(40),
  password: Joi.string().required().min(8).max(30),
});
