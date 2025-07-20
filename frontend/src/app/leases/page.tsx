'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { LeaseCard } from '@/components/LeaseCard';
import { StatusBadge } from '@/components/StatusBadge';
import { ActionButton } from '@/components/ActionButton';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { SuccessToast } from '@/components/SuccessToast';
import { EditModal } from '@/components/EditModal';

/**
 * Interface definitions for TypeScript type safety
 */
interface Lease {
  _id: string;
  propertyId?: string;
  propertyAddress?: string;
  status: string;
  rentAmount?: number;
  depositAmount?: number;
  startDate?: string;
  endDate?: string;
  tenantDetails?: {
    fullNameArabic: string;
    nationalId: string;
    phoneNumber: string;
    address: string;
  };
  landlordDetails?: {
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
  pricePerMonth?: number;
  deposit?: number;
}

/**
 * Main Leases Page Component
 * Shows lease requests and contracts for both landlords and tenants
 */
export default function LeasesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // State management
  const [leases, setLeases] = useState<Lease[]>([]);
  const [properties, setProperties] = useState<{ [id: string]: Property }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI state
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [leaseToCancel, setLeaseToCancel] = useState<Lease | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [leaseToReject, setLeaseToReject] = useState<Lease | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Edit modal state
  const [editingLease, setEditingLease] = useState<Lease | null>(null);
  const [editForm, setEditForm] = useState({
    fullNameArabic: '',
    nationalId: '',
    phoneNumber: '',
    address: '',
  });
  const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({});
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Collapsible sections state
  const [openRequests, setOpenRequests] = useState(true);
  const [openContracts, setOpenContracts] = useState(true);

  /**
   * Fetch leases and property data when user is available
   */
  useEffect(() => {
    if (!user) return;
    
    const fetchLeases = async () => {
      try {
        let leaseRes: any;
        
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
   * Landlord actions
   */
  const handleReject = (lease: Lease) => {
    setLeaseToReject(lease);
    setShowRejectModal(true);
  };

  const handleAccept = (leaseId: string) => {
    router.push(`/leases/${leaseId}/initiate`);
  };

  const confirmReject = async () => {
    if (!leaseToReject) return;
    
    setActionLoading(leaseToReject._id);
    try {
      await apiService.rejectLease(leaseToReject._id);
      setLeases((prev) => prev.map(l => l._id === leaseToReject._id ? { ...l, status: 'rejected' } : l));
      setShowRejectModal(false);
      setLeaseToReject(null);
      setToastMessage('تم رفض الطلب بنجاح');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch {}
    setActionLoading(null);
  };

  /**
   * Tenant actions
   */
  const handleCancel = (lease: Lease) => {
    setLeaseToCancel(lease);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!leaseToCancel) return;
    
    setCancelling(leaseToCancel._id);
    try {
      await apiService.cancelLease(leaseToCancel._id);
      setLeases((prev) => prev.map(l => l._id === leaseToCancel._id ? { ...l, status: 'cancelled' } : l));
      setShowCancelModal(false);
      setLeaseToCancel(null);
      setToastMessage('تم إلغاء الطلب بنجاح');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch {}
    setCancelling(null);
  };

  /**
   * Edit functionality
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
      setToastMessage('تم تحديث البيانات بنجاح');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error('فشل تحديث البيانات', err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Loading states
  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[#fff6ec] flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جاري التحميل...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-[#fff6ec] flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-500 text-xl">يجب تسجيل الدخول</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-[#fff6ec] flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-500 text-xl">{error}</p>
        </div>
      </div>
    );
  }

  // Filter leases by status
  const pendingLeases = leases.filter(l => l.status === 'pending');
  const activeLeases = leases.filter(l => l.status === 'active');

  return (
    <div className="min-h-screen bg-[#fff6ec]" dir="rtl">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-orange-600 mb-2">
              {user.role === 'landlord' ? 'إدارة العقود' : 'العقود والطلبات'}
            </h1>
            <p className="text-gray-600 text-lg">
              {user.role === 'landlord' 
                ? 'إدارة طلبات الإيجار والعقود النشطة' 
                : 'متابعة طلبات الإيجار والعقود النشطة'
              }
            </p>
          </div>

          {/* Pending Requests Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-orange-700 flex items-center">
                <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-bold ml-3">
                  {pendingLeases.length}
                </span>
                الطلبات المعلقة
              </h2>
              <button
                onClick={() => setOpenRequests(!openRequests)}
                className="text-orange-600 hover:text-orange-800 transition-colors"
              >
                <svg
                  className={`w-6 h-6 transition-transform ${openRequests ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {openRequests && (
              <div className="grid gap-6">
                {pendingLeases.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                    <div className="text-gray-400 text-6xl mb-4">📋</div>
                    <p className="text-gray-500 text-lg">لا توجد طلبات معلقة</p>
                  </div>
                ) : (
                  pendingLeases.map((lease) => {
                    const property = properties[lease.propertyId || ''];
                    return (
                      <LeaseCard
                        key={lease._id}
                        lease={lease}
                        property={property}
                        userRole={user.role}
                        onEdit={user.role === 'tenant' ? () => openEdit(lease) : undefined}
                        onCancel={user.role === 'tenant' ? () => handleCancel(lease) : undefined}
                        onAccept={user.role === 'landlord' ? () => handleAccept(lease._id) : undefined}
                        onReject={user.role === 'landlord' ? () => handleReject(lease) : undefined}
                        cancelling={cancelling === lease._id}
                        actionLoading={actionLoading === lease._id}
                      />
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Active Contracts Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-green-700 flex items-center">
                <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-bold ml-3">
                  {activeLeases.length}
                </span>
                العقود النشطة
              </h2>
              <button
                onClick={() => setOpenContracts(!openContracts)}
                className="text-green-600 hover:text-green-800 transition-colors"
              >
                <svg
                  className={`w-6 h-6 transition-transform ${openContracts ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {openContracts && (
              <div className="grid gap-6">
                {activeLeases.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                    <div className="text-gray-400 text-6xl mb-4">📄</div>
                    <p className="text-gray-500 text-lg">لا توجد عقود نشطة</p>
                  </div>
                ) : (
                  activeLeases.map((lease) => {
                    const property = properties[lease.propertyId || ''];
                    return (
                      <LeaseCard
                        key={lease._id}
                        lease={lease}
                        property={property}
                        userRole={user.role}
                        onView={() => router.push(`/leases/${lease._id}`)}
                      />
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
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

      {showCancelModal && leaseToCancel && (
        <ConfirmationModal
          title="تأكيد إلغاء الطلب"
          message={`هل أنت متأكد أنك تريد إلغاء الطلب الخاص بعقار ${properties[leaseToCancel.propertyId || '']?.name || '-'}؟`}
          confirmText="تأكيد الإلغاء"
          cancelText="تراجع"
          onConfirm={confirmCancel}
          onCancel={() => {
            setShowCancelModal(false);
            setLeaseToCancel(null);
          }}
        />
      )}

      {showRejectModal && leaseToReject && (
        <ConfirmationModal
          title="تأكيد رفض الطلب"
          message={`هل أنت متأكد أنك تريد رفض الطلب الخاص بعقار ${properties[leaseToReject.propertyId || '']?.name || '-'}؟`}
          confirmText="تأكيد الرفض"
          cancelText="تراجع"
          onConfirm={confirmReject}
          onCancel={() => {
            setShowRejectModal(false);
            setLeaseToReject(null);
          }}
        />
      )}

      {/* Toast */}
      {showToast && (
        <SuccessToast message={toastMessage} onClose={() => setShowToast(false)} />
      )}
    </div>
  );
}