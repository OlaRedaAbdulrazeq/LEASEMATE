'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiService } from '@/services/api';
import RentalContractTemplate from '@/components/RentalContractTemplate';

export default function LeasePreviewPage() {
  const { leaseId } = useParams();
  const [leaseData, setLeaseData] = useState<any>(null);
  const [propertyData, setPropertyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLease = async () => {
      try {
        const res: any = await apiService.getLeaseById(leaseId as string);
        setLeaseData(res.data.lease);
      } catch (err) {
        setError('فشل تحميل بيانات العقد');
      } finally {
        setLoading(false);
      }
    };
    if (leaseId) fetchLease();
  }, [leaseId]);

  useEffect(() => {
    if (leaseData && leaseData.propertyId) {
      apiService.getUnitById(leaseData.propertyId)
        .then((res: any) => setPropertyData(res.data.unit))
        .catch(() => setPropertyData(null));
    }
  }, [leaseData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <p className="text-gray-600">...جاري تحميل العقد</p>
      </div>
    );
  }

  if (error || !leaseData) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <p className="text-red-500">{error || 'العقد غير موجود'}</p>
      </div>
    );
  }

  // Map nested leaseData to flat contractData for the template
  const contractData = {
    landlordName: leaseData.landlordDetails?.fullNameArabic || '',
    landlordID: leaseData.landlordDetails?.nationalId || '',
    landlordAddress: leaseData.landlordDetails?.address || '',
    tenantName: leaseData.tenantDetails?.fullNameArabic || '',
    tenantID: leaseData.tenantDetails?.nationalId || '',
    tenantAddress: leaseData.tenantDetails?.address || '',
    propertyDescription: propertyData ? `${propertyData.type} - ${propertyData.address}` : leaseData.propertyAddress || '',
    rentAmount: leaseData.rentAmount?.toString() || '',
    depositAmount: leaseData.depositAmount?.toString() || '',
    startDate: leaseData.startDate ? leaseData.startDate.slice(0, 10) : '',
    endDate: leaseData.endDate ? leaseData.endDate.slice(0, 10) : '',
    status: leaseData.status || '',
    createdAt: leaseData.createdAt,
    propertyType: propertyData?.type || '',
    propertyAddress: propertyData?.address || leaseData.propertyAddress || '',
    // Add more fields if needed
  };

  return (
    <div className="min-h-screen bg-[#fff6ec] flex flex-col items-center justify-center py-10 px-4" dir="rtl">
      <div className="w-full max-w-5xl bg-white p-8 rounded shadow">
        {leaseData.pdfUrl && (
          <div className="mb-6 text-center">
            <button
              type="button"
              onClick={() => window.open(leaseData.pdfUrl, '_blank')}
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold text-lg mb-4"
            >
              تحميل نسخة PDF من العقد
            </button>
          </div>
        )}
        <h1 className="text-2xl font-bold mb-6 text-center text-orange-600">معاينة عقد الإيجار</h1>
        <RentalContractTemplate data={contractData} isPreview />
      </div>
    </div>
  );
} 