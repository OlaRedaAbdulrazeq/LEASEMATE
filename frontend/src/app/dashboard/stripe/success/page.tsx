'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function SuccessPage() {
  const router = useRouter();
  const { socket, user, token } = useAuth();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let countdownInterval: NodeJS.Timeout;
    
    // If already subscribed, redirect immediately
    if (user?.isSubscribed) {
      router.replace('/unit/add');
      return;
    }
    
    // Start countdown
    countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Listen for subscription update via websocket
    if (socket && user?._id) {
      const handleSub = (data: { isSubscribed: boolean }) => {
        if (data.isSubscribed) {
          clearInterval(countdownInterval);
          router.replace('/unit/add');
        }
      };
      socket.on('subscriptionUpdated', handleSub);
      // Fallback: redirect after 5s anyway
      timeout = setTimeout(() => {
        clearInterval(countdownInterval);
        router.replace('/unit/add');
      }, 5000);
      return () => {
        socket.off('subscriptionUpdated', handleSub);
        clearTimeout(timeout);
        clearInterval(countdownInterval);
      };
    } else {
      // Fallback: redirect after 5s
      timeout = setTimeout(() => {
        clearInterval(countdownInterval);
        router.replace('/unit/add');
      }, 5000);
      return () => {
        clearTimeout(timeout);
        clearInterval(countdownInterval);
      };
    }
  }, [socket, user, router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-green-100 dark:border-gray-700 p-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">تم الاشتراك بنجاح!</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">سيتم تحويلك تلقائياً لإضافة وحدة جديدة خلال {countdown} ثانية...</p>
          <div className="flex justify-center mb-6">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
          <button
            onClick={() => router.replace('/unit/add')}
            className="w-full bg-orange-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
          >
            الانتقال الآن
          </button>
        </div>
      </div>
    </main>
  );
}
