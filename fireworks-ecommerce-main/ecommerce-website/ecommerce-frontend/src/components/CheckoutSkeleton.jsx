import React from 'react';

const CheckoutSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 py-8 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="mb-6 sm:mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-300 rounded-xl sm:rounded-2xl mb-4"></div>
          <div className="h-8 bg-gray-300 rounded-lg w-64 mx-auto mb-2"></div>
          <div className="h-5 bg-gray-200 rounded w-96 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Forms Skeleton */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Customer Information Skeleton */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8">
              <div className="flex items-center mb-6 sm:mb-8">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-lg sm:rounded-xl mr-3 sm:mr-4"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-300 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* 4 Input Fields */}
                {[...Array(4)].map((_, idx) => (
                  <div key={idx} className="group">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                    <div className="h-12 sm:h-14 bg-gray-200 rounded-lg sm:rounded-xl"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address Skeleton */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center mb-8">
                <div className="w-10 h-10 bg-gray-300 rounded-xl mr-4"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-300 rounded w-40 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-56"></div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Address Field */}
                <div>
                  <div className="h-4 bg-gray-200 rounded w-28 mb-3"></div>
                  <div className="h-14 bg-gray-200 rounded-xl"></div>
                </div>

                {/* 3 Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, idx) => (
                    <div key={idx}>
                      <div className="h-4 bg-gray-200 rounded w-16 mb-3"></div>
                      <div className="h-14 bg-gray-200 rounded-xl"></div>
                    </div>
                  ))}
                </div>

                {/* Country Field */}
                <div>
                  <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
                  <div className="h-14 bg-gray-200 rounded-xl"></div>
                </div>
              </div>
            </div>

            {/* Payment Method Skeleton */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded-xl mr-4"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-300 rounded w-36 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                  </div>
                </div>
                <div className="h-10 bg-gray-300 rounded-lg w-32"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Payment Options */}
                {[...Array(2)].map((_, idx) => (
                  <div key={idx} className="p-4 border-2 border-gray-200 rounded-xl bg-white">
                    <div className="flex items-center">
                      <div className="w-5 h-5 bg-gray-300 rounded-full mr-4"></div>
                      <div className="w-8 h-8 bg-gray-300 rounded-lg mr-3"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-300 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-40"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-8 sticky top-8">
              <div className="flex items-center mb-8">
                <div className="w-10 h-10 bg-gray-300 rounded-xl mr-4"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-300 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-40"></div>
                </div>
              </div>

              {/* Cart Items Skeleton */}
              <div className="space-y-4 mb-6">
                {[...Array(3)].map((_, idx) => (
                  <div key={idx} className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-300 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown Skeleton */}
              <div className="border-t pt-4 space-y-3">
                {[...Array(3)].map((_, idx) => (
                  <div key={idx} className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}

                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <div className="h-6 bg-gray-300 rounded w-20"></div>
                    <div className="h-6 bg-gray-300 rounded w-24"></div>
                  </div>
                </div>
              </div>

              {/* Buttons Skeleton */}
              <div className="mt-8">
                <div className="w-full h-14 bg-gradient-to-r from-pink-300 to-rose-300 rounded-xl mb-4"></div>
                <div className="w-full h-14 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSkeleton;
