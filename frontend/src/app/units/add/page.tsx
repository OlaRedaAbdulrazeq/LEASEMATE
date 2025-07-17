"use client";

import { useState } from "react";
import UnitForm from "@/components/UnitForm";
import AmenitiesForm from "@/components/AmenitiesForm";

interface UnitData {
  name: string;
  type: string;
  description: string;
  pricePerMonth: string;
  numRooms: string;
  space: string;
  address: string;
  city: string;
  governorate: string;
  postalCode: string;
  isFurnished: boolean;
  isFurnishedSelected: boolean;
  images: File[];
}

interface AmenitiesData {
  hasPool: boolean;
  hasAC: boolean;
  hasTV: boolean;
  hasWifi: boolean;
  hasKitchenware: boolean;
  hasHeating: boolean;
}

interface ValidationErrors {
  [key: string]: string;
}

export default function AddUnitPage() {
  const [unitData, setUnitData] = useState<UnitData>({
    name: "",
    type: "",
    description: "",
    pricePerMonth: "",
    numRooms: "",
    space: "",
    address: "",
    city: "",
    governorate: "",
    postalCode: "",
    isFurnished: false,
    isFurnishedSelected: false,
    images: [],
  });

  const [amenities, setAmenities] = useState<AmenitiesData>({
    hasPool: false,
    hasAC: false,
    hasTV: false,
    hasWifi: false,
    hasKitchenware: false,
    hasHeating: false,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Required text fields
    if (!unitData.name.trim()) {
      newErrors.name = "اسم الوحدة مطلوب";
    }
    if (!unitData.type) {
      newErrors.type = "نوع الوحدة مطلوب";
    }
    if (!unitData.description.trim()) {
      newErrors.description = "وصف الوحدة مطلوب";
    }
    if (!unitData.address.trim()) {
      newErrors.address = "العنوان مطلوب";
    }
    if (!unitData.city.trim()) {
      newErrors.city = "المدينة مطلوبة";
    }
    if (!unitData.governorate.trim()) {
      newErrors.governorate = "المحافظة مطلوبة";
    }

    // Required number fields
    if (!unitData.pricePerMonth || Number(unitData.pricePerMonth) <= 0) {
      newErrors.pricePerMonth = "السعر الشهري مطلوب ويجب أن يكون أكبر من صفر";
    }
    if (!unitData.numRooms || Number(unitData.numRooms) <= 0) {
      newErrors.numRooms = "عدد الغرف مطلوب ويجب أن يكون أكبر من صفر";
    }
    if (!unitData.space || Number(unitData.space) <= 0) {
      newErrors.space = "المساحة مطلوبة ويجب أن تكون أكبر من صفر";
    }

    // Postal code validation (optional but if provided, must be valid)
    if (unitData.postalCode && Number(unitData.postalCode) <= 0) {
      newErrors.postalCode = "الرقم البريدي غير صحيح";
    }

    // Image validation
    if (unitData.images.length === 0) {
      newErrors.images = "يجب رفع صورة واحدة على الأقل للوحدة";
    }

    // Furnished status validation
    if (!unitData.isFurnishedSelected) {
      newErrors.isFurnished = "يجب اختيار حالة الفرش";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveUnit = async () => {
    if (!validateForm()) {
      // Just return without showing alert - errors are displayed in the form
      return;
    }

    setIsSubmitting(true);

    try {
      const unitInfo = {
        ...unitData,
        ...amenities,
        pricePerMonth: Number(unitData.pricePerMonth),
        numRooms: Number(unitData.numRooms),
        space: Number(unitData.space),
        postalCode: unitData.postalCode
          ? Number(unitData.postalCode)
          : undefined,
      };

      console.log("Unit Data:", unitInfo);
      console.log("Images:", unitData.images);

      //TODO: handle api calls

      // Simulate API call for testing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("تم حفظ بيانات الوحدة بنجاح!");

      // Reset form after successful submission
      setUnitData({
        name: "",
        type: "",
        description: "",
        pricePerMonth: "",
        numRooms: "",
        space: "",
        address: "",
        city: "",
        governorate: "",
        postalCode: "",
        isFurnished: false,
        isFurnishedSelected: false,
        images: [],
      });
      setAmenities({
        hasPool: false,
        hasAC: false,
        hasTV: false,
        hasWifi: false,
        hasKitchenware: false,
        hasHeating: false,
      });
      setErrors({});
    } catch (error) {
      console.error("Error saving unit:", error);
      alert("حدث خطأ أثناء حفظ بيانات الوحدة. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-cairo">
            إضافة وحدة جديدة
          </h1>
          <p className="text-lg text-gray-600 font-cairo">
            أدخل تفاصيل الوحدة المراد إضافتها إلى النظام
          </p>
        </header>

        <div className="space-y-8">
          <UnitForm data={unitData} onChange={setUnitData} errors={errors} />
          <AmenitiesForm
            data={amenities}
            onChange={setAmenities}
            unitType={unitData.type}
          />

          <div className="flex justify-center pt-8">
            <button
              onClick={handleSaveUnit}
              disabled={isSubmitting}
              className={`px-8 py-4 text-white text-lg font-bold rounded-xl shadow-lg transform transition-all duration-200 font-cairo min-w-[200px] ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 hover:shadow-xl hover:scale-105"
              }`}
            >
              {isSubmitting ? "جاري الحفظ..." : "حفظ الوحدة"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
