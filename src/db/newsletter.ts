import mongoose, { Document, Model, Schema } from 'mongoose';

// Define the Letter schema
export interface ILetter extends Document {
  
  school: Schema.Types.ObjectId; 
  newsLetterUrl?: string;
  subject?: string;
  content?: string;
  status: 'saved' | 'sent'; // Status can be 'saved' or 'sent'
}

const newsLetterSchema: Schema = new Schema<ILetter>({
  school: {
    type: Schema.Types.ObjectId,
    ref: 'School', // Reference to the School model
    required: true,
  },
  newsLetterUrl: String,
  subject: String,
  content: String,
  status: {
    type: String,
    enum: ['saved', 'sent'],
    default: 'saved', // Default status is 'saved'
  },
}, {
  timestamps: true,
});

// Define the Letter model
const Letter: Model<ILetter> = mongoose.model<ILetter>('Letter', newsLetterSchema);

export default Letter;
