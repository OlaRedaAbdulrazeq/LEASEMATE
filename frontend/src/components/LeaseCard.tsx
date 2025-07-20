import { StatusBadge } from './StatusBadge';
import { ActionButton } from './ActionButton';

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

interface LeaseCardProps {
  lease: Lease;
  property?: Property;
  userRole: 'tenant' | 'landlord' | 'admin';
  onEdit?: () => void;
  onCancel?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  onView?: () => void;
  cancelling?: boolean;
  actionLoading?: boolean;
}

export const LeaseCard = ({
  lease,
  property,
  userRole,
  onEdit,
  onCancel,
  onAccept,
  onReject,
  onView,
  cancelling,
  actionLoading
}: LeaseCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'active':
        return 'green';
      case 'rejected':
        return 'red';
      case 'cancelled':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ar-EG');
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return `${amount.toLocaleString('ar-EG')} ج.م`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100" > 
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {property?.name || lease.propertyAddress || 'عقار غير محدد'}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center">
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {property?.address || lease.propertyAddress || '-'}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {property?.city || '-'}
              </span>
            </div>
          </div>
          <StatusBadge status={lease.status} />
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Tenant Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 ml-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              بيانات المستأجر
            </h4>
            <div className="space-y-3">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1">الاسم</span>
                <span className="text-gray-900 font-semibold text-lg">
                  {lease.tenantDetails?.fullNameArabic || '-'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1">رقم الهاتف</span>
                <span className="text-gray-900 font-semibold">
                  {lease.tenantDetails?.phoneNumber || '-'}
                </span>
              </div>
              {userRole === 'landlord' && (
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 mb-1">العنوان</span>
                  <span className="text-gray-900 font-semibold">
                    {lease.tenantDetails?.address || '-'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Contract Details */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 ml-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              تفاصيل العقد
            </h4>
            <div className="space-y-3">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1">تاريخ البداية</span>
                <span className="text-gray-900 font-semibold">
                  {formatDate(lease.startDate)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1">تاريخ الانتهاء</span>
                <span className="text-gray-900 font-semibold">
                  {formatDate(lease.endDate)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1">الإيجار الشهري</span>
                <span className="text-green-600 font-bold text-lg">
                  {formatCurrency(lease.rentAmount)}
                </span>
              </div>
              {lease.depositAmount && (
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 mb-1">الوديعة</span>
                  <span className="text-blue-600 font-bold text-lg">
                    {formatCurrency(lease.depositAmount)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
          {lease.status === 'pending' && userRole === 'tenant' && (
            <>
              {onEdit && (
                <ActionButton
                  onClick={onEdit}
                  variant="primary"
                  size="sm"
                  icon="edit"
                >
                  تعديل
                </ActionButton>
              )}
              {onCancel && (
                <ActionButton
                  onClick={onCancel}
                  variant="danger"
                  size="sm"
                  icon="cancel"
                  loading={cancelling}
                >
                  إلغاء الطلب
                </ActionButton>
              )}
            </>
          )}

          {lease.status === 'pending' && userRole === 'landlord' && (
            <>
              {onAccept && (
                <ActionButton
                  onClick={onAccept}
                  variant="success"
                  size="sm"
                  icon="check"
                >
                  تعاقد
                </ActionButton>
              )}
              {onReject && (
                <ActionButton
                  onClick={onReject}
                  variant="danger"
                  size="sm"
                  icon="x"
                  loading={actionLoading}
                >
                  رفض
                </ActionButton>
              )}
            </>
          )}

          {lease.status === 'active' && onView && (
            <ActionButton
              onClick={onView}
              variant="primary"
              size="sm"
              icon="eye"
            >
              عرض العقد
            </ActionButton>
          )}
        </div>
      </div>
    </div>
  );
}; 