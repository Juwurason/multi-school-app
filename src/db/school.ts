import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface ISchool extends Document {
  name: string;
  email: string;
  password: string;
  location?: string;
  address?: string;
  phoneNumber?: string;
  website?: string;
  city?: string;
  state?: string;
  role?: string;
  school_category?: string;
  isValidPassword(password: string): Promise<boolean>;
}

const schoolSchema: Schema = new Schema<ISchool>({
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
  location: String,
  address: String,
  phoneNumber: String,
  website: String,
  city: String,
  state: String,
  school_category: String,
}, {
  timestamps: true,
});


schoolSchema.methods.isValidPassword = async function (password: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, this.password);
    } catch (error) {
      throw error;
    }
  };

const School: Model<ISchool> = mongoose.model<ISchool>('School', schoolSchema);

export const getSchools = () => School.find()

export default School;
