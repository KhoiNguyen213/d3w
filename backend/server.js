import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { initRAG, generateAdvice } from './rag.js';
import Room from './models/Room.js';
import Conclusion from './models/Conclusion.js';

dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected');
    } else {
      console.log('Warning: MONGODB_URI is not defined. Database features will fail.');
    }
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};
connectDB();

// Khởi tạo RAG System
initRAG();

// Khởi động Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ==========================================
// API ENDPOINTS
// ==========================================

// Endpoint phân tích từng câu hỏi (Sinh lời khuyên AI)
app.post('/api/analyze-understanding', async (req, res) => {
  const { question, parentAns, parentEmo, childAns, childEmo } = req.body;

  if (!question || !parentAns || !childAns) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const adviceHTML = await generateAdvice(question, parentAns, parentEmo, childAns, childEmo);
    res.json({ adviceHTML });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate AI advice' });
  }
});

// (Tuỳ chọn: Endpoint lưu dữ liệu chat, lưu phòng, v.v. - Các endpoint này sẽ được gọi nếu React muốn chuyển quản lý state hoàn toàn xuống DB thay vì localStorage. Hiện tại hệ thống ưu tiên giữ local storage và gọi AI API).

// Endpoint để lưu lại kết luận vĩnh viễn vào DB
app.post('/api/conclusions', async (req, res) => {
  try {
    const newConclusion = new Conclusion(req.body);
    await newConclusion.save();
    res.status(201).json({ success: true, data: newConclusion });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lưu kết luận' });
  }
});
