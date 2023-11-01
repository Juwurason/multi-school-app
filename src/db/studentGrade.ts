
import mongoose, { Document, Schema } from 'mongoose';
import Score, { IScore } from './score';

export interface IStudentGradeFormat extends Document {
  school: Schema.Types.ObjectId;
  student: Schema.Types.ObjectId;
  subject: Schema.Types.ObjectId;
  ca: string;
  exam: string;
  term: string;
  gradeRemark: string;
}

const studentGradeSchema: Schema = new Schema<IStudentGradeFormat>(
  {
    school: {
      type: Schema.Types.ObjectId,
      ref: 'School', // Reference to the School model
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student', // Reference to the Student model
      required: true,
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: 'Subject', // Reference to the Subject model
      required: true,
    },
    term: {
      type: String,
      required: true,
    },
    ca: String,
    exam: String,
    gradeRemark: String,
  },
  {
    timestamps: true,
  }
);

studentGradeSchema.pre<IStudentGradeFormat>('validate', async function (next) {
  const studentGrade = this;

  // Fetch the school's score limits
  const schoolScores: IScore | null = await Score.findOne({ school: studentGrade.school });

  if (!schoolScores) {
    return next(new Error('School scores not found'));
  }

  // Check if CA and exam scores are within school limits
  if (studentGrade.ca && parseInt(studentGrade.ca) > schoolScores.ca) {
    return next(new Error('CA score exceeds school limit'));
  }

  if (studentGrade.exam && parseInt(studentGrade.exam) > schoolScores.exam) {
    return next(new Error('Exam score exceeds school limit'));
  }

  next();
});

const StudentGradeFormat = mongoose.model<IStudentGradeFormat>('StudentGradeFormat', studentGradeSchema);

export default StudentGradeFormat;
