import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['waiting', 'quiz', 'review', 'completed'], 
    default: 'waiting' 
  },
  
  // Thành viên
  creatorName: { type: String, required: true },
  creatorRole: { type: String, enum: ['parent', 'child'], required: true },
  joinerName: { type: String },
  joinerRole: { type: String, enum: ['parent', 'child'] },
  
  // Dữ liệu bài test
  compiledQuestions: [{
    text: String,
    creator: String
  }],
  
  answers: {
    creator: { type: Map, of: new mongoose.Schema({ text: String, emotion: String }, { _id: false }) },
    joiner: { type: Map, of: new mongoose.Schema({ text: String, emotion: String }, { _id: false }) }
  },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Room', roomSchema);
