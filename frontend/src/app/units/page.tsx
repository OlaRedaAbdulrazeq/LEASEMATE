"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FilterSidebar, { FilterValues } from "../../components/FilterSidebar";
import SearchBar from "../../components/SearchBar";
import UnitCard from "../../components/UnitCard";
import PaginationControls from "../../components/PaginationControls";
import Navbar from "../../components/Navbar";
import { apiService, Unit } from "../../services/api";

export default function UnitsPage() {
  const router = useRouter();
  const params = useSearchParams();

  // State for units data
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUnits, setTotalUnits] = useState(0);

  // Controlled state for search and filters
  const [search, setSearch] = useState(params.get("search") || "");
  const [filters, setFilters] = useState({
    price: params.get("price") || "",
    type: params.get("type") || "",
    furnishing: params.get("furnishing") || "",
    amenities: params.getAll("amenities"),
    verified: params.get("verified") === "true",
  });

  const currentPage = Number(params.get("page")) || 1;

  // Fetch units on component mount and when dependencies change
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Prepare API parameters
        const apiParams: {
          page?: number;
          limit?: number;
          search?: string;
          minPrice?: number;
          maxPrice?: number;
          type?: string;
        } = {
          page: currentPage,
          limit: 9, // Show 9 units per page to match the 3x3 grid
        };

        if (search) apiParams.search = search;
        
        // Map filters to API parameters
        if (filters.price) {
          // Use the price as a maximum price filter
          apiParams.maxPrice = Number(filters.price);
        }
        
        if (filters.type) apiParams.type = filters.type;

        const response = await apiService.getUnits(undefined, apiParams);
        
        console.log('API Response:', response); // Debug log
        
        // Extract units and pagination from response
        const unitsArray = response.data.units || [];
        const pagination = response.data.pagination;
        
        setUnits(unitsArray);
        setTotalPages(pagination?.totalPages || 1);
        setTotalUnits(pagination?.totalUnits || unitsArray.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch units');
        console.error('Error fetching units:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, search, filters.price, filters.type]);

  // Update query params helper
  const updateQuery = (
    newParams: Record<string, string | number | boolean | string[] | undefined>
  ) => {
    const url = new URL(window.location.href);
    Object.entries(newParams).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        url.searchParams.delete(key);
      } else if (Array.isArray(value)) {
        url.searchParams.delete(key);
        value.forEach((v) => url.searchParams.append(key, v));
      } else {
        url.searchParams.set(key, String(value));
      }
    });
    router.push(url.pathname + url.search);
  };

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = e.target.value;
    setSearch(newSearch);
    updateQuery({ search: newSearch, page: 1 });
  };

  const handleFilterSubmit = (newFilters: FilterValues) => {
    setFilters(newFilters);
    updateQuery({ ...newFilters, page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateQuery({ page });
  };

  return (
    <div dir="rtl" className="bg-[var(--eggshell)] min-h-screen flex flex-col">
      <Navbar />
      <div className="mt-28">
        <main className="grid grid-cols-12 flex-1">
          <aside className="col-span-12 md:col-span-3 border-r border-[var(--light-gray)] p-6">
            <FilterSidebar values={filters} onSubmit={handleFilterSubmit} />
          </aside>
          <section className="col-span-12 md:col-span-9 p-4 md:p-8">
            <div className="mb-6">
              <SearchBar value={search} onChange={handleSearchChange} />
            </div>
            <h2 className="text-[var(--dark-brown)] text-3xl font-bold leading-tight tracking-tight mb-6 text-right">
              {loading ? 'جاري التحميل...' : `عرض ${totalUnits} وحدات`}
            </h2>
            
            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(9)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse"
                  >
                    <div className="h-48 bg-gray-300"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  إعادة المحاولة
                </button>
              </div>
            )}

            {/* Units Grid */}
            {!loading && !error && (
              <>
                {units.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    لا توجد وحدات متاحة حالياً
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {units.map((unit) => (
                      <UnitCard
                        key={unit._id}
                        id={unit._id}
                        title={unit.name || 'اسم غير متوفر'}
                        price={unit.pricePerMonth || 0}
                        size={unit.space || 0}
                        imageUrl={unit.images && unit.images.length > 0 ? unit.images[0] : '/placeholder-image.jpg'}
                        available={unit.status === 'available'}
                        isVerified={true} // You might want to add a verification field to the Unit interface
                      />
                    ))}
                  </div>
                )}
                
                {/* Pagination - only show if there are units and multiple pages */}
                {units.length > 0 && totalPages > 1 && (
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
