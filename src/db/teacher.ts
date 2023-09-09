import mongoose, { Document, Model, Schema } from 'mongoose';

// Define the Teacher schema
export interface ITeacher extends Document {
  name: string;
  lastName: string;
  address: string;
  phoneNumber: string;
  email: string;
  gender: string;
  teacherClass: string;
  staffId: string;
  school: Schema.Types.ObjectId; 
}

const teacherSchema: Schema = new Schema<ITeacher>({
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
    type: Schema.Types.ObjectId,
    ref: 'School', // Reference to the School model
    required: true,
  },
  lastName: String,
  address: String,
  phoneNumber: String,
  gender: String,
  teacherClass: String,
  staffId: {
    type: String,
    unique: true,
    required: true,
  },
}, {
  timestamps: true,
});

// Define the Teacher model
const Teacher: Model<ITeacher> = mongoose.model<ITeacher>('Teacher', teacherSchema);

export default Teacher;
