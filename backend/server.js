import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { initRAG, generateAdvice } from "./rag.js";
import Room from "./models/Room.js";
import Conclusion from "./models/Conclusion.js";
import User from "./models/User.js";

if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = "mongodb://localhost:27017/d3w";
}

const app = express();
app.use(cors());
app.use(express.json());

// Tạo HTTP server từ Express app để gắn WebSocket
const server = http.createServer(app);

// Tạo WebSocket Server gắn vào HTTP server, path /ws/rooms
const wss = new WebSocketServer({ server, path: "/ws/rooms" });

// Hàm broadcast dữ liệu phòng tới tất cả client đang kết nối
const broadcastRooms = async () => {
  try {
    const rooms = await Room.find({});
    const message = JSON.stringify({ type: "rooms", rooms });
    wss.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message);
      }
    });
  } catch (err) {
    console.error("Lỗi broadcast rooms:", err);
  }
};

// Khi client mới kết nối, gửi danh sách phòng hiện tại
wss.on("connection", async (ws) => {
  console.log("WebSocket client connected");
  try {
    const rooms = await Room.find({});
    ws.send(JSON.stringify({ type: "rooms", rooms }));
  } catch (err) {
    console.error("Lỗi gửi rooms cho client mới:", err);
  }
  ws.on("close", () => {
    console.log("WebSocket client disconnected");
  });
});

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

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT} (HTTP + WebSocket)`);
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
// API PHÒNG (ROOM) - MONGODB
// ==========================================

// 1. Lấy danh sách tất cả các phòng (để Frontend tải vào biến `rooms`)
app.get("/api/rooms", async (req, res) => {
  try {
    const rooms = await Room.find({});
    res.json({ success: true, data: rooms });
  } catch (error) {
    console.error("Lỗi lấy danh sách phòng:", error);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
});

// 2. Tạo hoặc ghi đè toàn bộ một phòng (Dùng chung cho tạo và join để đơn giản hóa theo logic Frontend hiện tại)
app.post("/api/rooms", async (req, res) => {
  try {
    const roomData = req.body;
    
    if (!roomData.id) {
      return res.status(400).json({ error: "Thiếu ID phòng" });
    }

    // Upsert: cập nhật nếu tồn tại, tạo mới nếu chưa
    const savedRoom = await Room.findOneAndUpdate(
      { id: roomData.id },
      { $set: roomData },
      { new: true, upsert: true }
    );
    
    res.status(201).json({ success: true, data: savedRoom });
    // Broadcast cập nhật phòng tới tất cả client qua WebSocket
    broadcastRooms();
  } catch (error) {
    console.error("Lỗi lưu phòng:", error);
    res.status(500).json({ error: "Lỗi máy chủ khi lưu phòng" });
  }
});

// 3. Lấy thông tin 1 phòng
app.get("/api/rooms/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findOne({ id });
    if (!room) {
      return res.status(404).json({ error: "Không tìm thấy phòng" });
    }
    res.json({ success: true, data: room });
  } catch (error) {
    console.error("Lỗi lấy thông tin phòng:", error);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
});

// 4. Cập nhật phòng (trạng thái, thành viên, câu hỏi)
app.put("/api/rooms/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body; 
    
    const room = await Room.findOneAndUpdate(
      { id },
      { $set: updateData },
      { new: true }
    );
    
    if (!room) {
      return res.status(404).json({ error: "Không tìm thấy phòng để cập nhật" });
    }
    
    res.json({ success: true, data: room });
    // Broadcast cập nhật phòng tới tất cả client qua WebSocket
    broadcastRooms();
  } catch (error) {
    console.error("Lỗi cập nhật phòng:", error);
    res.status(500).json({ error: "Lỗi máy chủ khi cập nhật phòng" });
  }
});

// ==========================================
// API AUTHENTICATION (ĐĂNG KÝ, ĐĂNG NHẬP)
// ==========================================

// Endpoint nhẹ để background refresh profile (không cần password)
app.get("/api/auth/profile-refresh", async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: "Email là bắt buộc." });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy tài khoản." });
    }
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
        emotionLogs: user.emotionLogs,
        challengeProgress: user.challengeProgress,
        savedConclusions: user.savedConclusions,
      },
    });
  } catch (error) {
    console.error("Lỗi profile refresh:", error);
    res.status(500).json({ error: "Lỗi máy chủ." });
  }
});

// 1. Đăng ký tài khoản
app.post("/api/auth/register", async (req, res) => {
  const { email, password, name } = req.body;

  console.log("REGISTER BODY:", req.body);

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
    console.error("REGISTER ERROR:", error);

    res.status(500).json({
      error: error.message,
    });
  }
});

// 2. Đăng nhập
// app.post("/api/auth/login", async (req, res) => {
//   console.log("LOGIN BODY:", req.body);

//   const { email, password } = req.body;
//   if (!email || !password) {
//     return res.status(400).json({ error: "Vui lòng nhập Email và Mật khẩu." });
//   }

//   try {
//     const user = await User.findOne({ email });
//     if (!user || user.password !== password) {
//       return res
//         .status(401)
//         .json({ error: "Tài khoản hoặc mật khẩu không chính xác." });
//     }

//     // Trả về thông tin không chứa mật khẩu (có thể tạo JWT token nhưng đơn giản thì trả object)
//     res.json({
//       success: true,
//       user: {
//         email: user.email,
//         name: user.name,
//         mascot: user.mascot,
//         mascotName: user.mascotName,
//         age: user.age,
//         gender: user.gender,
//         birthday: user.birthday,
//       },
//     });
//   } catch (error) {
//     console.error("Lỗi đăng nhập:", error);
//     res.status(500).json({ error: "Đã xảy ra lỗi trên máy chủ." });
//   }
// });
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("BODY:", req.body);

    const user = await User.findOne({ email });

    console.log("USER:", user);

    if (!user || user.password !== password) {
      return res.status(401).json({
        error: "Sai tài khoản hoặc mật khẩu",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      error: error.message,
    });
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
        emotionLogs: user.emotionLogs,
        challengeProgress: user.challengeProgress,
        savedConclusions: user.savedConclusions
      },
    });
  } catch (error) {
    console.error("Lỗi cập nhật profile:", error);
    res.status(500).json({ error: "Đã xảy ra lỗi trên máy chủ." });
  }
});

// 4. Đồng bộ dữ liệu cá nhân (Nhật ký, Thử thách, Lưu trữ)
app.put("/api/auth/sync", async (req, res) => {
  const { email, emotionLogs, challengeProgress, savedConclusions } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email là bắt buộc để đồng bộ." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy tài khoản." });
    }

    if (emotionLogs !== undefined) user.emotionLogs = emotionLogs;
    if (challengeProgress !== undefined) user.challengeProgress = challengeProgress;
    if (savedConclusions !== undefined) user.savedConclusions = savedConclusions;

    await user.save();

    res.json({ success: true, message: "Đồng bộ thành công." });
  } catch (error) {
    console.error("Lỗi đồng bộ dữ liệu:", error);
    res.status(500).json({ error: "Đã xảy ra lỗi máy chủ khi đồng bộ." });
  }
});
