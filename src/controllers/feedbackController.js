const feedbackController = {
  async submitFeedback(req, res) {
    try {
      const userId = req.user.userId;
      const { rating, content } = req.body;
      const { Feedback } = req.app.locals.db;

      // 创建反馈记录
      const feedback = await Feedback.create({
        user_id: userId,
        rating,
        content: content || null
      });

      res.status(201).json({
        success: true,
        message: 'Feedback submitted successfully',
        data: {
          feedback_id: feedback.feedback_id,
          rating: feedback.rating,
          content: feedback.content,
          created_at: feedback.created_at
        }
      });
    } catch (err) {
      console.error('Submit feedback error:', err);
      res.status(500).json({ error: 'Failed to submit feedback' });
    }
  },

  async getFeedback(req, res) {
    try {
      const userId = req.user.userId;
      const { Feedback } = req.app.locals.db;

      // 获取用户的反馈记录
      const feedback = await Feedback.findOne({
        where: { user_id: userId },
        order: [['created_at', 'DESC']]
      });

      if (!feedback) {
        return res.status(404).json({ 
          error: 'No feedback found',
          details: 'User has not submitted any feedback yet'
        });
      }

      res.json({
        success: true,
        data: {
          feedback_id: feedback.feedback_id,
          rating: feedback.rating,
          content: feedback.content,
          created_at: feedback.created_at
        }
      });
    } catch (err) {
      console.error('Get feedback error:', err);
      res.status(500).json({ error: 'Failed to get feedback' });
    }
  }
};

module.exports = feedbackController; 