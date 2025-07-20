const Lease = require("../models/lease.model");
const asyncWrapper = require("../middlewares/asyncWrapper.middleware");
const appError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");
const { validationResult } = require("express-validator");

// Create lease request (existing - no changes needed)
const createLeaseRequest = asyncWrapper(async (req, res, next) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(appError.create(errors.array(), 400, httpStatusText.FAIL));
  }

  const {
    tenantId,
    landlordId,
    propertyId,
    startDate,
    endDate,
    fullNameArabic,
    nationalId,
    phoneNumber,
    address
  } = req.body;

  const lease = new Lease({
    tenantId,
    landlordId,
    propertyId,
    startDate,
    endDate,
    tenantDetails: {
      fullNameArabic,
      nationalId,
      phoneNumber,
      address
    },
    status: "pending"
  });

  await lease.save();

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { lease }
  });
});

// Landlord approves lease
const approveLease = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const lease = await Lease.findById(id);

  if (!lease) {
    return next(appError.create("Lease not found", 404, httpStatusText.FAIL));
  }
  
  if (lease.status !== "pending") {
    return next(appError.create("Cannot approve non-pending lease", 400, httpStatusText.FAIL));
  }

  const {
    landlordFullNameArabic,
    landlordNationalId,
    landlordPhoneNumber,
    landlordAddress,
    propertyAddress,
    rentAmount,
    depositAmount
  } = req.body;

  // Update landlord details
  lease.landlordDetails = {
    fullNameArabic: landlordFullNameArabic,
    nationalId: landlordNationalId,
    phoneNumber: landlordPhoneNumber,
    address: landlordAddress
  };

  // Save property info
  if (propertyAddress) lease.propertyAddress = propertyAddress;
  if (rentAmount) lease.rentAmount = rentAmount;
  if (depositAmount) lease.depositAmount = depositAmount;

  lease.status = "active"; // Changed from "approved" to "active" to match your model enum

  await lease.save();
  
  res.status(200).json({ 
    status: httpStatusText.SUCCESS, 
    message: "Lease approved successfully",
    data: { lease } 
  });
});

// Landlord rejects lease
const rejectLease = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const lease = await Lease.findById(id);

  if (!lease) {
    return next(appError.create("Lease not found", 404, httpStatusText.FAIL));
  }
  
  if (lease.status !== "pending") {
    return next(appError.create("Only pending leases can be rejected", 400, httpStatusText.FAIL));
  }

  lease.status = "rejected";
  await lease.save();
  
  res.status(200).json({ 
    status: httpStatusText.SUCCESS, 
    message: "Lease rejected successfully" 
  });
});

// Tenant cancels lease
const cancelLease = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const lease = await Lease.findById(id);

  if (!lease) {
    return next(appError.create("Lease not found", 404, httpStatusText.FAIL));
  }
  
  if (lease.status !== "pending") {
    return next(appError.create("Only pending leases can be cancelled", 400, httpStatusText.FAIL));
  }

  lease.status = "cancelled";
  await lease.save();
  
  res.status(200).json({ 
    status: httpStatusText.SUCCESS, 
    message: "Lease cancelled successfully" 
  });
});

// Update tenant details
const updateTenantDetails = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const lease = await Lease.findById(id);
  if (!lease) {
    return next(appError.create("Lease not found", 404, httpStatusText.FAIL));
  }
  
  if (lease.status !== "pending") {
    return next(appError.create("Cannot update details after approval", 400, httpStatusText.FAIL));
  }
  


  const { fullNameArabic, nationalId, phoneNumber, address, startDate, endDate } = req.body;
  
  // Update tenant details
  lease.tenantDetails = { fullNameArabic, nationalId, phoneNumber, address };
  
  // Update dates if provided
  if (startDate) lease.startDate = startDate;
  if (endDate) lease.endDate = endDate;

  await lease.save();
  
  res.status(200).json({ 
    status: httpStatusText.SUCCESS, 
    message: "Tenant details updated successfully", 
    data: { lease } 
  });
});

// Update landlord details
const updateLandlordDetails = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const lease = await Lease.findById(id);

  if (!lease) {
    return next(appError.create("Lease not found", 404, httpStatusText.FAIL));
  }
  
  if (lease.status !== "pending") {
    return next(appError.create("Cannot update details after approval", 400, httpStatusText.FAIL));
  }
  
  // Check if user is the landlord
  if (!lease.landlordId.equals(req.user._id)) {
    return next(appError.create("Unauthorized", 403, httpStatusText.FAIL));
  }

  const { 
    fullNameArabic, 
    nationalId, 
    phoneNumber, 
    address, 
    propertyAddress, 
    rentAmount, 
    depositAmount,
    clauses 
  } = req.body;
  
  // Update landlord details
  lease.landlordDetails = { fullNameArabic, nationalId, phoneNumber, address };
  lease.propertyAddress = propertyAddress;
  lease.rentAmount = rentAmount;
  lease.depositAmount = depositAmount;
  
  // Update clauses if provided
  if (clauses && Array.isArray(clauses)) {
    lease.clauses = clauses;
  }

  await lease.save();
  
  res.status(200).json({ 
    status: httpStatusText.SUCCESS, 
    message: "Landlord details updated successfully", 
    data: { lease } 
  });
});

// Get lease by ID with populated references
const getLeaseById = asyncWrapper(async (req, res, next) => {
  const lease = await Lease.findById(req.params.id)
    .populate('tenantId', 'name email phoneNumber') // Populate tenant info
    .populate('landlordId', 'name email phoneNumber') // Populate landlord info
    // .populate('propertyId', 'unitNumber building address'); // Populate property info
    
  if (!lease) {
    return next(appError.create("Lease not found", 404, httpStatusText.FAIL));
  }
  
  res.status(200).json({ 
    status: httpStatusText.SUCCESS, 
    data: { lease } 
  });  
});

// Get all leases for landlord
const getLandlordLeases = asyncWrapper(async (req, res, next) => {
  const query = { landlordId: req.params.landlordId };
  
  // Filter by status if provided
  if (req.query.status) {
    query.status = req.query.status;
  }

  const leases = await Lease.find(query)
    .populate('tenantId', 'name email phoneNumber')
    // .populate('propertyId', 'unitNumber building address')
    .sort({ createdAt: -1 });
    
  res.status(200).json({ 
    status: httpStatusText.SUCCESS, 
    results: leases.length, 
    data: { leases } 
  });
});

// Get all leases for tenant
const getTenantLeases = asyncWrapper(async (req, res, next) => {
  const query = { tenantId: req.params.tenantId };
  
  // Filter by status if provided
  if (req.query.status) {
    query.status = req.query.status;
  }

  const leases = await Lease.find(query)
    .populate('landlordId', 'name email phoneNumber')
    // .populate('propertyId', 'unitNumber building address')
    .sort({ createdAt: -1 });
    
  res.status(200).json({ 
    status: httpStatusText.SUCCESS, 
    results: leases.length, 
    data: { leases } 
  });
});

// Get all leases (admin only)
const getAllLeases = asyncWrapper(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const query = {};
  
  // Filter by status if provided
  if (req.query.status) {
    query.status = req.query.status;
  }
  
  // Filter by date range if provided
  if (req.query.startDate || req.query.endDate) {
    query.createdAt = {};
    if (req.query.startDate) query.createdAt.$gte = new Date(req.query.startDate);
    if (req.query.endDate) query.createdAt.$lte = new Date(req.query.endDate);
  }

  const leases = await Lease.find(query)
    .populate('tenantId', 'name email phoneNumber')
    .populate('landlordId', 'name email phoneNumber')
    // .populate('propertyId', 'unitNumber building address')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
  const total = await Lease.countDocuments(query);
  
  res.status(200).json({ 
    status: httpStatusText.SUCCESS, 
    results: leases.length,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalResults: total
    },
    data: { leases } 
  });
});



module.exports = {
  createLeaseRequest,
  approveLease,
  rejectLease,
  cancelLease,
  updateTenantDetails,
  updateLandlordDetails,
  getLeaseById,
  getLandlordLeases,
  getTenantLeases,
  getAllLeases,
};