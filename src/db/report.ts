import mongoose, { Document, Model, Schema } from 'mongoose';

// Define the SchoolClass schema
export interface IReport extends Document {
  student: Schema.Types.ObjectId; 
  presentNo: string;
  absentNo: string;
  attentiveness: string;
  honesty: string;
  neatness: string;
  puntuality: string;
  leadershipRespon: string;
  handling: string;
  handWriting: string;
  publicSpeack: string;
  drawingPainting: string;
  sportGames: string;
  classTeacher: string;
  headTeacher: string;
}

const report: Schema = new Schema<IReport>({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student', // Reference to the Student model
    required: true,
  },
  presentNo: String,
  absentNo: String,
  attentiveness: String,
  honesty: String,
  neatness: String,
  puntuality: String,
  leadershipRespon: String,
  handling: String,
  handWriting: String,
  publicSpeack: String,
  drawingPainting: String,
  sportGames: String,
  classTeacher: String,
  headTeacher: String,
 
}, {
  timestamps: true,
});

// Define the Report model
const Report: Model<IReport> = mongoose.model<IReport>('Report', report);

export default Report;