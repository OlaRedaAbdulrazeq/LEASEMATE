import React from "react";

interface Manager {
  name: string;
  phone: string;
  email: string;
}

interface RentSidebarCardProps {
  rent: number;
  leaseDuration: string;
  securityDeposit: number;
  availableFrom: string;
  manager: Manager;
}

// Placeholder authentication functions
function isAuthenticated() {
  // TODO: Replace with real authentication check
  return false;
}
function showLoginModal() {
  // TODO: Replace with real modal logic
  alert("Please log in to inquire.");
}
function redirectToInquiry() {
  // TODO: Replace with real redirect logic
  window.location.href = "/inquire";
}

const RentSidebarCard: React.FC<RentSidebarCardProps> = ({
  rent,
  leaseDuration,
  securityDeposit,
  availableFrom,
  manager,
}) => {
  const handleInquireClick = () => {
    if (!isAuthenticated()) {
      showLoginModal();
      return;
    }
    // TODO: Redirect to inquiry page
    redirectToInquiry();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-10 text-right">
      <h3 className="text-[var(--dark-brown)] text-2xl font-bold leading-tight">
        {rent.toLocaleString()} جنيه
        <span className="text-base font-normal">/شهريًا</span>
      </h3>
      <div className="mt-6 border-t border-[#f3ece8] pt-6 space-y-4 text-base">
        <div className="flex justify-between">
          <p className="text-[var(--light-brown)]">مدة الإيجار</p>
          <p className="text-[var(--dark-brown)] font-medium">
            {leaseDuration}
          </p>
        </div>
        <div className="flex justify-between">
          <p className="text-[var(--light-brown)]">التأمين</p>
          <p className="text-[var(--dark-brown)] font-medium">
            {securityDeposit.toLocaleString()} جنيه
          </p>
        </div>
        <div className="flex justify-between">
          <p className="text-[var(--light-brown)]">متاح من</p>
          <p className="text-[var(--dark-brown)] font-medium">
            {availableFrom}
          </p>
        </div>
      </div>
      <button
        className="mt-6 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-5 bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold leading-normal tracking-[0.015em] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        onClick={handleInquireClick}
      >
        <span className="truncate">استفسر الآن</span>
      </button>
      <div className="mt-6 border-t border-[#f3ece8] pt-6">
        <h4 className="text-[var(--dark-brown)] text-xl font-bold">
          التواصل مع المدير
        </h4>
        <p className="text-[var(--dark-brown)] text-base mt-3">
          {manager.name}
        </p>
        <p className="text-[var(--light-brown)] text-base">{manager.phone}</p>
        <p className="text-[var(--light-brown)] text-base">{manager.email}</p>
      </div>
    </div>
  );
};

export default RentSidebarCard;
