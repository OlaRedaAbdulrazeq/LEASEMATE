'use client';
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const BlockedPage = () => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-md text-center max-w-md">
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">تم حظرك من المنصة</h1>
        <p className="text-gray-700 dark:text-gray-200 mb-2">لقد تم حظرك من استخدام المنصة بسبب تكرار التعليقات المسيئة.</p>
        <p className="text-gray-500 dark:text-gray-400 mb-4">إذا كنت تعتقد أن هناك خطأ، يرجى التواصل مع الإدارة.</p>
        <button
          onClick={handleLogout}
          className="mt-6 w-full bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors"
        >
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
};

export default BlockedPage; 