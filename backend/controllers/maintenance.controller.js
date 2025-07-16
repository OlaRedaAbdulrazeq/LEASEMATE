const MaintenanceRequest = require('../models/maintenance.model');
const uploadToCloudinary = require('../utils/uploadtoCloudinary');
const User = require('../models/user.model');

exports.createRequest = async (req, res) => {
  try {
    const { tenantId, unitId, contractId, title, description } = req.body;
    let image = req.body.image;
    if (req.file) {
      image = await uploadToCloudinary(req.file.buffer, 'maintenance');
    }

    const requestData = {
      tenantId: tenantId || req.user._id,
      title,
      description,
      image
    };

    if (unitId) requestData.unitId = unitId;
    if (contractId) requestData.contractId = contractId;

    const request = await MaintenanceRequest.create(requestData);

    res.status(201).json({ message: 'تم إرسال طلب الصيانة بنجاح', request });
  } catch (error) {
    console.error('Error creating maintenance request:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء إرسال الطلب', error: error.message });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'tenant') {
      filter.tenantId = req.user._id;
    } else if (req.user.role === 'landlord') {}
    const requests = await MaintenanceRequest.find(filter).sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ أثناء جلب الطلبات', error });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const request = await MaintenanceRequest.findByIdAndUpdate(
      id,
      { status, notes },
      { new: true }
    );
    if (!request) {
      return res.status(404).json({ message: 'الطلب غير موجود' });
    }

    res.status(200).json({ message: 'تم تحديث حالة الطلب', request });
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ أثناء تحديث الطلب', error });
  }
}; 
