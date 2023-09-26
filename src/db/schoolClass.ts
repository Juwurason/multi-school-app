import mongoose, { Document, Model, Schema } from 'mongoose';

// Define the SchoolClass schema
export interface ISchoolClass extends Document {
  
  school: Schema.Types.ObjectId; 
  schoolClass?: string;
  assignedTeacher?: Schema.Types.ObjectId | null;
}

const schoolClasses: Schema = new Schema<ISchoolClass>({
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

// Define the SchoolClass model
const SchoolClass: Model<ISchoolClass> = mongoose.model<ISchoolClass>('SchoolClass', schoolClasses);

export default SchoolClass;