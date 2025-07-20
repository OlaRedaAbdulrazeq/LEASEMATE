'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import React from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/services/api';

export default function NewContractPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId') || '';
  console.log('propertyId from URL:', propertyId);

  

  const [landlordId, setLandlordId] = useState<string | null>(null);
  const [unitInfo, setUnitInfo] = useState<{ pricePerMonth?: number; deposit?: number; address?: string }>({});

  useEffect(() => {
    if (!propertyId) {
      console.log('No propertyId, skipping fetch.');
      return;
    }
    apiService.getUnitById(propertyId)
      .then((res: any) => {
        console.log('Unit fetch success:', res);
        setLandlordId(res.data.unit.ownerId);
        setUnitInfo({
          pricePerMonth: res.data.unit.pricePerMonth,
          deposit: res.data.unit.deposit,
          address: res.data.unit.address,
        });
      })
      .catch((err) => {
        console.log('Unit fetch failed:', err);
        setLandlordId(null);
        setUnitInfo({});
      });
  }, [propertyId]);

  useEffect(() => {
    console.log('landlordId state changed:', landlordId);
  }, [landlordId]);


  const [formData, setFormData] = useState({
    fullNameArabic: '',
    nationalId: '',
    phoneNumber: '',
    address: '',
    startDate: '',
    endDate: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (formData.fullNameArabic.trim().split(' ').length < 3) {
      newErrors.fullNameArabic = 'الاسم يجب أن يكون ثلاثي';
    }
    
    if (!/^\d{14}$/.test(formData.nationalId)) {
      newErrors.nationalId = 'رقم البطاقة يجب أن يكون 14 رقم';
    }
    
    if (!/^01\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'رقم الهاتف غير صحيح';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'العنوان مطلوب';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'تاريخ البداية مطلوب';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'تاريخ النهاية مطلوب';
    }
    
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'تاريخ النهاية يجب أن يكون بعد البداية';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSave = async () => {
    if (!validate() || !landlordId) return;

    try {
      setIsSaving(true);
      const tenantId = user?._id || "687806170fb7249d45c6d914";
      const requestData = {
        tenantId,
        landlordId,
        propertyId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        fullNameArabic: formData.fullNameArabic,
        nationalId: formData.nationalId,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        propertyAddress: unitInfo.address,
        rentAmount: unitInfo.pricePerMonth,
        depositAmount: unitInfo.deposit,
      };
      const response = await axios.post('http://localhost:5000/api/lease/create', requestData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Reset form after successful submission
      setFormData({
        fullNameArabic: '',
        nationalId: '',
        phoneNumber: '',
        address: '',
        startDate: '',
        endDate: ''
      });
      router.push('/contract/confirmation'); // Redirect to pending page after successful submission
    } catch (err: any) {
      if (err.response?.data?.message) {
        // Handle validation errors from backend
        if (Array.isArray(err.response.data.message)) {
          const backendErrors: { [key: string]: string } = {};
          err.response.data.message.forEach((error: any) => {
            backendErrors[error.path] = error.msg;
          });
          setErrors(backendErrors);
        } else {
          // handle backend error
        }
      } else {
        // handle generic error
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff6ec] flex items-center justify-center px-4 pt-20" dir="rtl">
      <Navbar />
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-orange-600">طلب تعاقد مع المالك  </h2>
        
        <div className="space-y-4">
          <InputField 
            name="fullNameArabic" 
            label="الاسم كامل" 
            value={formData.fullNameArabic} 
            onChange={handleChange} 
            error={errors.fullNameArabic} 
            placeholder="أدخل الاسم الثلاثي"
          />
          
          <InputField 
            name="nationalId" 
            label="رقم البطاقة" 
            value={formData.nationalId} 
            onChange={handleChange} 
            error={errors.nationalId}
            placeholder="أدخل رقم البطاقة (14 رقم)"
            maxLength={14}
          />
          
          <InputField 
            name="phoneNumber" 
            label="رقم الهاتف" 
            value={formData.phoneNumber} 
            onChange={handleChange} 
            error={errors.phoneNumber}
            placeholder="01xxxxxxxxx"
            maxLength={11}
          />
          
          <InputField 
            name="address" 
            label="عنوان الإقامة" 
            value={formData.address} 
            onChange={handleChange} 
            error={errors.address}
            placeholder="أدخل العنوان كاملاً"
          />
          
          <InputField 
            name="startDate" 
            label="تاريخ البداية" 
            type="date" 
            value={formData.startDate} 
            onChange={handleChange} 
            error={errors.startDate}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
          
          <InputField 
            name="endDate" 
            label="تاريخ النهاية" 
            type="date" 
            value={formData.endDate} 
            onChange={handleChange} 
            error={errors.endDate}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />

          <button
            onClick={handleSave}
            disabled={!landlordId || isSaving}
            className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'جاري الإرسال...' : 'إرسال الطلب'}
          </button>
        </div>
      </div>
    </div>
  );
}

function InputField({ 
  name, 
  label, 
  type = "text", 
  value, 
  onChange, 
  error, 
  placeholder, 
  maxLength,
  className 
}: {
  name: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}) {
  return (
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
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        dir="rtl"
      />
      {error && <p className="text-red-500 text-sm mt-1 text-right">{error}</p>}
    </div>
  );
}