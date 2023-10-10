import mongoose, { Document, Model, Schema } from 'mongoose';

// Define the Subject schema
export interface ISubject extends Document {
  
  school: Schema.Types.ObjectId; 
  // schoolClass?: Schema.Types.ObjectId[] | null; // Optional reference to the SchoolClass model
  schoolClass?: Schema.Types.ObjectId | Schema.Types.ObjectId[] | null;
  subject?: string;
 
}

const subject: Schema = new Schema<ISubject>({
  school: {
    type: Schema.Types.ObjectId,
    ref: 'School', // Reference to the School model
    required: true,
  },
  schoolClass: {
    type: Schema.Types.Mixed,
    ref: 'SchoolClass', // Reference to the SchoolClass model
    default: null, // Default value is null, indicating it's applicable to all classes
  },
  subject: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Define the Subject model
const Subject: Model<ISubject> = mongoose.model<ISubject>('Subject', subject);

export default Subject;