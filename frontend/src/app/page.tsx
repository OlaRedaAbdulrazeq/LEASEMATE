'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const [showVerifiedAlert, setShowVerifiedAlert] = useState(true);

  useEffect(() => {
    if (!isLoading && user) {
      // إذا كان المستخدم موثّقًا، يمكن توجيهه للداشبورد إذا أردت، لكن لا تعيد التوجيه إذا لم يكن مسجلاً الدخول
      // if (user.verificationStatus && user.verificationStatus.status === 'approved') {
      //   router.push('/dashboard');
      // }
      // else if (!user.verificationStatus || user.verificationStatus.status === 'pending') {
      //   // Stay on homepage to show pending message
      // }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Show verification pending message for authenticated users
  if (user && user.verificationStatus && user.verificationStatus.status === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Navbar />
        <div className="flex flex-col items-center justify-center w-full">
          <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Pending for approval</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">When admin approves, we will tell you.</p>
        </div>
      </div>
    );
  }

  if (user && (!user.verificationStatus || user.verificationStatus.status === 'rejected')) {
    // Redirect to verification page or show appropriate message
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Navbar />
        <div className="flex flex-col items-center justify-center w-full">
          <div className="w-24 h-24 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Verification Required</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">Please complete your verification to access the platform.</p>
        </div>
      </div>
    );
  }

  // رسالة توثيق الهوية للمستخدم الموثق
  const showVerified = user && user.verificationStatus && user.verificationStatus.status === 'approved' && showVerifiedAlert;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      {showVerified && (
        <div className="fixed left-1/2 top-20 transform -translate-x-1/2 z-50 max-w-2xl w-full px-4">
          <div className="flex items-center justify-between bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-xl p-4 shadow-md gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <span className="font-semibold text-green-800 dark:text-green-200">Approved</span>
                <p className="text-sm text-green-700 dark:text-green-300">Your identity has been verified successfully.</p>
              </div>
            </div>
            <button
              onClick={() => setShowVerifiedAlert(false)}
              className="ml-4 text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 rounded-full p-1 focus:outline-none"
              aria-label="Close verification alert"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      {/* Hero Section */}
      <main className="pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              {t('home.heroTitle').split(', ')[0]},{' '}
              <span className="text-orange-600 dark:text-orange-400">{t('home.heroTitle').split(', ')[1]}</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              {t('home.heroSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <button className="bg-orange-500 dark:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-orange-600 dark:hover:bg-orange-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  {t('home.getStarted')}
                </button>
              </Link>
              <Link href="/properties">
                <button className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-8 py-4 rounded-lg font-semibold text-lg border-2 border-gray-300 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors shadow-lg">
                  {t('home.browseProperties')}
                </button>
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('home.digitalPayments')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('home.digitalPaymentsDesc')}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('home.maintenanceRequests')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('home.maintenanceRequestsDesc')}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('home.digitalContracts')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('home.digitalContractsDesc')}</p>
            </div>
          </div>

          {/* Featured Properties */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t('home.featuredProperties')}</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">{t('home.featuredPropertiesDesc')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <img 
                  alt="The Urban Loft" 
                  className="w-full h-64 object-cover" 
                  src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">The Urban Loft</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">123 Main Street, Downtown</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">$1,200/mo</span>
                    <span className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 px-3 py-1 rounded-full text-sm font-medium">{t('home.available')}</span>
                  </div>
                  <button className="w-full bg-orange-500 dark:bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 dark:hover:bg-orange-700 transition-colors">
                    {t('home.viewDetails')}
                  </button>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <img 
                  alt="Sunset Villa" 
                  className="w-full h-64 object-cover" 
                  src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sunset Villa</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">456 Ocean View Drive, Seaside</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">$1,800/mo</span>
                    <span className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 px-3 py-1 rounded-full text-sm font-medium">{t('home.available')}</span>
                  </div>
                  <button className="w-full bg-orange-500 dark:bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 dark:hover:bg-orange-700 transition-colors">
                    {t('home.viewDetails')}
                  </button>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <img 
                  alt="The Garden House" 
                  className="w-full h-64 object-cover" 
                  src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">The Garden House</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">789 Pine Street, Suburbia</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">$1,500/mo</span>
                    <span className="bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 px-3 py-1 rounded-full text-sm font-medium">{t('home.comingSoon')}</span>
                  </div>
                  <button className="w-full bg-orange-500 dark:bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 dark:hover:bg-orange-700 transition-colors">
                    {t('home.viewDetails')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg mb-20">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">{t('home.whyChoose')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">500+</div>
                <div className="text-gray-600 dark:text-gray-300">{t('home.happyTenants')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">200+</div>
                <div className="text-gray-600 dark:text-gray-300">{t('home.properties')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">98%</div>
                <div className="text-gray-600 dark:text-gray-300">{t('home.satisfactionRate')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">24/7</div>
                <div className="text-gray-600 dark:text-gray-300">{t('home.support')}</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-orange-500 dark:bg-orange-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3h6v6H3V3zm6 6h6v6H9V9zm6 6h6v6h-6v-6z" fill="currentColor"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">LeaseMate</h3>
              </div>
              <p className="text-gray-400 dark:text-gray-300 mb-4">{t('home.footerDesc')}</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">{t('home.quickLinks')}</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-400 dark:text-gray-300 hover:text-white transition-colors">{t('home.home')}</Link></li>
                <li><Link href="/properties" className="text-gray-400 dark:text-gray-300 hover:text-white transition-colors">{t('home.properties')}</Link></li>
                <li><Link href="/dashboard" className="text-gray-400 dark:text-gray-300 hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/contact" className="text-gray-400 dark:text-gray-300 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-gray-400">
                <p>123 LeaseMate Lane</p>
                <p>Rental City, RC 12345</p>
                <p>support@leasemate.com</p>
                <p>(123) 456-7890</p>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.6.58-2.46.67.88-.53 1.56-1.37 1.88-2.38-.83.49-1.74.85-2.7 1.03C18.4 4.5 17.29 4 16.08 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98-3.56-.18-6.72-1.89-8.83-4.48-.37.63-.58 1.37-.58 2.15 0 1.49.76 2.81 1.91 3.58-.7-.02-1.36-.21-1.94-.53v.05c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.52 8.52 0 0 1-5.33 1.84c-.35 0-.69-.02-1.03-.06A12.03 12.03 0 0 0 8.47 20c7.75 0 11.99-6.42 11.99-12v-.54A8.54 8.54 0 0 0 24 6.3z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.62 14.38h-2.12v-5.26c0-1.25-.45-2.1-1.57-2.1-.86 0-1.32.58-1.54 1.15-.08.2-.1.48-.1.76v5.45H8.17s.03-6.18 0-6.8h2.12v.9c.28-.45.78-.9 1.92-.9 1.4 0 2.45 1.09 2.45 3.45v3.35zM6.98 9.02c-.75 0-1.25-.5-1.25-1.16 0-.66.5-1.16 1.25-1.16s1.25.5 1.25 1.16c0 .66-.5 1.16-1.25 1.16zM5.86 14.38V7.58h2.24v6.8H5.86z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 LeaseMate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
