'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { apiService } from '@/services/api';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '@/components/Logo';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);


interface User {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'landlord' | 'tenant' | 'admin';
  verificationStatus?: {
    status: 'pending' | 'approved' | 'rejected';
    uploadedIdUrl?: string;
    selfieUrl?: string;
  };
  createdAt: string;
}

interface AbusiveUser {
  _id: string;
  name: string;
  phone?: string;
  role: 'landlord' | 'tenant';
  abusiveCommentsCount: number;
  isBlocked?: boolean;
}

export default function AdminDashboard() {
  const { user, token, logout, isLoading: authLoading, socket } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6; // Number of users per page
 
  const [activeTab, setActiveTab] = useState<'table' | 'dashboard' | 'images' | 'abusive' | 'support'>('table');
  
  // Sidebar collapse states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSupportSidebarCollapsed, setIsSupportSidebarCollapsed] = useState(false);

  // State for pending images (now pending units)
  const [pendingUnits, setPendingUnits] = useState<any[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [imageActionLoading, setImageActionLoading] = useState<string | null>(null);
  // State for unit review modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [pendingRejectUnit, setPendingRejectUnit] = useState<any>(null);
  // State for image preview modal
  const [selectedImage, setSelectedImage] = useState<null | { url: string; unitName: string; ownerName?: string }>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [abusiveUsers, setAbusiveUsers] = useState<AbusiveUser[]>([]);
  const [loadingAbusive, setLoadingAbusive] = useState(false);
  const [blockLoadingId, setBlockLoadingId] = useState<string | null>(null);
  
  // Support chat state
  const [supportChats, setSupportChats] = useState<any[]>([]);
  const [loadingSupportChats, setLoadingSupportChats] = useState(false);
  const [selectedSupportChat, setSelectedSupportChat] = useState<any>(null);
  const [supportMessages, setSupportMessages] = useState<any[]>([]);
  const [supportText, setSupportText] = useState('');

  // Check admin access and handle URL parameters
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login');
        return;
      } else if (user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
    }
    
    // Handle URL parameters for tab switching
    const tabParam = searchParams.get('tab');
    if (tabParam && ['table', 'dashboard', 'images', 'abusive', 'support'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [user?.role, authLoading, router, searchParams]);

  useEffect(() => {
    if (token && user?.role === 'admin') {
      fetchUsers();
      fetchAbusiveUsers();
    }
  }, [token, user?.role]);

  const fetchSupportChats = useCallback(async () => {
    if (!token) return;
    setLoadingSupportChats(true);
    try {
      const response = await fetch('http://localhost:5000/api/support-chat/admin', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setSupportChats(data || []);
    } catch (error) {
      console.error('Error fetching support chats:', error);
      setSupportChats([]);
    } finally {
      setLoadingSupportChats(false);
    }
  }, [token]);

  // Fetch support chats when admin loads the page to show unread count
  useEffect(() => {
    if (token && user?.role === 'admin') {
      fetchSupportChats();
    }
  }, [token, user?.role, fetchSupportChats]);

  const fetchUsers = async () => {
    if (!token) return;
    try {
      const response = await apiService.getUsers(token) as { users: User[] };
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationAction = async (userId: string, action: 'approve' | 'reject') => {
    if (!token) return;
    try {
      await apiService.updateVerificationStatus(userId, action, token);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating verification status:', error);
    }
  };

  // Fetch pending images for admin
  const fetchPendingImages = async () => {
    if (!token) return;
    setLoadingImages(true);
    try {
      const res = await apiService.getPendingUnitImages(token) as { data: { pendingUnits?: any[], pendingImages?: any[] } };
      setPendingUnits(res.data.pendingUnits || res.data.pendingImages || []);
    } catch (err) {
      setPendingUnits([]);
    } finally {
      setLoadingImages(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'images' && token && user?.role === 'admin') {
      fetchPendingImages();
    }
  }, [activeTab, token, user?.role]);

  const handleImageReview = async (unitId: string, imageUrl: string, action: 'approve' | 'reject') => {
    if (!token) return;
    setImageActionLoading(unitId + imageUrl + action);
    try {
      await apiService.reviewUnitImage({ unitId, imageUrl, action, token });
      // Remove image from list after action
      setPendingUnits((prev) => prev.filter(unit => unit.unitId !== unitId));
    } catch (err) {
      // handle error
    } finally {
      setImageActionLoading(null);
    }
  };

  // Approve unit handler
  const handleApproveUnit = async (unitId: string) => {
    if (!token) return;
    setImageActionLoading(unitId + 'approve');
    try {
      await apiService.approveUnit({ unitId, token });
      setPendingUnits((prev) => prev.filter(unit => unit.unitId !== unitId));
    } catch (err) {
      // handle error
    } finally {
      setImageActionLoading(null);
    }
  };

  // Approve all images for a unit
  const handleApproveAll = async (unitId: string) => {
    if (!token) return;
    setImageActionLoading(unitId + 'approveAll');
    try {
      await apiService.approveAllUnitImages({ unitId, token });
      setPendingUnits((prev) => prev.filter(unit => unit.unitId !== unitId));
    } catch (err) {
      // handle error
    } finally {
      setImageActionLoading(null);
    }
  };

  // Reject unit handler (open modal)
  const handleRejectUnitClick = (unit: any) => {
    setPendingRejectUnit(unit);
    setRejectReason('');
    setShowRejectModal(true);
  };

  // Reject all images for a unit (open modal)
  const handleRejectAllClick = (unit: any) => {
    setPendingRejectUnit(unit);
    setRejectReason('');
    setShowRejectModal(true);
  };

  // Confirm reject unit
  const handleRejectUnitConfirm = async () => {
    if (!token || !pendingRejectUnit) return;
    setImageActionLoading(pendingRejectUnit.unitId + 'reject');
    try {
      await apiService.rejectUnit({ unitId: pendingRejectUnit.unitId, reason: rejectReason, token });
      setPendingUnits((prev) => prev.filter(unit => unit.unitId !== pendingRejectUnit.unitId));
      setShowRejectModal(false);
      setPendingRejectUnit(null);
      setRejectReason('');
    } catch (err) {
      // handle error
    } finally {
      setImageActionLoading(null);
    }
  };

  // Confirm reject all images
  const handleRejectAllConfirm = async () => {
    if (!token || !pendingRejectUnit) return;
    setImageActionLoading(pendingRejectUnit.unitId + 'rejectAll');
    try {
      await apiService.rejectAllUnitImages({ unitId: pendingRejectUnit.unitId, reason: rejectReason, token });
      setPendingUnits((prev) => prev.filter(unit => unit.unitId !== pendingRejectUnit.unitId));
      setShowRejectModal(false);
      setPendingRejectUnit(null);
      setRejectReason('');
    } catch (err) {
      // handle error
    } finally {
      setImageActionLoading(null);
    }
  };

  const fetchAbusiveUsers = async () => {
    if (!token) return;
    setLoadingAbusive(true);
    try {
      const res = await apiService.getAbusiveUsers(token);
      setAbusiveUsers(res.users || []);
    } catch (err) {
      setAbusiveUsers([]);
    } finally {
      setLoadingAbusive(false);
    }
  };

  // Handle new support messages from socket - optimized to prevent unnecessary re-fetches
  useEffect(() => {
    if (!socket) return;

    const handleNewSupportMessage = (msg: any) => {
      console.log('🟢 Admin received new support message:', msg);
      
      // Update messages if we're in the correct chat
      if (selectedSupportChat && msg.chatId === selectedSupportChat._id) {
        setSupportMessages(prev => {
          // Check if message already exists to prevent duplicates
          const messageExists = prev.some(existingMsg => 
            existingMsg._id === msg._id || 
            (existingMsg.sender === msg.senderId && existingMsg.text === msg.text)
          );
          
          if (messageExists) {
            console.log('🟡 Message already exists, skipping duplicate');
            return prev;
          }
          
          // Replace optimistic message with real message if it exists
          const hasOptimistic = prev.some(m => m._id?.startsWith('temp-') && m.text === msg.text && m.sender === msg.senderId);
          if (hasOptimistic) {
            console.log('🔄 Replacing optimistic message with real message');
            return prev.map(m => 
              m._id?.startsWith('temp-') && m.text === msg.text && m.sender === msg.senderId
                ? { _id: msg._id, sender: msg.senderId, text: msg.text, createdAt: msg.createdAt }
                : m
            );
          }
          
          console.log('✅ Adding new message to admin chat');
          return [...prev, {
            _id: msg._id || `temp-${Date.now()}`,
            sender: msg.senderId,
            text: msg.text,
            createdAt: msg.createdAt || new Date().toISOString()
          }];
        });
      }
      
      // Update the chat list without full re-fetch to prevent "uploading itself"
      setSupportChats(prev => {
        return prev.map(chat => {
          if (chat._id === msg.chatId) {
            return {
              ...chat,
              lastMessage: msg.text,
              lastMessageAt: msg.createdAt || new Date().toISOString(),
              unreadCount: chat.unreadCount + (msg.senderId !== user?._id ? 1 : 0)
            };
          }
          return chat;
        });
      });
    };

    socket.on('newSupportMessage', handleNewSupportMessage);

    return () => {
      socket.off('newSupportMessage', handleNewSupportMessage);
    };
  }, [socket, selectedSupportChat, user?._id]);

  const handleBlockUser = async (userId: string) => {
    if (!token) return;
    setBlockLoadingId(userId);
    try {
      await apiService.blockUser(userId, token);
      fetchAbusiveUsers();
      fetchUsers();
    } catch (err) {
      // handle error
    } finally {
      setBlockLoadingId(null);
    }
  };



  const handleSupportMessageSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportText.trim() || !selectedSupportChat || !token) return;
    
    console.log('🟢 Admin sending message:', supportText, 'to chat:', selectedSupportChat._id);
    
    try {
      // Add optimistic message first
      const optimisticMessage = {
        _id: `temp-${Date.now()}`,
        sender: user?._id,
        text: supportText,
        createdAt: new Date().toISOString()
      };
      setSupportMessages(prev => [...prev, optimisticMessage]);
      
      // Send message via Socket.IO (it will save to database and broadcast)
      if (socket) {
        socket.emit('sendSupportMessage', {
          chatId: selectedSupportChat._id,
          senderId: user?._id,
          text: supportText
        });
      }
      
      setSupportText('');
    } catch (error) {
      console.error('❌ Error sending admin message:', error);
      // Remove optimistic message on error
      setSupportMessages(prev => prev.filter(msg => msg._id !== `temp-${Date.now()}`));
    }
  }, [supportText, selectedSupportChat, token, user?._id, socket]);

  const handleSelectSupportChat = useCallback((chat: any) => {
    console.log('🟢 Admin selecting support chat:', chat._id);
    setSelectedSupportChat(chat);
    // Join the support chat room
    if (socket) {
      console.log('🟢 Admin joining support chat room:', chat._id);
      socket.emit('joinSupportChat', chat._id);
    }
    // Fetch messages for this chat with retry logic
    console.log('📨 Admin fetching messages for chat:', chat._id);
    
    let retryCount = 0;
    const maxRetries = 3;
    
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/support-chat/${chat._id}/messages`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('📨 Admin fetched messages:', data.length, 'messages');
          console.log('📝 Messages details:', data.map((m: any) => ({ id: m._id, sender: m.sender, text: m.text.substring(0, 30) })));
          setSupportMessages(data);
          
          // Mark messages as read when opening chat
          if (token && user?._id) {
            fetch(`http://localhost:5000/api/support-chat/${chat._id}/read`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ userId: user._id })
            }).then(() => {
              console.log('✅ Messages marked as read');
              // Update unread count in chat list
              setSupportChats(prev => prev.map(c => 
                c._id === chat._id ? { ...c, unreadCount: 0 } : c
              ));
            }).catch(err => console.error('❌ Error marking messages as read:', err));
          }
        } else {
          console.error('❌ Failed to fetch messages:', response.status);
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`🔄 Retrying fetch messages (${retryCount}/${maxRetries})...`);
            setTimeout(fetchMessages, 1000); // Retry after 1 second
          }
        }
      } catch (error) {
        console.error('❌ Error fetching messages:', error);
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`🔄 Retrying fetch messages (${retryCount}/${maxRetries})...`);
          setTimeout(fetchMessages, 1000); // Retry after 1 second
        }
      }
    };
    
    fetchMessages();
  }, [socket, token, user?._id]);

  const filteredUsers = users.filter(user => {
    const statusMatch = selectedStatus === 'all' || user.verificationStatus?.status === selectedStatus;
    const roleMatch = selectedRole === 'all' || user.role === selectedRole;
    return statusMatch && roleMatch;
  });

  // Calculate pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  // استبعاد الأدمن من الظهور في الجدول
  const filteredNonAdminUsers = filteredUsers.filter(user => user.role !== 'admin');
  const currentUsers = filteredNonAdminUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredNonAdminUsers.length / usersPerPage);

  // Stats for dashboard
  const pendingCount = users.filter(u => u.verificationStatus?.status === 'pending').length;
  const approvedCount = users.filter(u => u.verificationStatus?.status === 'approved').length;
  const rejectedCount = users.filter(u => u.verificationStatus?.status === 'rejected').length;
  const totalUsers = users.length;
  const totalLandlords = users.filter(u => u.role === 'landlord').length;
  const totalTenants = users.filter(u => u.role === 'tenant').length;

  // Pie chart data
  const pieData = {
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [
      {
        data: [pendingCount, approvedCount, rejectedCount],
        backgroundColor: [
          'rgba(251, 191, 36, 0.7)', // yellow
          'rgba(34, 197, 94, 0.7)',  // green
          'rgba(239, 68, 68, 0.7)',  // red
        ],
        borderColor: [
          'rgba(251, 191, 36, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ring-1 ring-inset ring-green-200">
            تم التأكيد
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200">
            قيد الانتظار
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 ring-1 ring-inset ring-red-200">
            تم الرفض
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ring-1 ring-inset ring-gray-200">
            لم يتم التقديم
          </span>
        );
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Don't render if not admin
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className={`relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-stone-50'}`}>
      <div className="flex h-full grow">
        {/* Sidebar */}
        <aside className={`flex flex-col w-64 border-r p-6 shrink-0 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-8">
            <Logo size={80} />
          </div>
          
          <nav className="flex flex-col gap-2">
            <button
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === 'dashboard' ? (isDarkMode ? 'bg-orange-900 text-orange-300 font-semibold' : 'bg-orange-50 text-orange-600 font-semibold') : (isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-stone-100')}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <svg className={`${activeTab === 'dashboard' ? 'text-orange-500' : (isDarkMode ? 'text-gray-300' : 'text-gray-600')}`} fill="currentColor" height="24px" viewBox="0 0 24 24" width="24px">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
              </svg>
              <p className="text-sm font-semibold">لوحة التحكم</p>
            </button>
            <button
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === 'table' ? (isDarkMode ? 'bg-orange-900 text-orange-300 font-semibold' : 'bg-orange-50 text-orange-600 font-semibold') : (isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-stone-100')}`}
              onClick={() => setActiveTab('table')}
            >
              <svg className={`${activeTab === 'table' ? 'text-orange-500' : (isDarkMode ? 'text-gray-300' : 'text-gray-600')}`} fill="currentColor" height="24px" viewBox="0 0 24 24" width="24px">
                <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2zm0 4h18v2H3v-2z"/>
              </svg>
              <p className="text-sm font-medium">جدول المستخدمين</p>
            </button>
            <button
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === 'images' ? (isDarkMode ? 'bg-orange-900 text-orange-300 font-semibold' : 'bg-orange-50 text-orange-600 font-semibold') : (isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-stone-100')}`}
              onClick={() => setActiveTab('images')}
            >
              <svg className={`${activeTab === 'images' ? 'text-orange-500' : (isDarkMode ? 'text-gray-300' : 'text-gray-600')}`} fill="currentColor" height="24px" viewBox="0 0 24 24" width="24px">
                <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2Zm-2 0H5V5h14ZM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5Z" />
              </svg>
              <p className="text-sm font-semibold">مراجعة صور الشقق</p>
            </button>
            <button
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === 'abusive' ? (isDarkMode ? 'bg-orange-900 text-orange-300 font-semibold' : 'bg-orange-50 text-orange-600 font-semibold') : (isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-stone-100')}`}
              onClick={() => setActiveTab('abusive')}
            >
              <svg className={`${activeTab === 'abusive' ? 'text-orange-500' : (isDarkMode ? 'text-gray-300' : 'text-gray-600')}`} fill="currentColor" height="24px" viewBox="0 0 24 24" width="24px">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <p className="text-sm font-semibold">المستخدمون المسيئون</p>
            </button>
            <button
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors relative ${activeTab === 'support' ? (isDarkMode ? 'bg-orange-900 text-orange-300 font-semibold' : 'bg-orange-50 text-orange-600 font-semibold') : (isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-stone-100')}`}
              onClick={() => setActiveTab('support')}
            >
              <svg className={`${activeTab === 'support' ? 'text-orange-500' : (isDarkMode ? 'text-gray-300' : 'text-gray-600')}`} fill="currentColor" height="24px" viewBox="0 0 24 24" width="24px">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              <p className="text-sm font-semibold">رسائل دعم المستخدمين</p>
              {supportChats.some(chat => chat.unreadCount > 0) && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {supportChats.reduce((total, chat) => total + (chat.unreadCount || 0), 0)}
                </span>
              )}
            </button>
          
          </nav>
          
          <div className="mt-auto">
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors w-full mb-2 ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-stone-100'}`}
            >
              {isDarkMode ? (
                <svg className="text-yellow-400" fill="currentColor" height="24px" viewBox="0 0 24 24" width="24px">
                  <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"/>
                </svg>
              ) : (
                <svg className="text-gray-600" fill="currentColor" height="24px" viewBox="0 0 24 24" width="24px">
                  <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM6.166 17.834a.75.75 0 001.06 1.06l1.591-1.59a.75.75 0 10-1.06-1.061l-1.591 1.59zM2.25 12a.75.75 0 01.75-.75H5a.75.75 0 010 1.5H3a.75.75 0 01-.75-.75zM6.166 6.166a.75.75 0 001.06-1.06L5.636 3.515a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
                </svg>
              )}
              <p className="text-sm font-medium">{isDarkMode ? 'الوضع الفاتح' : 'الوضع الداكن'}</p>
            </button>
            
            <button
              onClick={() => {
                logout();
                router.push('/auth/login');
              }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors w-full ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-stone-100'}`}
            >
              <svg className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} fill="currentColor" height="24px" viewBox="0 0 24 24" width="24px">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
              <p className="text-sm font-medium">تسجيل الخروج</p>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-orange-50'}`}>
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' ? (
              <div className="flex flex-col items-center gap-8">
                <h1 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>لوحة التحكم</h1>
                {/* Usage Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-8">
                  <div className={`rounded-xl shadow p-6 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <p className="text-2xl font-bold text-orange-600 mb-2">{totalUsers}</p>
                    <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>إجمالي المستخدمين</p>
                  </div>
                  <div className={`rounded-xl shadow p-6 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <p className="text-2xl font-bold text-orange-600 mb-2">{totalLandlords}</p>
                    <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>المالكون</p>
                  </div>
                  <div className={`rounded-xl shadow p-6 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <p className="text-2xl font-bold text-orange-600 mb-2">{totalTenants}</p>
                    <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>المستأجرون</p>
                  </div>
                </div>
                {/* Pie Chart */}
                <div className={`rounded-xl shadow p-8 w-full max-w-xl flex flex-col items-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>توزيع حالة التأكيد</h2>
                  <Pie data={pieData} />
                </div>
              </div>
            ) : activeTab === 'images' ? (
              <div>
                <h1 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>صور الشقق قيد المراجعة</h1>
                {loadingImages ? (
                  <div className={`text-center py-12 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>جاري التحميل...</div>
                ) : pendingUnits.length === 0 ? (
                  <div className={`text-center py-12 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>لا توجد صور قيد المراجعة حالياً</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                      <thead className={`text-xs uppercase ${isDarkMode ? 'text-gray-300 bg-gray-800' : 'text-gray-500 bg-gray-50'}`}>
                        <tr>
                          <th className="px-4 py-3">الصور</th>
                          <th className="px-4 py-3">اسم الوحدة</th>
                          <th className="px-4 py-3">المالك</th>
                          <th className="px-4 py-3">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingUnits.map((unit) => (
                          <tr key={unit.unitId} className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-900 hover:bg-gray-800' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                            <td className="py-2 px-4">
                              <div className="flex gap-2 flex-wrap">
                                {unit.images.map((img: any, idx: number) => (
                                  <img
                                    key={idx}
                                    src={img.url}
                                    alt="صورة"
                                    className="w-24 h-20 object-cover rounded border cursor-pointer hover:scale-105 transition-transform"
                                    onClick={() => {
                                      setSelectedImage({ url: img.url, unitName: unit.unitName, ownerName: unit.owner?.name });
                                      setShowImageModal(true);
                                    }}
                                  />
                                ))}
                              </div>
                            </td>
                            <td className={`py-2 px-4 font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{unit.unitName}</td>
                            <td className={`py-2 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{unit.owner?.name || '-'}</td>
                            <td className="py-2 px-4">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                                  disabled={imageActionLoading === unit.unitId + 'approveAll'}
                                  onClick={() => handleApproveAll(unit.unitId)}
                                >
                                  {imageActionLoading === unit.unitId + 'approveAll' ? '...' : 'موافقة على كل الصور'}
                                </button>
                                <button
                                  type="button"
                                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                                  disabled={imageActionLoading === unit.unitId + 'rejectAll'}
                                  onClick={() => handleRejectAllClick(unit)}
                                >
                                  {imageActionLoading === unit.unitId + 'rejectAll' ? '...' : 'رفض كل الصور'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
               {/* مودال سبب الرفض */}
               {showRejectModal && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                   <div className={`rounded-xl shadow-xl p-8 max-w-md w-full relative ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                     <button
                       className={`absolute top-3 left-3 text-2xl ${isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}`}
                       onClick={() => setShowRejectModal(false)}
                       aria-label="إغلاق"
                     >
                       ×
                     </button>
                     <h2 className="text-xl font-bold mb-4 text-red-600 text-center">سبب رفض الإعلان</h2>
                     <textarea
                       className={`w-full px-3 py-2 rounded-lg border mb-4 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                       rows={3}
                       placeholder="اكتب سبب الرفض هنا..."
                       value={rejectReason}
                       onChange={e => setRejectReason(e.target.value)}
                     />
                     <div className="flex gap-4 mt-6">
                       <button
                         className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg"
                         onClick={() => setShowRejectModal(false)}
                         type="button"
                       >
                         إلغاء
                       </button>
                       <button
                         className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg"
                         onClick={handleRejectAllConfirm}
                         type="button"
                         disabled={!rejectReason.trim() || imageActionLoading === (pendingRejectUnit?.unitId + 'rejectAll')}
                       >
                         {imageActionLoading === (pendingRejectUnit?.unitId + 'rejectAll') ? '...' : 'تأكيد الرفض'}
                       </button>
                     </div>
                   </div>
                 </div>
               )}
              {/* مودال عرض الصورة */}
              {showImageModal && selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                  <div className={`rounded-xl shadow-xl p-6 max-w-lg w-full relative flex flex-col items-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <button
                      className={`absolute top-3 left-3 text-2xl ${isDarkMode ? 'text-gray-400 hover:text-orange-400' : 'text-gray-500 hover:text-orange-600'}`}
                      onClick={() => setShowImageModal(false)}
                      aria-label="إغلاق"
                    >
                      ×
                    </button>
                    <img
                      src={selectedImage.url}
                      alt="صورة الشقة"
                      className="rounded-lg max-h-[60vh] mb-4 border mx-auto"
                      style={{ maxWidth: '100%' }}
                    />
                    <div className="text-center">
                      <p className={`text-lg font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedImage.unitName}</p>
                      {selectedImage.ownerName && (
                        <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>المالك: {selectedImage.ownerName}</p>
                      )}
                      <a
                        href={selectedImage.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 underline text-xs mt-2 inline-block"
                      >
                        فتح الصورة في نافذة جديدة
                      </a>
                    </div>
                  </div>
                </div>
              )}
              </div>
            ) : activeTab === 'abusive' ? (
              <div>
                <header className="mb-8">
                  <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>المستخدمون ذوو التعليقات المسيئة</h1>
                  <p className={`mt-1 ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>إدارة المستخدمين الذين لديهم تعليقات مسيئة.</p>
                </header>
                
                <div className={`rounded-xl shadow-sm p-6 border ${isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'}`}>
                  {loadingAbusive ? (
                    <div className={`text-center py-12 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>جاري التحميل...</div>
                  ) : abusiveUsers.length === 0 ? (
                    <div className={`text-center py-12 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>لا يوجد مستخدمين لديهم أكثر من 3 تعليقات مسيئة حالياً</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-right">
                        <thead className={`text-xs uppercase ${isDarkMode ? 'text-red-300 bg-red-900/50' : 'text-red-700 bg-red-100'}`}>
                          <tr>
                            <th className="px-4 py-3">الاسم</th>
                            <th className="px-4 py-3">رقم الهاتف</th>
                            <th className="px-4 py-3">الدور</th>
                            <th className="px-4 py-3">عدد التعليقات المسيئة</th>
                            <th className="px-4 py-3">الحالة</th>
                            <th className="px-4 py-3">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {abusiveUsers.map((u) => (
                            <tr key={u._id} className={`border-b ${isDarkMode ? 'border-red-700 bg-gray-900 hover:bg-red-900/20' : 'border-red-200 bg-white hover:bg-red-50'}`}>
                              <td className={`py-2 px-4 font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{u.name}</td>
                              <td className={`py-2 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{u.phone || '-'}</td>
                              <td className={`py-2 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{u.role}</td>
                              <td className={`py-2 px-4 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{u.abusiveCommentsCount}</td>
                              <td className="py-2 px-4">
                                {u.isBlocked ? (
                                  <span className="text-red-400 font-bold">محظور</span>
                                ) : (
                                  <span className="text-green-400 font-bold">نشط</span>
                                )}
                              </td>
                              <td className="py-2 px-4">
                                {!u.isBlocked && (
                                  <button
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                                    disabled={blockLoadingId === u._id}
                                    onClick={() => handleBlockUser(u._id)}
                                  >
                                    {blockLoadingId === u._id ? '...' : 'بلوك'}
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : activeTab === 'support' ? (
              <div className="flex h-full bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                {/* Sidebar for support chats */}
                <div className={`border-r transition-all duration-300 ${isSupportSidebarCollapsed ? 'w-16' : 'w-1/3'} ${isDarkMode ? 'border-orange-700 bg-gray-800/90' : 'border-orange-200 bg-white/90'} backdrop-blur-xl`}>
                  <div className={`border-b ${isDarkMode ? 'border-orange-700 bg-gradient-to-r from-gray-800 to-gray-900' : 'border-orange-200 bg-gradient-to-r from-orange-50 to-white'} ${isSupportSidebarCollapsed ? 'p-2' : 'p-6'}`}>
                    <div className={`flex items-center gap-3 ${isSupportSidebarCollapsed ? 'justify-center' : ''}`}>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-orange-600 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                        </svg>
                      </div>
                      {!isSupportSidebarCollapsed && <h2 className={`text-xl font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>رسائل الدعم</h2>}
                      <button
                        onClick={() => setIsSupportSidebarCollapsed(!isSupportSidebarCollapsed)}
                        className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-stone-100'} ${isSupportSidebarCollapsed ? 'absolute top-2 right-2' : 'ml-auto'}`}
                        title={isSupportSidebarCollapsed ? "توسيع" : "طي"}
                      >
                        {isSupportSidebarCollapsed ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className={`overflow-y-auto h-full ${isSupportSidebarCollapsed ? 'p-1' : 'p-2'}`}>
                    {loadingSupportChats ? (
                      <div className={`text-center ${isSupportSidebarCollapsed ? 'p-2' : 'p-6'}`}>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-3"></div>
                        {!isSupportSidebarCollapsed && <div className="text-gray-600 dark:text-gray-400">جاري التحميل...</div>}
                      </div>
                    ) : supportChats.length === 0 ? (
                      <div className={`text-center ${isSupportSidebarCollapsed ? 'p-2' : 'p-6'}`}>
                        <div className="text-orange-400 dark:text-orange-300 mb-4">
                          <svg className={`${isSupportSidebarCollapsed ? 'w-8 h-8' : 'w-16 h-16'} mx-auto`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                          </svg>
                        </div>
                        {!isSupportSidebarCollapsed && (
                          <>
                            <p className="text-gray-600 dark:text-gray-400 font-semibold">لا توجد رسائل دعم</p>
                            <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">ستظهر هنا عندما يرسل المستخدمون رسائل</p>
                          </>
                        )}
                      </div>
                    ) : (
                      supportChats.map((chat) => (
                        <div
                          key={chat._id}
                          className={`cursor-pointer rounded-xl mb-2 transition-all duration-300 ${
                            selectedSupportChat?._id === chat._id
                              ? 'bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 shadow-lg'
                              : 'hover:bg-orange-50 dark:hover:bg-gray-700 hover:shadow-md'
                          } ${isDarkMode ? 'border border-gray-700' : 'border border-orange-100'} ${isSupportSidebarCollapsed ? 'p-2' : 'p-4'}`}
                          onClick={() => handleSelectSupportChat(chat)}
                          title={isSupportSidebarCollapsed ? `${chat.user?.name || 'مستخدم غير معروف'} - ${chat.unreadCount > 0 ? `${chat.unreadCount} رسائل جديدة` : 'لا توجد رسائل جديدة'}` : ""}
                        >
                          {isSupportSidebarCollapsed ? (
                            <div className="flex flex-col items-center">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-orange-600 flex items-center justify-center mb-1">
                                <span className="text-white font-bold text-xs">
                                  {chat.user?.name?.charAt(0) || '?'}
                                </span>
                              </div>
                              {chat.unreadCount > 0 && (
                                <span className="bg-orange-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
                                  {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                                </span>
                              )}
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center justify-between mb-2">
                                <div className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {chat.user?.name || 'مستخدم غير معروف'}
                                </div>
                                {chat.unreadCount > 0 && (
                                  <span className="bg-orange-500 text-white rounded-full px-2 py-1 text-xs font-bold">
                                    {chat.unreadCount}
                                  </span>
                                )}
                              </div>
                              <div className={`text-sm mb-1 ${isDarkMode ? 'text-orange-300' : 'text-orange-600'}`}>
                                {chat.user?.role === 'landlord' ? 'مالك' : 'مستأجر'}
                              </div>
                              <div className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleString() : ''}
                              </div>
                              <div className={`text-sm truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {chat.lastMessage || 'لا توجد رسائل'}
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Chat area */}
                <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-gray-900">
                  {selectedSupportChat ? (
                    <>
                      {/* Chat header */}
                      <div className={`p-6 border-b shrink-0 ${isDarkMode ? 'border-orange-700 bg-gradient-to-r from-gray-800 to-gray-900' : 'border-orange-200 bg-gradient-to-r from-orange-50 to-white'}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-400 to-orange-600 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {selectedSupportChat.user?.name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div>
                            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {selectedSupportChat.user?.name || 'مستخدم غير معروف'}
                            </h3>
                            <p className={`text-sm ${isDarkMode ? 'text-orange-300' : 'text-orange-600'}`}>
                              {selectedSupportChat.user?.role === 'landlord' ? 'مالك' : 'مستأجر'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-3 scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-orange-100 dark:scrollbar-thumb-orange-600 dark:scrollbar-track-gray-800 min-h-0 max-h-full scroll-smooth">
                        {supportMessages.map((msg, idx) => {
                          const senderId = typeof msg.sender === 'string' ? msg.sender : msg.sender._id;
                          return (
                            <div key={msg._id || idx} className={`flex ${senderId === user?._id ? 'justify-end' : 'justify-start'}`}>
                              <div
                                className={`relative max-w-[75%] px-4 py-3 rounded-2xl shadow-md text-base break-words
                                  ${senderId === user?._id
                                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                                    : 'bg-white dark:bg-gray-600 dark:border-orange-500 text-gray-800 dark:text-white'}
                                `}
                                style={{
                                  borderRadius: senderId === user?._id 
                                    ? '1rem 1rem 0.5rem 1rem' 
                                    : '1rem 1rem 1rem 0.5rem',
                                }}
                              >
                                {msg.text}
                                <div className={`text-xs mt-2 ${senderId === user?._id ? 'text-orange-100' : 'text-gray-500 dark:text-gray-400'}`}>
                                  {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : ''}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Message input */}
                      <form onSubmit={handleSupportMessageSend} className={`p-4 border-t ${isDarkMode ? 'border-orange-700 bg-gray-800' : 'border-orange-200 bg-white'} rounded-b-2xl`}>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={supportText}
                            onChange={(e) => setSupportText(e.target.value)}
                            placeholder="اكتب رسالتك..."
                            className={`flex-1 border border-orange-200 dark:border-orange-700 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 transition text-base bg-orange-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                          />
                          <button
                            type="submit"
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                          >
                            إرسال
                          </button>
                        </div>
                      </form>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-orange-400 dark:text-orange-300 mb-6">
                          <svg className="w-24 h-24 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                          </svg>
                        </div>
                        <p className={`text-xl font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>اختر محادثة لعرض الرسائل</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>اختر محادثة من القائمة على اليسار</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <header className="mb-8">
                  <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>التأكيدات</h1>
                  <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>إدارة التأكيدات والتقارير.</p>
                </header>

       

                <div className={`rounded-xl shadow-sm p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                    <div className="flex gap-3 flex-wrap">
                      <div className="relative">
                        <select 
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg border pl-4 pr-3 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                        >
                          <option value="all">الكل</option>
                          <option value="pending">قيد الانتظار</option>
                          <option value="approved">تم التأكيد</option>
                          <option value="rejected">تم الرفض</option>
                        </select>
                      </div>
                      <div className="relative">
                        <select 
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg border pl-4 pr-3 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                        >
                          <option value="all">الكل</option>
                          <option value="landlord">المالك</option>
                          <option value="tenant">المستأجر</option>
                        </select>
                      </div>
                    </div>
                   
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className={`text-xs uppercase ${isDarkMode ? 'text-gray-300 bg-gray-700' : 'text-gray-500 bg-gray-50'}`}>
                        <tr>
                          <th className="px-6 py-3" scope="col">المستخدم</th>
                          <th className="px-6 py-3" scope="col">الدور</th>
                          <th className="px-6 py-3" scope="col">الحالة</th>
                          <th className="px-6 py-3" scope="col">تاريخ الانضمام</th>
                          <th className="px-6 py-3 text-right" scope="col">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoading ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                            </td>
                          </tr>
                        ) : filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              لا يوجد مستخدمين
                            </td>
                          </tr>
                        ) : (
                          currentUsers.map((user) => (
                            <tr key={user._id} className={`border-b ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                              <td className={`px-6 py-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {user.name}
                              </td>
                              <td className={`px-6 py-4 capitalize ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {user.role}
                              </td>
                              <td className="px-6 py-4">
                                {getStatusBadge(user.verificationStatus?.status || 'not_submitted')}
                              </td>
                              <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {new Date(user.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                          
                                  <button
                                    className="text-orange-600 bg-orange-50 p-3 hover:text-orange-800 font-medium text-sm"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setShowModal(true);
                                    }}
                                  >
                                    عرض الوثائق
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 mt-4">
                        <button
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className={`px-3 py-1 rounded disabled:opacity-50 ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                        >
                          السابق
                        </button>
                        {[...Array(totalPages)].map((_, idx) => (
                          <button
                            key={idx + 1}
                            onClick={() => setCurrentPage(idx + 1)}
                            className={`px-3 py-1 rounded ${currentPage === idx + 1 ? 'bg-orange-500 text-white' : (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700')}`}
                          >
                            {idx + 1}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className={`px-3 py-1 rounded disabled:opacity-50 ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                        >
                          التالي
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className={`rounded-xl shadow-xl p-8 max-w-md w-full relative ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <button
              className={`absolute top-3 right-3 ${isDarkMode ? 'text-gray-400 hover:text-orange-400' : 'text-gray-500 hover:text-orange-600'}`}
              onClick={() => setShowModal(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className={`text-xl font-bold mb-4 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedUser.name}</h2>
            <div className="mb-4">
              <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{selectedUser.email}</p>
              <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{selectedUser.phone}</p>
            </div>
            <div className="mb-4 flex flex-col gap-4 items-center">
              {selectedUser.verificationStatus?.uploadedIdUrl && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">صورة الهوية</p>
                  <img src={selectedUser.verificationStatus.uploadedIdUrl} alt="ID" className="rounded-lg max-h-40 border" />
                </div>
              )}
              {selectedUser.verificationStatus?.selfieUrl && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">صورة التصوير الشخصي</p>
                  <img src={selectedUser.verificationStatus.selfieUrl} alt="Selfie" className="rounded-lg max-h-40 border" />
                </div>
              )}
            </div>
            <div className="flex gap-4 justify-center mt-6">
              <button
                onClick={async () => {
                  await handleVerificationAction(selectedUser._id, 'approve');
                  setShowModal(false);
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold"
              >
                تأكيد
              </button>
              <button
                onClick={async () => {
                  await handleVerificationAction(selectedUser._id, 'reject');
                  setShowModal(false);
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold"
              >
                رفض
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}