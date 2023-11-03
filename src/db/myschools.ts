import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface ISchool extends Document {
  name: string;
  email: string;
  password: string;
  address?: string;
  phoneNumber?: string;
  city?: string;
  state?: string;
  role?: string;
  school_category?: string;
  isValidPassword(password: string): Promise<boolean>;
  schoolLogoUrl?: string;
  website?: string;
  term?: string;
  session?: string;
  isEmailVerified: boolean; // Field to track email verification status
  otp?: string; // Field to store OTP (optional, as it's generated)
  otpExpiration?: Date; // Field to store OTP expiration time (optional)
}

const myschoolSchema: Schema = new Schema<ISchool>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  address: String,
  phoneNumber: String,
  city: String,
  state: String,
  school_category: String,
  schoolLogoUrl: String,
  website: String,
  term: String,
  session: String,
  isEmailVerified: {
    type: Boolean,
    default: false, // New teachers are not verified by default
  },
  otp: String, // Field to store OTP (optional)
  otpExpiration: Date, // Field to store OTP expiration time (optional)
}, {
  timestamps: true,
});


myschoolSchema.methods.isValidPassword = async function (password: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, this.password);
    } catch (error) {
      throw error;
    }
  };

const mySchool: Model<ISchool> = mongoose.model<ISchool>('mySchool', myschoolSchema);

export default mySchool;
