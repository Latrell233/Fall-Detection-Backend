const { Router } = require('express');
const router = Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../../middleware/auth');
const { validate } = require('../../middleware/validation');
const { uploadSchema } = require('../../validation/mediaSchemas');

// 配置文件存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      // 创建临时目录
      const tempPath = path.join(__dirname, '../../../uploads/temp');
      fs.mkdirSync(tempPath, { recursive: true });
      cb(null, tempPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 限制50MB
  }
});

// 文件上传
router.post('/upload',
  authenticate,
  upload.single('file'),
  validate(uploadSchema),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const type = req.body.type || 'images';
      const deviceId = req.body.device_id;
      
      if (!deviceId) {
        // 删除临时文件
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'Device ID is required' });
      }

      // 构建目标目录
      const targetDir = path.join(__dirname, '../../../uploads', type, deviceId);
      fs.mkdirSync(targetDir, { recursive: true });

      // 构建目标文件路径
      const targetPath = path.join(targetDir, req.file.filename);
      
      // 移动文件
      fs.renameSync(req.file.path, targetPath);

      // 构建文件路径（使用相对路径）
      const filePath = `/${type}/${deviceId}/${req.file.filename}`;
      
      res.json({
        success: true,
        data: {
          path: filePath,
          size: req.file.size,
          type: type
        }
      });
    } catch (error) {
      // 如果出错，删除临时文件
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      console.error('File upload error:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  }
);

// 获取文件
router.get('/:type/:deviceId/:filename',
  authenticate,
  async (req, res) => {
    try {
      const { type, deviceId, filename } = req.params;
      const filePath = path.join(__dirname, '../../../uploads', type, deviceId, filename);
      
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      // 设置正确的 Content-Type
      const ext = path.extname(filename).toLowerCase();
      const contentType = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm'
      }[ext] || 'application/octet-stream';
      
      res.setHeader('Content-Type', contentType);
      res.sendFile(filePath);
    } catch (error) {
      console.error('Get file error:', error);
      res.status(500).json({ error: 'Failed to get file' });
    }
  }
);

module.exports = router; 