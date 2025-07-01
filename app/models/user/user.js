// app/models/user/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  mobile: Number,
  role: { type: String, enum: ['user', 'admin'], default: 'user', },
},
  {
    timestamps: true,
  });

const User = mongoose.model("User", userSchema);
export default User;
