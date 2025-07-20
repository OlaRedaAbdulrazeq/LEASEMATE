import { ActionButton } from './ActionButton';

interface EditModalProps {
  editForm: {
    fullNameArabic: string;
    nationalId: string;
    phoneNumber: string;
    address: string;
  };
  editErrors: { [key: string]: string };
  onEditChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

export const EditModal = ({
  editForm,
  editErrors,
  onEditChange,
  onSave,
  onCancel,
  isSaving
}: EditModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 text-center">تعديل بيانات الطلب</h3>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4">
          <EditInputField
            name="fullNameArabic"
            label="الاسم كامل"
            value={editForm.fullNameArabic}
            onChange={onEditChange}
            error={editErrors.fullNameArabic}
            placeholder="أدخل الاسم الثلاثي"
          />
          
          <EditInputField
            name="nationalId"
            label="رقم البطاقة"
            value={editForm.nationalId}
            onChange={onEditChange}
            error={editErrors.nationalId}
            placeholder="أدخل رقم البطاقة (14 رقم)"
            maxLength={14}
          />
          
          <EditInputField
            name="phoneNumber"
            label="رقم الهاتف"
            value={editForm.phoneNumber}
            onChange={onEditChange}
            error={editErrors.phoneNumber}
            placeholder="01xxxxxxxxx"
            maxLength={11}
          />
          
          <EditInputField
            name="address"
            label="عنوان الإقامة"
            value={editForm.address}
            onChange={onEditChange}
            error={editErrors.address}
            placeholder="أدخل العنوان كاملاً"
          />
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
          <ActionButton
            onClick={onCancel}
            variant="secondary"
            size="md"
            className="flex-1"
          >
            إلغاء
          </ActionButton>
          <ActionButton
            onClick={onSave}
            variant="primary"
            size="md"
            icon="save"
            loading={isSaving}
            disabled={isSaving}
            className="flex-1"
          >
            حفظ التعديلات
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

interface EditInputFieldProps {
  name: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  maxLength?: number;
}

const EditInputField = ({
  name,
  label,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  maxLength,
}: EditInputFieldProps) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2 text-right">
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
      className={`
        w-full px-4 py-3 border rounded-lg bg-white text-right focus:outline-none 
        focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors
        ${error ? "border-red-500" : "border-gray-300"}
      `}
      dir="rtl"
    />
    {error && (
      <p className="text-red-500 text-sm mt-1 text-right">{error}</p>
    )}
  </div>
); 