import mongoose from 'mongoose';

const conclusionSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  roomName: { type: String },
  userEmail: { type: String, required: true },
  
  creatorName: String,
  joinerName: String,
  creatorRole: String,
  joinerRole: String,
  
  score: { type: Number, default: 0 },
  
  compiledQuestions: [{
    text: String,
    creator: String
  }],
  
  answers: {
    creator: { type: Map, of: new mongoose.Schema({ text: String, emotion: String }, { _id: false }) },
    joiner: { type: Map, of: new mongoose.Schema({ text: String, emotion: String }, { _id: false }) }
  },
  
  aiAdvice: [{
    questionIndex: Number,
    adviceHTML: String
  }],

  finalAdvice: {
    parentAdvice: [String],
    childAdvice: [String]
  },

  savedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Conclusion', conclusionSchema);
