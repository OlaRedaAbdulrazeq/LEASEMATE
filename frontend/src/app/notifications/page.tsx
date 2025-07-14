"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { CheckCheck, Check } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useAuth } from "@/contexts/AuthContext";

export default function NotificationsPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const { notifications, markAllAsRead, markSingleAsRead } = useNotifications();
  const [filter, setFilter] = useState("ALL");
  const { user, token } = useAuth();

  const filteredNotifications =
    filter === "ALL"
      ? notifications
      : notifications.filter((n) => n.type === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <main className="pt-24 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t("notifications.pageTitle")}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {t("notifications.pageSubtitle")}
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("notifications.filterLabel")}
              </span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 pl-3 pr-8 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
              >
                <option value="ALL">{t("notifications.all")}</option>
                <option value="PAYMENT_DUE">
                  {t("notifications.payments")}
                </option>
                <option value="MAINTENANCE_UPDATE">
                  {t("notifications.maintenance")}
                </option>
                <option value="LEASE_EXPIRY">
                  {t("notifications.contracts")}
                </option>
                <option value="GENERAL">
                  {t("notifications.general")}
                </option>
                <option value="VERIFICATION">
                  {t("notifications.verification")}
                </option>
              </select>
            </div>

            <button
              onClick={markAllAsRead}
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition"
            >
              {t("notifications.markAllRead")}
            </button>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <p className="text-gray-700 dark:text-gray-300">
                {t("notifications.noNotifications")}
              </p>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`relative rounded-xl p-4 pb-10 shadow border transition-all bg-white dark:bg-gray-800 cursor-pointer ${
                    notification.isRead
                      ? "opacity-80 border-gray-200 dark:border-gray-700"
                      : "border-orange-300"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div
                      onClick={() => {
                        if (notification.link) router.push(notification.link);
                      }}
                      className="flex-1"
                    >
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {notification.message}
                      </p>
                      {notification.senderId?.name && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {t("notifications.from")}{" "}
                          {notification.senderId.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Date aligned left or right */}
                  <span
                    className={`absolute top-3 ${
                      language === "ar" ? "left-4" : "right-4"
                    } text-xs text-gray-500 dark:text-gray-400`}
                  >
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>

                  {/* Check icon aligned left or right at bottom */}
                  <div
                    className={`absolute bottom-3 ${
                      language === "ar" ? "left-4" : "right-4"
                    }`}
                  >
                    {!notification.isRead ? (
                      <button
                        onClick={() => markSingleAsRead(notification._id)}
                        className="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400"
                        title={t("notifications.markAsRead")}
                      >
                        <CheckCheck size={20} />
                      </button>
                    ) : (
                      <span
                        className="text-green-500 dark:text-green-400"
                        title={t("notifications.read")}
                      >
                        <Check size={20} />
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
