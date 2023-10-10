import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IGradeFormat extends Document {
  school: Schema.Types.ObjectId;
  grade: string;
  miniScore: number;
  maxScore: number;
}

const gradeFormatSchema: Schema = new Schema<IGradeFormat>(
  {
    school: {
      type: Schema.Types.ObjectId,
      ref: 'School', // Reference to the School model
      required: true,
    },
    grade: {
      type: String,
      required: true,
    },
    miniScore: {
      type: Number,
      required: true,
    },
    maxScore: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const GradeFormat: Model<IGradeFormat> = mongoose.model<IGradeFormat>('GradeFormat', gradeFormatSchema);

export default GradeFormat;
