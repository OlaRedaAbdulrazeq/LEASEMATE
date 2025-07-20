const mongoose = require('mongoose');

const leaseSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  tenantDetails: {
    fullNameArabic: { type: String, required: true, trim: true },
    nationalId: { type: String, required: true },
    address: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true }
  },
  landlordDetails: {
    fullNameArabic: { type: String, required: false, trim: true },
    nationalId: { type: String, required: false },
    address: { type: String, required: false, trim: true },
    phoneNumber: { type: String, required: false }
  },
  propertyId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },
  propertyAddress: {
    type: String,
    trim: true,
  },
  contractType: {
    type: String,
    enum: ['rental'],
    default: 'rental'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return !this.startDate || value > this.startDate;
      },
      message: 'يجب أن يكون تاريخ نهاية العقد بعد تاريخ البداية.'
    }
  },
  rentAmount: {
    type: Number,
    min: 1
  },
  depositAmount: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'cancelled', 'rejected', 'active'],
    default: 'pending'
  },
  clauses: {
    type: [String],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('Lease', leaseSchema);