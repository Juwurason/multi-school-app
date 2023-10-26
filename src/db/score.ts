import mongoose, { Document, Model, Schema } from 'mongoose';


export interface IScore extends Document {
  
  school: Schema.Types.ObjectId; 
  exam?: number;
  ca?: number;
}

const scoreSchema: Schema = new Schema<IScore>({
  school: {
    type: Schema.Types.ObjectId,
    ref: 'School', // Reference to the School model
    required: true,
  },
  exam: Number,
  ca: Number,
}, {
  timestamps: true,
});

// Define the Letter model
const Score: Model<IScore> = mongoose.model<IScore>('Score', scoreSchema);

export default Score;
