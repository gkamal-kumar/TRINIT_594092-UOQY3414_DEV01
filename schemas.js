const Joi = require('joi');

module.exports.campsSchema = Joi.object({
    camps: Joi.object({
        name: Joi.string().min(3).max(30).required(),
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
        password: Joi.string().min(3).max(20).required(),
        phoneNumber: Joi.number(),
        description: Joi.string().required(),
        address: Joi.string().required()
    })
});

module.exports.UserSchema = Joi.object({
    User: Joi.object({
        name: Joi.string().alphanum().min(3).max(30).required(),
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
        password: Joi.string().min(3).max(20).required(),
        phoneNumber: Joi.number(),
        description: Joi.string().required(),
        address: Joi.string().required()
    }).required()
});