import mongoose from 'mongoose';

const influencerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  handle: {
    type: String,
    required: true,
  },
  niche: {
    type: String,
    required: true,
  },
  reach: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  instagramUrl: {
    type: String,
    required: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const Influencer = mongoose.model('Influencer', influencerSchema);

export default Influencer;
