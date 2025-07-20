// frontend/src/app/contract/requests/[requestId]/initiate/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { apiService } from '@/services/api';

interface Lease {
  _id: string;
  propertyId?: string;
  // ...other fields as needed
}
interface LeaseResponse {
  data: { lease: Lease };
}
interface PropertyResponse {
  data: { unit: any };
}

export default function InitiateContractPage() {
  const { leaseId } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    landlordFullNameArabic: '',
    landlordNationalId: '',
    landlordPhoneNumber: '',
    landlordAddress: '',
  });
  const [property, setProperty] = useState<any>(null);
  const [lease, setLease] = useState<any>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  // Fetch lease and property data
  useEffect(() => {
    if (!leaseId) return;
    (async () => {
      try {
        const leaseRes = await apiService.getLeaseById(leaseId as string) as LeaseResponse;
        if (!leaseRes?.data?.lease) {
          console.error('Lease not found in response:', leaseRes);
          return;
        }
        setLease(leaseRes.data.lease);
        const propertyId = leaseRes.data.lease.propertyId;
        if (typeof propertyId === 'string' && propertyId) {
          const propRes = await apiService.getPropertyById(propertyId) as PropertyResponse;
          if (!propRes?.data?.unit) {
            console.error('Property not found in response:', propRes);
            return;
          }
          setProperty(propRes.data.unit);
        }
      } catch (err) {
        console.error('Error fetching lease or property:', err);
      }
    })();
  }, [leaseId]);


  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (formData.landlordFullNameArabic.trim().split(' ').length < 3) {
      newErrors.landlordFullNameArabic = 'الاسم يجب أن يكون ثلاثي';
    }
    if (!/^\d{10,14}$/.test(formData.landlordNationalId)) {
      newErrors.landlordNationalId = 'رقم البطاقة يجب أن  14 رقم';
    }
    if (!/^\+?\d{9,15}$/.test(formData.landlordPhoneNumber)) {
      newErrors.landlordPhoneNumber = 'رقم الهاتف غير صحيح';
    }
    if (!formData.landlordAddress.trim()) {
      newErrors.landlordAddress = 'العنوان مطلوب';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      setIsSaving(true);
      if (!leaseId || typeof leaseId !== 'string') throw new Error('معرف العقد غير صالح');
      // Send property info with the request
      await apiService.approveLease(leaseId, {
        ...formData,
        propertyAddress: property?.address,
        rentAmount: property?.pricePerMonth,
        depositAmount: property?.deposit,
        // add any other property fields you want to save
      });
      router.push('/contract/confirmation');
    } catch (error) {
      console.error('Error in contract approval:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Remove property display from the UI
  return (
    <div className="min-h-screen bg-[#fff6ec] py-10 px-4" dir="rtl">
      <Navbar />
      <div className="max-w-7xl mx-auto pt-10">
        <h2 className="text-xl font-bold mb-6 text-orange-600">إنشاء عقد جديد (ادخال البيانات)</h2>
        {/* Property display removed */}
        <div className="flex justify-center">
          <div className="space-y-4 w-full max-w-md pr-2">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
              <InputField
                name="landlordFullNameArabic"
                label="الاسم  "
                value={formData.landlordFullNameArabic}
                onChange={handleChange}
                error={errors.landlordFullNameArabic}
                placeholder="أدخل الاسم الثلاثي"
              />
              <InputField
                name="landlordNationalId"
                label="رقم بطاقة  "
                value={formData.landlordNationalId}
                onChange={handleChange}
                error={errors.landlordNationalId}
                placeholder="أدخل رقم البطاقة (14 رقم)"
                maxLength={14}
              />
              <InputField
                name="landlordPhoneNumber"
                label="رقم الهاتف  "
                value={formData.landlordPhoneNumber}
                onChange={handleChange}
                error={errors.landlordPhoneNumber}
                placeholder="رقم الهاتف"
                maxLength={15}
              />
              <InputField
                name="landlordAddress"
                label=" عنوان البطاقة  "
                value={formData.landlordAddress}
                onChange={handleChange}
                error={errors.landlordAddress}
                placeholder="أدخل عنوان البطاقة  "
              />
              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full bg-orange-500 dark:bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 dark:hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'جاري الحفظ...' : 'حفظ البيانات'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({
  name,
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  maxLength
}: {
  name: string;
  label: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
        className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-white ${error ? 'border-red-500' : ''}`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
