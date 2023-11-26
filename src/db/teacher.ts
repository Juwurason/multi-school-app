import mongoose, { Document, Model, Schema } from 'mongoose';

// Define the Teacher schema
export interface ITeacher extends Document {
  name: string;
  lastName: string;
  address: string;
  phoneNumber: string;
  email: string;
  gender: string;
  role: string;
  password: string;
  teacherClass: Schema.Types.ObjectId;
  staffId: string;
  school: Schema.Types.ObjectId; 
  teacherSubject: Schema.Types.ObjectId | Schema.Types.ObjectId[] | null;
  profilePictureUrl?: string;
  isEmailVerified: boolean; // Field to track email verification status
  otp?: string; // Field to store OTP (optional, as it's generated)
  otpExpiration?: Date; // Field to store OTP expiration time (optional)
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
  password: {
    type: String,
    required: true,
  },
  lastName: String,
  address: String,
  phoneNumber: String,
  gender: String,
  role: String,
  teacherClass: {
    type: Schema.Types.ObjectId,
    ref: 'SchoolClass', // Reference to the SchoolClass model
    default: null,
  },
  staffId: {
    type: String,
    unique: true,
    required: true,
  },
  profilePictureUrl: String,
  teacherSubject: {
    type: Schema.Types.Mixed,
    ref: 'Subject', // Reference to the Subject model
    default: null,
  },
  isEmailVerified: {
    type: Boolean,
    default: false, // New teachers are not verified by default
  },
  otp: String, // Field to store OTP (optional)
  otpExpiration: Date, // Field to store OTP expiration time (optional)
}, {
  timestamps: true,
});

// Define the Teacher model
const Teacher: Model<ITeacher> = mongoose.model<ITeacher>('Teacher', teacherSchema);

export default Teacher;
