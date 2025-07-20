'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

/**
 * Interface definitions for TypeScript type safety
 */
interface Lease {
  _id: string;
  propertyId?: string;
  propertyAddress?: string;
  status: string;
  rentAmount?: number;
  startDate?: string;
  endDate?: string;
  tenantDetails?: {
    fullNameArabic: string;
    nationalId: string;
    phoneNumber: string;
    address: string;
  };
}

interface Property {
  _id: string;
  name: string;
  type: string;
  address: string;
  city: string;
}

/**
 * Main Leases Page Component
 * Shows lease requests and contracts for both landlords and tenants
 */
export default function LeasesPage() {
  // Authentication and routing hooks
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // State management for leases and properties
  const [leases, setLeases] = useState<Lease[]>([]);
  const [properties, setProperties] = useState<{ [id: string]: Property }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI state for loading indicators
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Tenant edit modal state
  const [editingLease, setEditingLease] = useState<Lease | null>(null);
  const [editForm, setEditForm] = useState({
    fullNameArabic: '',
    nationalId: '',
    phoneNumber: '',
    address: '',
  });
  const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({});
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Modal and toast state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [leaseToCancel, setLeaseToCancel] = useState<Lease | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [showEditToast, setShowEditToast] = useState(false);

  // Collapsible sections state
  const [openRequests, setOpenRequests] = useState(true);
  const [openContracts, setOpenContracts] = useState(true);

  // Landlord-specific state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [leaseToReject, setLeaseToReject] = useState<Lease | null>(null);
  const [showLandlordToast, setShowLandlordToast] = useState(false);

  /**
   * Fetch leases and property data when user is available
   */
  useEffect(() => {
    if (!user) return;
    
    const fetchLeases = async () => {
      try {
        let leaseRes: any;
        
        // Fetch leases based on user role
        if (user.role === 'landlord') {
          leaseRes = await apiService.getLeasesForLandlord(user._id);
        } else {
          leaseRes = await apiService.getLeasesForTenant(user._id);
        }
        
        setLeases(leaseRes.data.leases);

        // Fetch property details for all unique property IDs
        const uniquePropertyIds = Array.from(
          new Set(leaseRes.data.leases.map((l: Lease) => l.propertyId as string))
        ).filter(Boolean) as string[];
        
        const propertyData: { [id: string]: Property } = {};
        
        await Promise.all(
          uniquePropertyIds.map(async (id: string) => {
            try {
              const propRes: any = await apiService.getPropertyById(id);
              propertyData[id] = propRes.data.unit;
            } catch {
              // Skip if property fetch fails
            }
          })
        );
        
        setProperties(propertyData);
      } catch (err) {
        setError('فشل تحميل العقود');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeases();
  }, [user]);

  /**
   * Landlord actions for lease requests
   */
  const handleReject = (lease: Lease) => {
    setLeaseToReject(lease);
    setShowRejectModal(true);
  };

  const handleAccept = (leaseId: string) => {
    router.push(`/leases/${leaseId}/initiate`);
  };

  /**
   * Tenant actions for lease requests
   */
  const handleCancel = async (leaseId: string) => {
    setLeaseToCancel(leases.find(l => l._id === leaseId) || null);
    setShowCancelModal(true);
  };

  /**
   * Tenant edit functionality
   */
  const openEdit = (lease: Lease) => {
    setEditingLease(lease);
    setEditForm({
      fullNameArabic: lease.tenantDetails?.fullNameArabic || '',
      nationalId: lease.tenantDetails?.nationalId || '',
      phoneNumber: lease.tenantDetails?.phoneNumber || '',
      address: lease.tenantDetails?.address || '',
    });
    setEditErrors({});
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
    if (editErrors[e.target.name]) {
      setEditErrors({ ...editErrors, [e.target.name]: '' });
    }
  };

  const validateEdit = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (editForm.fullNameArabic.trim().split(' ').length < 3) {
      newErrors.fullNameArabic = 'الاسم يجب أن يكون ثلاثي';
    }
    
    if (!/^\d{14}$/.test(editForm.nationalId)) {
      newErrors.nationalId = 'رقم البطاقة يجب أن يكون 14 رقم';
    }
    
    if (!/^01\d{9}$/.test(editForm.phoneNumber)) {
      newErrors.phoneNumber = 'رقم الهاتف غير صحيح';
    }
    
    if (!editForm.address.trim()) {
      newErrors.address = 'العنوان مطلوب';
    }
    
    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditSave = async () => {
    if (!editingLease || !validateEdit()) return;
    
    setIsSavingEdit(true);
    
    try {
      await apiService.updateTenantLease(editingLease._id, editForm);
      
      // Update local state with new data
      setLeases((prev) =>
        prev.map((l) =>
          l._id === editingLease._id
            ? {
                ...l,
                tenantDetails: { ...l.tenantDetails, ...editForm },
              }
            : l
        )
      );
      
      setEditingLease(null);
      setShowEditToast(true);
      setTimeout(() => setShowEditToast(false), 3000);
    } catch (err) {
      console.error('فشل تحديث البيانات', err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Loading states
  if (isLoading || loading)
    return <div className="text-center mt-10 text-xl" dir="rtl">جاري التحميل...</div>;
  
  if (!user) 
    return <div className="text-center mt-10 text-xl" dir="rtl">يجب تسجيل الدخول</div>;
  
  if (error) 
    return <div className="text-center mt-10 text-xl text-red-500" dir="rtl">{error}</div>;

  // Filter leases by status
  const pendingLeases = leases.filter(l => l.status === 'pending');
  const activeLeases = leases.filter(l => l.status === 'active');

  /**
   * Landlord-specific UI
   */
  if (user.role === 'landlord') {
    return (
      <div className="min-h-screen bg-[#fff6ec] flex flex-col items-center py-10 px-4 pt-20" dir="rtl">
        <Navbar />
        
        <div className="w-full max-w-2xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-orange-600">إدارة العقود</h2>
          
          {/* Pending Requests Section */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold mb-4 text-orange-700">الطلبات المعلقة</h3>
            
            {pendingLeases.length === 0 ? (
              <p className="text-center text-gray-500">لا توجد طلبات معلقة.</p>
            ) : (
              <ul className="space-y-4">
                {pendingLeases.map((lease) => {
                  const property = properties[lease.propertyId || ''];
                  return (
                    <li
                      key={lease._id}
                      className="border rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <div>
                        <div className="font-bold text-lg mb-1 text-orange-600">
                          {property ? property.name : lease.propertyAddress || "-"}
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                          المستأجر: {lease.tenantDetails?.fullNameArabic || '-'}
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                          رقم هاتف المستأجر: {lease.tenantDetails?.phoneNumber || '-'}
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                          من: {lease.startDate?.slice(0,10)} إلى: {lease.endDate?.slice(0,10)}
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                          العنوان: {property?.address || "-"}
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                          المدينة: {property?.city || "-"}
                        </div>
                        {lease.rentAmount && (
                          <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                            الإيجار: {lease.rentAmount} ج.م
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <span className="px-4 py-1 rounded-full font-semibold text-sm bg-yellow-100 text-yellow-700">
                          معلق
                        </span>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleAccept(lease._id)}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                          >
                            قبول
                          </button>
                          <button
                            onClick={() => handleReject(lease)}
                            disabled={actionLoading === lease._id}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50"
                          >
                            {actionLoading === lease._id ? '...جاري الرفض' : 'رفض'}
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          
          {/* Active Contracts Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-green-700">العقود النشطة</h3>
            
            {activeLeases.length === 0 ? (
              <p className="text-center text-gray-500">لا توجد عقود نشطة.</p>
            ) : (
              <ul className="space-y-4">
                {activeLeases.map((lease) => {
                  const property = properties[lease.propertyId || ''];
                  return (
                    <li
                      key={lease._id}
                      className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 bg-[#f6fff3] cursor-pointer hover:bg-green-50 transition"
                      onClick={() => router.push(`/leases/${lease._id}`)}
                    >
                      <div>
                        <div className="font-semibold text-lg mb-1">
                          {property ? property.name : lease.propertyAddress || '-'}
                        </div>
                        <div className="text-xs text-gray-500">
                          المستأجر: {lease.tenantDetails?.fullNameArabic || '-'}
                        </div>
                        <div className="text-xs text-gray-500">
                          رقم الهاتف: {lease.tenantDetails?.phoneNumber || '-'}
                        </div>
                        <div className="text-xs text-gray-500">
                          من: {lease.startDate?.slice(0,10)} إلى: {lease.endDate?.slice(0,10)}
                        </div>
                        {lease.rentAmount && <div className="text-xs text-gray-500">الإيجار: {lease.rentAmount} ج.م</div>}
                      </div>
                      <span className="text-green-600 font-semibold text-sm">نشط</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
        
        {/* Reject Confirmation Modal */}
        {showRejectModal && leaseToReject && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
              <h3 className="text-xl font-bold mb-4 text-orange-600">تأكيد رفض الطلب</h3>
              <p className="mb-6">هل أنت متأكد أنك تريد رفض الطلب الخاص بعقار <span className="font-bold">{properties[leaseToReject.propertyId || '']?.name || '-'}</span>؟</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={async () => {
                    setActionLoading(leaseToReject._id);
                    try {
                      await apiService.rejectLease(leaseToReject._id);
                      setLeases((prev) => prev.map(l => l._id === leaseToReject._id ? { ...l, status: 'rejected' } : l));
                      setShowRejectModal(false);
                      setLeaseToReject(null);
                      setShowLandlordToast(true);
                      setTimeout(() => setShowLandlordToast(false), 3000);
                    } catch {}
                    setActionLoading(null);
                  }}
                  disabled={actionLoading === leaseToReject._id}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
                >
                  {actionLoading === leaseToReject._id ? '...جاري الرفض' : 'تأكيد الرفض'}
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setLeaseToReject(null);
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-semibold"
                >
                  تراجع
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Toast for landlord actions */}
        {showLandlordToast && (
          <div className="fixed top-20 left-0 right-0 z-50 flex justify-center">
            <div className="flex items-center justify-between bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-xl p-4 shadow-md gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-semibold text-green-800 dark:text-green-200">تم رفض الطلب بنجاح</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /**
   * Tenant-specific UI
   */
  return (
    <div className="min-h-screen bg-[#fff6ec] flex flex-col items-center py-10 px-4 pt-20" dir="rtl">
      <Navbar />
      
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-orange-600">العقود والطلبات</h2>
        
        {/* Lease Requests Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-orange-700">طلبات الإيجار</h3>
            <CollapseButton 
              isOpen={openRequests} 
              onClick={() => setOpenRequests((prev) => !prev)} 
            />
          </div>
          
          {openRequests && (
            pendingLeases.length === 0 ? (
              <p className="text-center text-gray-500">لا توجد طلبات معلقة.</p>
            ) : (
              <ul className="space-y-4 transition-all duration-300">
                {pendingLeases.map((lease) => {
                  const property = properties[lease.propertyId || ''];
                  return (
                    <LeaseCard 
                      key={lease._id}
                      lease={lease}
                      property={property}
                      onEdit={() => openEdit(lease)}
                      onCancel={() => handleCancel(lease._id)}
                      cancelling={cancelling === lease._id}
                      status="pending"
                    />
                  );
                })}
              </ul>
            )
          )}
        </div>

        {/* Active Contracts Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-green-700">عقودي النشطة</h3>
            <CollapseButton 
              isOpen={openContracts} 
              onClick={() => setOpenContracts((prev) => !prev)} 
            />
          </div>
          
          {openContracts && (
            activeLeases.length === 0 ? (
              <p className="text-center text-gray-500">لا توجد عقود نشطة.</p>
            ) : (
              <ul className="space-y-4 transition-all duration-300">
                {activeLeases.map((lease) => {
                  const property = properties[lease.propertyId || ''];
                  return (
                    <LeaseCard 
                      key={lease._id}
                      lease={lease}
                      property={property}
                      status="active"
                      onView={() => router.push(`/leases/${lease._id}`)}
                    />
                  );
                })}
              </ul>
            )
          )}
        </div>
      </div>
      
      {/* Edit Modal */}
      {editingLease && (
        <EditModal 
          editForm={editForm}
          editErrors={editErrors}
          onEditChange={handleEditChange}
          onSave={handleEditSave}
          onCancel={() => setEditingLease(null)}
          isSaving={isSavingEdit}
        />
      )}
      
      {/* Cancel Confirmation Modal */}
      {showCancelModal && leaseToCancel && (
        <ConfirmationModal
          title="تأكيد إلغاء الطلب"
          message={`هل أنت متأكد أنك تريد إلغاء الطلب الخاص بعقار ${properties[leaseToCancel.propertyId || '']?.name || '-'}؟`}
          confirmText="تأكيد الإلغاء"
          cancelText="تراجع"
          onConfirm={async () => {
            setCancelling(leaseToCancel._id);
            try {
              await apiService.cancelLease(leaseToCancel._id);
              setLeases((prev) => prev.map(l => l._id === leaseToCancel._id ? { ...l, status: 'cancelled' } : l));
              setShowToast(true);
              setTimeout(() => setShowToast(false), 3000);
            } catch {}
            setCancelling(null);
            setShowCancelModal(false);
            setLeaseToCancel(null);
          }}
          onCancel={() => {
            setShowCancelModal(false);
            setLeaseToCancel(null);
          }}
        />
      )}
      
      {/* Success Toasts */}
      {showToast && (
        <SuccessToast message="تم إلغاء الطلب بنجاح" onClose={() => setShowToast(false)} />
      )}
      
      {showEditToast && (
        <SuccessToast message="تم تحديث البيانات بنجاح" onClose={() => setShowEditToast(false)} />
      )}
    </div>
  );
}

/**
 * Reusable Components
 */

interface LeaseCardProps {
  lease: Lease;
  property?: Property;
  status: 'pending' | 'active';
  onEdit?: () => void;
  onCancel?: () => void;
  onView?: () => void;
  cancelling?: boolean;
}

const LeaseCard = ({
  lease,
  property,
  status,
  onEdit,
  onCancel,
  onView,
  cancelling
}: LeaseCardProps) => {
  return (
    <li className="border rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl transition-shadow">
      <div>
        <div className="font-bold text-lg mb-1 text-orange-600">
          {property ? property.name : "-"}
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
          العنوان: {property?.address || "-"}
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
          المدينة: {property?.city || "-"}
        </div>
      </div>
      
      <div className="flex flex-col items-end gap-2">
        <span className={`px-4 py-1 rounded-full font-semibold text-sm ${
          status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
        }`}>
          {status === 'pending' ? 'معلق' : 'نشط'}
        </span>
        
        <div className="flex gap-2 mt-2">
          {status === 'pending' && onEdit && (
            <button
              onClick={onEdit}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
            >
              تعديل
            </button>
          )}
          
          {status === 'pending' && onCancel && (
            <button
              onClick={onCancel}
              disabled={cancelling}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {cancelling ? "...جاري الإلغاء" : "إلغاء الطلب"}
            </button>
          )}
          
          {status === 'active' && onView && (
            <button
              onClick={onView}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
            >
              عرض العقد
            </button>
          )}
        </div>
      </div>
    </li>
  );
};

interface CollapseButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

const CollapseButton = ({ isOpen, onClick }: CollapseButtonProps) => (
  <button
    className="text-orange-600 hover:text-orange-800 font-bold text-lg focus:outline-none flex items-center"
    onClick={onClick}
    aria-label={isOpen ? 'إغلاق' : 'فتح'}
  >
    <svg
      className={`transition-transform duration-200 w-6 h-6 ${isOpen ? 'rotate-90' : 'rotate-0'}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </button>
);

interface EditModalProps {
  editForm: {
    fullNameArabic: string;
    nationalId: string;
    phoneNumber: string;
    address: string;
  };
  editErrors: { [key: string]: string };
  onEditChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

const EditModal = ({
  editForm,
  editErrors,
  onEditChange,
  onSave,
  onCancel,
  isSaving
}: EditModalProps) => (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
      <h3 className="text-xl font-bold mb-4 text-orange-600 text-center">تعديل بيانات الطلب</h3>
      <div className="space-y-4">
        <EditInputField
          name="fullNameArabic"
          label="الاسم كامل"
          value={editForm.fullNameArabic}
          onChange={onEditChange}
          error={editErrors.fullNameArabic}
          placeholder="أدخل الاسم الثلاثي"
        />
        <EditInputField
          name="nationalId"
          label="رقم البطاقة"
          value={editForm.nationalId}
          onChange={onEditChange}
          error={editErrors.nationalId}
          placeholder="أدخل رقم البطاقة (14 رقم)"
          maxLength={14}
        />
        <EditInputField
          name="phoneNumber"
          label="رقم الهاتف"
          value={editForm.phoneNumber}
          onChange={onEditChange}
          error={editErrors.phoneNumber}
          placeholder="01xxxxxxxxx"
          maxLength={11}
        />
        <EditInputField
          name="address"
          label="عنوان الإقامة"
          value={editForm.address}
          onChange={onEditChange}
          error={editErrors.address}
          placeholder="أدخل العنوان كاملاً"
        />
        <div className="flex gap-4 mt-4">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
          <button
            onClick={onCancel}
            className="w-full border border-orange-500 text-orange-500 py-3 px-4 rounded-lg font-semibold hover:bg-orange-100 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  </div>
);

interface EditInputFieldProps {
  name: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  maxLength?: number;
}

const EditInputField = ({
  name,
  label,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  maxLength,
}: EditInputFieldProps) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-right">
      {label}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      className={`w-full px-4 py-3 border rounded-lg bg-white text-right focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
        error ? "border-red-500" : "border-gray-300"
      }`}
      dir="rtl"
    />
    {error && <p className="text-red-500 text-sm mt-1 text-right">{error}</p>}
  </div>
);

interface ConfirmationModalProps {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal = ({
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel
}: ConfirmationModalProps) => (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
      <h3 className="text-xl font-bold mb-4 text-orange-600">{title}</h3>
      <p className="mb-6">{message}</p>
      <div className="flex gap-4 justify-center">
        <button
          onClick={onConfirm}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold"
        >
          {confirmText}
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-semibold"
        >
          {cancelText}
        </button>
      </div>
    </div>
  </div>
);

interface SuccessToastProps {
  message: string;
  onClose: () => void;
}

const SuccessToast = ({ message, onClose }: SuccessToastProps) => (
  <div className="fixed top-20 left-0 right-0 z-50 flex justify-center">
    <div className="flex items-center justify-between bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-xl p-4 shadow-md gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
          <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="font-semibold text-green-800 dark:text-green-200">{message}</span>
      </div>
    </div>
  </div>
);