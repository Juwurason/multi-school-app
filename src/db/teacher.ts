import mongoose from "mongoose"

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School", // Reference the School model
    required: true,
  },
  
  // Other teacher-related fields...
  
});

module.exports = mongoose.model("Teacher", teacherSchema);
