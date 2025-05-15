import mongoose, { Schema, model } from "mongoose";
import { v4 as uuidv4 } from 'uuid';

const UrlStatus = ['new', 'hasError', 'ready'] as const;

export interface UrlDocument {
  _id: string;
  uuid: string;
  url: string;
  status: typeof UrlStatus[number];
  title: string;
  content: string;

  createdAt: Date;
  updatedAt: Date;
}

const UrlSchema = new Schema<UrlDocument>({
  uuid: {
    type: String,
    default: () => uuidv4(),
    unique: true,
  },
  url: {
    type: String,
    required: [true, "URL is required"],
  },
  status: {
    type: String,
    enum: UrlStatus,
    default: 'new',
  },
  title: {
    type: String,
    default: "",
  },
  content: {
    type: String,
    default: "",
  }
},
{
  timestamps: true,
}
);

const Url = mongoose.models?.Url || model<UrlDocument>('Url', UrlSchema);
export default Url;