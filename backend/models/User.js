import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: String,
    default: "",
  },
  gender: {
    type: String,
    default: "",
  },
  birthday: {
    type: String,
    default: "",
  },
  mascot: {
    type: String,
    default: "🦊",
  },
  mascotName: {
    type: String,
    default: "Khách",
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
