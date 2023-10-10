import mongoose, { Document, Model, Schema } from 'mongoose';

// Define the Letter schema
export interface IScore extends Document {
  
  school: Schema.Types.ObjectId; 
  exam?: string;
  ca?: string;
}

const scoreSchema: Schema = new Schema<IScore>({
  school: {
    type: Schema.Types.ObjectId,
    ref: 'School', // Reference to the School model
    required: true,
  },
  exam: String,
  ca: String,
}, {
  timestamps: true,
});

// Define the Letter model
const Score: Model<IScore> = mongoose.model<IScore>('Score', scoreSchema);

export default Score;
