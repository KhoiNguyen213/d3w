import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { initRAG, generateAdvice } from "./rag.js";
import Room from "./models/Room.js";
import Conclusion from "./models/Conclusion.js";
import User from "./models/User.js";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);
app.use(express.json());

// Kết nối MongoDB
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("MongoDB connected");
    } else {
      console.log(
        "Warning: MONGODB_URI is not defined. Database features will fail.",
      );
    }
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
};
connectDB();

// Khởi tạo RAG System
// initRAG();

// Khởi động Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

// ==========================================
// API ENDPOINTS
// ==========================================

// Endpoint phân tích từng câu hỏi (Sinh lời khuyên AI)
app.post("/api/analyze-understanding", async (req, res) => {
  const { question, parentAns, parentEmo, childAns, childEmo } = req.body;

  if (!question || !parentAns || !childAns) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const adviceHTML = await generateAdvice(
      question,
      parentAns,
      parentEmo,
      childAns,
      childEmo,
    );
    res.json({ adviceHTML });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate AI advice" });
  }
});

// (Tuỳ chọn: Endpoint lưu dữ liệu chat, lưu phòng, v.v. - Các endpoint này sẽ được gọi nếu React muốn chuyển quản lý state hoàn toàn xuống DB thay vì localStorage. Hiện tại hệ thống ưu tiên giữ local storage và gọi AI API).

// Endpoint để lưu lại kết luận vĩnh viễn vào DB
app.post("/api/conclusions", async (req, res) => {
  try {
    const newConclusion = new Conclusion(req.body);
    await newConclusion.save();
    res.status(201).json({ success: true, data: newConclusion });
  } catch (err) {
    res.status(500).json({ error: "Lỗi lưu kết luận" });
  }
});

// ==========================================
// API AUTHENTICATION (ĐĂNG KÝ, ĐĂNG NHẬP)
// ==========================================

// 1. Đăng ký tài khoản
app.post("/api/auth/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Vui lòng điền đầy đủ thông tin." });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: "Email này đã tồn tại trong hệ thống. Vui lòng đăng nhập.",
      });
    }

    const newUser = new User({ email, password, name });
    await newUser.save();

    res.status(201).json({ success: true, message: "Đăng ký thành công." });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ error: "Đã xảy ra lỗi trên máy chủ." });
  }
});

// 2. Đăng nhập
app.post("/api/auth/login", async (req, res) => {
  console.log("LOGIN BODY:", req.body);

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Vui lòng nhập Email và Mật khẩu." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res
        .status(401)
        .json({ error: "Tài khoản hoặc mật khẩu không chính xác." });
    }

    // Trả về thông tin không chứa mật khẩu (có thể tạo JWT token nhưng đơn giản thì trả object)
    res.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        mascot: user.mascot,
        mascotName: user.mascotName,
        age: user.age,
        gender: user.gender,
        birthday: user.birthday,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ error: "Đã xảy ra lỗi trên máy chủ." });
  }
});

// 3. Cập nhật hồ sơ (Profile)
app.put("/api/auth/profile", async (req, res) => {
  const { email, name, age, gender, birthday, mascot, mascotName, password } =
    req.body;

  if (!email || !name) {
    return res
      .status(400)
      .json({ error: "Email và Tên hiển thị là bắt buộc." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy tài khoản." });
    }

    user.name = name;
    user.age = age || user.age;
    user.gender = gender || user.gender;
    user.birthday = birthday || user.birthday;
    user.mascot = mascot || user.mascot;
    user.mascotName = mascotName || user.mascotName;

    if (password && password.trim() !== "") {
      user.password = password;
    }

    await user.save();

    res.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        mascot: user.mascot,
        mascotName: user.mascotName,
        age: user.age,
        gender: user.gender,
        birthday: user.birthday,
      },
    });
  } catch (error) {
    console.error("Lỗi cập nhật profile:", error);
    res.status(500).json({ error: "Đã xảy ra lỗi trên máy chủ." });
  }
});
