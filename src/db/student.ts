import mongoose, { Document, Model, Schema } from 'mongoose';

// Define the Teacher schema
export interface IStudent extends Document {
  name: string;
  lastName: string;
  address: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  gender: string;
  studentClass: string;
  studentId: string;
  guardainsFullName: string;
  school: Schema.Types.ObjectId; 
  profilePictureUrl?: string;
}

const studentSchema: Schema = new Schema<IStudent>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  school: {
    type: Schema.Types.ObjectId,
    ref: 'School', // Reference to the School model
    required: true,
  },
  dateOfBirth: String,
  lastName: String,
  address: String,
  phoneNumber: String,
  gender: String,
  guardainsFullName: String,
  studentClass: String,
  studentId: {
    type: String,
    unique: true,
    required: true,
  },
  profilePictureUrl: String,
}, {
  timestamps: true,
});

// Define the Teacher model
const Student: Model<IStudent> = mongoose.model<IStudent>('Student', studentSchema);

export default Student;
