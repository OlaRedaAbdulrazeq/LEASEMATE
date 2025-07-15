const MaintenanceRequest = require('../models/maintenance.model');
const uploadToCloudinary = require('../utils/uploadtoCloudinary');
const User = require('../models/user.model'); // لو احتجنا بيانات المستأجر أو المالك

// إضافة طلب صيانة جديد
exports.createRequest = async (req, res) => {
  try {
    const { tenantId, unitId, contractId, title, description } = req.body;
    let image = req.body.image;
    // لو فيه رفع صورة عبر middleware
    if (req.file) {
      image = await uploadToCloudinary(req.file.buffer, 'maintenance');
    }

    // إنشاء كائن الطلب مع الحقول المطلوبة فقط
    const requestData = {
      tenantId: tenantId || req.user._id, // استخدام معرف المستخدم الحالي إذا لم يتم توفير tenantId
      title,
      description,
      image
    };

    // إضافة unitId و contractId فقط إذا كانت متوفرة
    if (unitId) requestData.unitId = unitId;
    if (contractId) requestData.contractId = contractId;

    const request = await MaintenanceRequest.create(requestData);

    // إرسال إشعار للمالك (placeholder)
    // sendNotificationToOwner(unitId, ...)

    res.status(201).json({ message: 'تم إرسال طلب الصيانة بنجاح', request });
  } catch (error) {
    console.error('Error creating maintenance request:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء إرسال الطلب', error: error.message });
  }
};

// جلب كل الطلبات (يمكن تخصيصها لاحقًا)
exports.getAllRequests = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'tenant') {
      filter.tenantId = req.user._id;
    } else if (req.user.role === 'landlord') {
      // هنا يجب جلب فقط الطلبات الخاصة بوحدات هذا المالك
      // مثال: إذا كان لديك جدول للوحدات، اجلب كل unitId الخاصة بالمالك وضعها في الفلتر
      // filter.unitId = { $in: [قائمة وحدات المالك] }
    }
    // يمكن إضافة فلترة للمالك لاحقًا حسب وحداته
    const requests = await MaintenanceRequest.find(filter).sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ أثناء جلب الطلبات', error });
  }
};

// تحديث حالة الطلب وإضافة ملاحظة
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

    // إرسال إشعار للمستأجر (placeholder)
    // sendNotificationToTenant(request.tenantId, ...)

    res.status(200).json({ message: 'تم تحديث حالة الطلب', request });
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ أثناء تحديث الطلب', error });
  }
}; 