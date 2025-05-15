import mongoose, { Schema, model } from "mongoose";
import { v4 as uuidv4 } from 'uuid';

export interface UrlDocument {
  _id: string;
  uuid: string;
  url: string;
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