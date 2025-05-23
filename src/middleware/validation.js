const { ValidationError } = require('joi');
const config = require('../../config/config');

module.exports = {
  validate(schema) {
    return (req, res, next) => {
      try {
        const { error, value } = schema.validate(req.body, {
          abortEarly: false,
          stripUnknown: true
        });

        if (error) {
          const errors = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }));
          return res.status(400).json({ errors });
        }

        // Replace body with validated values
        req.body = value;
        next();
      } catch (err) {
        console.error('Validation error:', err);
        res.status(500).json({ error: 'Validation failed' });
      }
    };
  }
};