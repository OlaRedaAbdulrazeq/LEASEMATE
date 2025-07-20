'use client';

import { useState } from 'react';
import RentalContractTemplate from '@/components/RentalContractTemplate';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

import { useSearchParams } from 'next/navigation';

export default function ContractPreviewPage() {
  const [agreed, setAgreed] = useState(false);
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId');

  return (
    <div className="min-h-screen bg-[#fff6ec] flex flex-col items-center py-10 px-4 pt-20">
      <Navbar />
      <h2 className="text-xl font-bold text-orange-600 mb-4">
        بنود عقد إيجار الشقة
      </h2>

      <p className="text-gray-700 text-center max-w-2xl mb-6">
        الرجاء قراءة عقد الإيجار التالي بعناية. هذا هو العقد الرسمي الذي سيتم توقيعه بينك وبين المالك.
        يجب أن توافق على جميع البنود قبل المتابعة.
      </p>

      <div className="w-full max-w-5xl border border-gray-300 bg-white shadow rounded-md p-6">
        <RentalContractTemplate />
      </div>

      <div className="mt-6 flex flex-col items-center">
        <label className="inline-flex items-center mb-4">
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-orange-600"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span className="ml-2 text-gray-800 font-medium">
            أؤكد أنني قرأت العقد بالكامل وأوافق على جميع البنود المذكورة
          </span>
        </label>

        <Link
          href={propertyId ? `/contract/new?propertyId=${propertyId}` : '#'}
          className={`px-6 py-2 rounded-md text-white font-semibold transition ${
            agreed ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
          onClick={(e) => {
            if (!agreed) e.preventDefault();
          }}
        >
          موافق، وأرغب في إدخال بياناتي
        </Link>
      </div>
    </div>
  );
}
