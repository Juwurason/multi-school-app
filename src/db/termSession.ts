import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ITermSession extends Document {
  school: Schema.Types.ObjectId;
  term: string;
  session: string;
}

const termSession: Schema = new Schema<ITermSession>(
  {
    school: {
      type: Schema.Types.ObjectId,
      ref: 'School', // Reference to the School model
      required: true,
    },
    term: {
      type: String,
      required: true,
    },
    session: {
      type: String,
      required: true,
    },
  
  },
  {
    timestamps: true,
  }
);

const TermSession: Model<ITermSession> = mongoose.model<ITermSession>('TermSession', termSession);

export default TermSession;
