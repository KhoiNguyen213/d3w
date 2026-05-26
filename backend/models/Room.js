import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Frontend uses 'id' instead of 'roomId'
  name: { type: String, required: true },
  password: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['waiting', 'quiz', 'review', 'completed'], 
    default: 'waiting' 
  },
  
  // Quyền làm chủ phòng
  creatorName: { type: String, required: true },
  
  // Danh sách thành viên (lưu động bằng JSON)
  members: { type: [mongoose.Schema.Types.Mixed], default: [] },
  
  // Dữ liệu bài test
  compiledQuestions: { type: [mongoose.Schema.Types.Mixed], default: [] },
  currentReviewIndex: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Room', roomSchema);
