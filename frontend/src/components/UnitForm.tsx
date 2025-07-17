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

interface UnitFormProps {
  data: UnitData;
  onChange: (data: UnitData) => void;
  errors: { [key: string]: string };
}

export default function UnitForm({ data, onChange, errors }: UnitFormProps) {
  const handleInputChange = (
    field: string,
    value: string | boolean | File[]
  ) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleInputChange("images", [...data.images, ...files]);
  };

  const removeImage = (index: number) => {
    const newImages = data.images.filter((_, i) => i !== index);
    handleInputChange("images", newImages);
  };

  const ErrorMessage = ({ error }: { error?: string }) => {
    if (!error) return null;
    return (
      <p className="text-red-500 text-sm mt-1 font-cairo flex items-center">
        <span className="ml-1">⚠️</span>
        {error}
      </p>
    );
  };

  return (
    <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <h3 className="text-xl font-bold mb-8 text-gray-900 font-cairo border-b border-gray-200 pb-4">
        تفاصيل الوحدة
      </h3>

      {/* Image Upload Section */}
      <div className="mb-8">
        <label className="block text-sm font-bold text-gray-700 font-cairo mb-3">
          صور الوحدة <span className="text-red-500">*</span>
        </label>
        <div
          className={`border-2 border-dashed rounded-xl p-6 hover:border-orange-400 transition-colors ${
            errors.images ? "border-red-500 bg-red-50" : "border-gray-300"
          }`}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center space-y-2"
          >
            <div className="text-4xl text-gray-400">📸</div>
            <div className="text-center">
              <p className="text-gray-600 font-cairo font-medium">
                اضغط لرفع الصور
              </p>
              <p className="text-gray-400 text-sm font-cairo">
                PNG, JPG أو JPEG
              </p>
            </div>
          </label>
        </div>
        <ErrorMessage error={errors.images} />

        {/* Preview uploaded images */}
        {data.images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.images.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
                  {file.name.length > 15
                    ? file.name.substring(0, 15) + "..."
                    : file.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-3">
          <label
            className="block text-sm font-bold text-gray-700 font-cairo"
            htmlFor="unit-name"
          >
            اسم الوحدة <span className="text-red-500">*</span>
          </label>
          <input
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 font-cairo text-right bg-gray-50 focus:bg-white ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            id="unit-name"
            placeholder="مثال: شقة رقم 1، الدور الثاني"
            type="text"
            value={data.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />
          <ErrorMessage error={errors.name} />
        </div>

        <div className="space-y-3">
          <label
            className="block text-sm font-bold text-gray-700 font-cairo"
            htmlFor="unit-type"
          >
            نوع الوحدة <span className="text-red-500">*</span>
          </label>
          <select
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 font-cairo text-right bg-gray-50 focus:bg-white ${
              errors.type ? "border-red-500" : "border-gray-300"
            }`}
            id="unit-type"
            value={data.type}
            onChange={(e) => handleInputChange("type", e.target.value)}
          >
            <option value="">اختر نوع الوحدة</option>
            <option value="apartment">شقة</option>
            <option value="villa">فيلا</option>
          </select>
          <ErrorMessage error={errors.type} />
        </div>
      </div>

      {/* Description */}
      <div className="mb-8">
        <label
          className="block text-sm font-semibold text-gray-700 font-cairo mb-3"
          htmlFor="description"
        >
          وصف الوحدة <span className="text-red-500">*</span>
        </label>
        <textarea
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 font-cairo text-right bg-gray-50 focus:bg-white min-h-[120px] ${
            errors.description ? "border-red-500" : "border-gray-300"
          }`}
          id="description"
          placeholder="اكتب وصفاً مفصلاً للوحدة..."
          rows={4}
          value={data.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
        />
        <ErrorMessage error={errors.description} />
      </div>

      {/* Property Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="space-y-3">
          <label
            className="block text-sm font-bold text-gray-700 font-cairo"
            htmlFor="price"
          >
            السعر الشهري (جنيه) <span className="text-red-500">*</span>
          </label>
          <input
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 font-cairo text-right bg-gray-50 focus:bg-white ${
              errors.pricePerMonth ? "border-red-500" : "border-gray-300"
            }`}
            id="price"
            placeholder="15000"
            type="number"
            min="1"
            value={data.pricePerMonth}
            onChange={(e) => handleInputChange("pricePerMonth", e.target.value)}
          />
          <ErrorMessage error={errors.pricePerMonth} />
        </div>

        <div className="space-y-3">
          <label
            className="block text-sm font-bold text-gray-700 font-cairo"
            htmlFor="rooms"
          >
            عدد الغرف <span className="text-red-500">*</span>
          </label>
          <input
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 font-cairo text-right bg-gray-50 focus:bg-white ${
              errors.numRooms ? "border-red-500" : "border-gray-300"
            }`}
            id="rooms"
            placeholder="3"
            type="number"
            min="1"
            value={data.numRooms}
            onChange={(e) => handleInputChange("numRooms", e.target.value)}
          />
          <ErrorMessage error={errors.numRooms} />
        </div>

        <div className="space-y-3">
          <label
            className="block text-sm font-bold text-gray-700 font-cairo"
            htmlFor="space"
          >
            المساحة (متر مربع) <span className="text-red-500">*</span>
          </label>
          <input
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 font-cairo text-right bg-gray-50 focus:bg-white ${
              errors.space ? "border-red-500" : "border-gray-300"
            }`}
            id="space"
            placeholder="120"
            type="number"
            min="1"
            value={data.space}
            onChange={(e) => handleInputChange("space", e.target.value)}
          />
          <ErrorMessage error={errors.space} />
        </div>
      </div>

      {/* Location Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-3">
          <label
            className="block text-sm font-bold text-gray-700 font-cairo"
            htmlFor="address"
          >
            العنوان التفصيلي <span className="text-red-500">*</span>
          </label>
          <input
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 font-cairo text-right bg-gray-50 focus:bg-white ${
              errors.address ? "border-red-500" : "border-gray-300"
            }`}
            id="address"
            placeholder="شارع التحرير، بجوار مول..."
            type="text"
            value={data.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
          />
          <ErrorMessage error={errors.address} />
        </div>

        <div className="space-y-3">
          <label
            className="block text-sm font-bold text-gray-700 font-cairo"
            htmlFor="city"
          >
            المدينة <span className="text-red-500">*</span>
          </label>
          <input
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 font-cairo text-right bg-gray-50 focus:bg-white ${
              errors.city ? "border-red-500" : "border-gray-300"
            }`}
            id="city"
            placeholder="القاهرة"
            type="text"
            value={data.city}
            onChange={(e) => handleInputChange("city", e.target.value)}
          />
          <ErrorMessage error={errors.city} />
        </div>

        <div className="space-y-3">
          <label
            className="block text-sm font-bold text-gray-700 font-cairo"
            htmlFor="governorate"
          >
            المحافظة <span className="text-red-500">*</span>
          </label>
          <input
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 font-cairo text-right bg-gray-50 focus:bg-white ${
              errors.governorate ? "border-red-500" : "border-gray-300"
            }`}
            id="governorate"
            placeholder="القاهرة"
            type="text"
            value={data.governorate}
            onChange={(e) => handleInputChange("governorate", e.target.value)}
          />
          <ErrorMessage error={errors.governorate} />
        </div>

        <div className="space-y-3">
          <label
            className="block text-sm font-bold text-gray-700 font-cairo"
            htmlFor="postal"
          >
            الرقم البريدي
          </label>
          <input
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 font-cairo text-right bg-gray-50 focus:bg-white ${
              errors.postalCode ? "border-red-500" : "border-gray-300"
            }`}
            id="postal"
            placeholder="11511"
            type="number"
            min="1"
            value={data.postalCode}
            onChange={(e) => handleInputChange("postalCode", e.target.value)}
          />
          <ErrorMessage error={errors.postalCode} />
        </div>
      </div>

      {/* Furnished Status */}
      <div className="mb-8">
        <label className="block text-sm font-bold text-gray-700 font-cairo mb-3">
          حالة الفرش <span className="text-red-500">*</span>
        </label>
        <div
          className={`bg-gray-50 rounded-xl p-6 ${
            errors.isFurnished ? "border-2 border-red-500 bg-red-50" : ""
          }`}
        >
          <div className="flex gap-6">
            <label className="flex items-center space-x-3 space-x-reverse cursor-pointer">
              <input
                type="radio"
                name="furnished"
                checked={data.isFurnished}
                onChange={() => {
                  handleInputChange("isFurnished", true);
                  handleInputChange("isFurnishedSelected", true);
                }}
                className="w-5 h-5 text-orange-500 border-gray-300 focus:ring-orange-500"
              />
              <span className="text-gray-900 font-bold text-sm font-cairo">
                مفروشة
              </span>
            </label>
            <label className="flex items-center space-x-3 space-x-reverse cursor-pointer">
              <input
                type="radio"
                name="furnished"
                checked={!data.isFurnished && data.isFurnishedSelected}
                onChange={() => {
                  handleInputChange("isFurnished", false);
                  handleInputChange("isFurnishedSelected", true);
                }}
                className="w-5 h-5 text-orange-500 border-gray-300 focus:ring-orange-500"
              />
              <span className="text-gray-900 font-bold text-sm font-cairo">
                غير مفروشة
              </span>
            </label>
          </div>
        </div>
        <ErrorMessage error={errors.isFurnished} />
      </div>
    </section>
  );
}
