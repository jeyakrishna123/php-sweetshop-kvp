import React from 'react';

const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden h-[420px] w-full flex flex-col animate-pulse">
      {/* Image skeleton */}
      <div className="relative h-48 w-full bg-gray-200 flex-shrink-0">
        <div className="absolute top-3 right-3 w-8 h-8 bg-gray-300 rounded-full"></div>
      </div>

      {/* Content skeleton */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category badge skeleton */}
        <div className="mb-2">
          <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
        </div>

        {/* Title skeleton */}
        <div className="mb-2">
          <div className="h-4 bg-gray-200 rounded mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>

        {/* Price skeleton */}
        <div className="mb-3">
          <div className="h-6 bg-gray-200 rounded w-20"></div>
        </div>

        {/* Stock status skeleton */}
        <div className="mb-3">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>

        {/* Quantity selector skeleton */}
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <div className="w-8 h-4 bg-gray-200 rounded"></div>
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
              <div className="w-8 h-6 bg-gray-200"></div>
              <div className="w-12 h-6 bg-gray-200"></div>
              <div className="w-8 h-6 bg-gray-200"></div>
            </div>
          </div>
        </div>

        {/* Button skeleton */}
        <div className="mt-auto">
          <div className="w-full h-10 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
