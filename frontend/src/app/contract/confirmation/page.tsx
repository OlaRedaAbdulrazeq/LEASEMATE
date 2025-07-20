"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from '@/components/Navbar';

export default function ContractConfirmation() {
  const router = useRouter();
  const { user } = useAuth();

  const isLandlord = user?.role === 'landlord';
  const isTenant = user?.role === 'tenant';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fff6ec] px-4 pt-20" dir="rtl">
      <Navbar />
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          {isLandlord ? (
            <>
              <h2 className="text-2xl font-bold mb-4 text-orange-600">تم إنشاء العقد بنجاح</h2>
              <p className="mb-6 text-gray-700 dark:text-gray-300">
                تم الموافقة على طلب الإيجار وإنشاء العقد بنجاح. يمكنك الآن متابعة العقود النشطة.
              </p>
            </>
          ) : isTenant ? (
            <>
              <h2 className="text-2xl font-bold mb-4 text-orange-600">تم إرسال طلبك بنجاح</h2>
              <p className="mb-6 text-gray-700 dark:text-gray-300">
                تم استلام طلبك بنجاح. يرجى الانتظار حتى يتم الموافقة عليه من قبل المالك.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-4 text-orange-600">تم إنشاء العقد بنجاح</h2>
              <p className="mb-6 text-gray-700 dark:text-gray-300">
                تم إنشاء العقد بنجاح. يمكنك الآن متابعة العقود.
              </p>
            </>
          )}
        </div>
        
        <button
          className="w-full bg-orange-500 dark:bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 dark:hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors mb-2"
          onClick={() => router.push("/leases")}
        >
          {isLandlord ? "عرض جميع العقود" : "عرض جميع الطلبات والعقود"}
        </button>
      </div>
    </div>
  );
} 