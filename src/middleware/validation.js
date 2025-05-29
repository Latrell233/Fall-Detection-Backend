const { ValidationError } = require('joi');
const config = require('../../config/config');

module.exports = {
  validate(schema) {
    return (req, res, next) => {
      try {
        // 构建完整的验证对象
        const validationObject = {
          params: req.params,
          query: req.query,
          body: req.body
        };

        const { error, value } = schema.validate(validationObject, {
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

        // 更新请求对象
        req.params = value.params || req.params;
        req.query = value.query || req.query;
        req.body = value.body || req.body;
        
        next();
      } catch (err) {
        console.error('Validation error:', err);
        res.status(500).json({ error: 'Validation failed' });
      }
    };
  }
};