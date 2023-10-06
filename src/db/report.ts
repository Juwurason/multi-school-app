import mongoose, { Document, Model, Schema } from 'mongoose';

// Define the SchoolClass schema
export interface IReport extends Document {
  
  school: Schema.Types.ObjectId; 
  schoolClass?: string;
  assignedTeacher?: Schema.Types.ObjectId | null;
}

const report: Schema = new Schema<IReport>({
  school: {
    type: Schema.Types.ObjectId,
    ref: 'School', // Reference to the School model
    required: true,
  },
  schoolClass: String,
  
  assignedTeacher: {
    type: Schema.Types.ObjectId,
    ref: 'Teacher', // Reference to the Teacher model
    default: null, // Initially, no teacher is assigned
  },
}, {
  timestamps: true,
});

// Define the Report model
const Report: Model<IReport> = mongoose.model<IReport>('Report', report);

export default Report;