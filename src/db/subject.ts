import mongoose, { Document, Model, Schema } from 'mongoose';

// Define the Subject schema
export interface ISubject extends Document {
  
  school: Schema.Types.ObjectId; 
  subject?: string;
 
}

const subject: Schema = new Schema<ISubject>({
  school: {
    type: Schema.Types.ObjectId,
    ref: 'School', // Reference to the School model
    required: true,
  },
  subject: String,
}, {
  timestamps: true,
});

// Define the Subject model
const Subject: Model<ISubject> = mongoose.model<ISubject>('Subject', subject);

export default Subject;