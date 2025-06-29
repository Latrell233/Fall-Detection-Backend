const Joi = require('joi');

const submitFeedbackSchema = Joi.object({
  body: Joi.object({
    rating: Joi.number().integer().min(0).max(5).required().messages({
      'any.required': 'Rating is required',
      'number.base': 'Rating must be a number',
      'number.integer': 'Rating must be an integer',
      'number.min': 'Rating must be at least 0',
      'number.max': 'Rating must be at most 5'
    }),
    content: Joi.string().max(1000).optional().messages({
      'string.max': 'Content must be at most 1000 characters'
    })
  })
});

module.exports = {
  submitFeedbackSchema
}; 