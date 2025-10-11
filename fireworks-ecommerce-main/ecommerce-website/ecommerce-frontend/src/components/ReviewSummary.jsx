import React from 'react';

const ReviewSummary = ({ summary, onFilterChange, selectedRating }) => {
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <svg
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const getRatingText = (rating) => {
    switch (rating) {
      case 5: return 'Excellent';
      case 4: return 'Very Good';
      case 3: return 'Good';
      case 2: return 'Fair';
      case 1: return 'Poor';
      default: return '';
    }
  };

  const getRatingPercentage = (count) => {
    if (summary.totalReviews === 0) return 0;
    return Math.round((count / summary.totalReviews) * 100);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Reviews</h3>
      
      {/* Overall Rating */}
      <div className="flex items-center mb-6">
        <div className="text-center mr-6">
          <div className="text-4xl font-bold text-gray-900 mb-1">
            {summary.averageRating.toFixed(1)}
          </div>
          <div className="flex justify-center mb-2">
            {renderStars(Math.round(summary.averageRating))}
          </div>
          <div className="text-sm text-gray-600">
            {summary.totalReviews} {summary.totalReviews === 1 ? 'review' : 'reviews'}
          </div>
        </div>
        
        <div className="flex-1">
          {/* Rating Distribution */}
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = summary.ratingDistribution[rating] || 0;
            const percentage = getRatingPercentage(count);
            
            return (
              <div key={rating} className="flex items-center mb-2">
                <button
                  onClick={() => onFilterChange(rating === selectedRating ? null : rating)}
                  className={`flex items-center space-x-2 text-sm hover:text-purple-600 transition-colors ${
                    selectedRating === rating ? 'text-purple-600 font-semibold' : 'text-gray-600'
                  }`}
                >
                  <span className="w-8 text-right">{rating}</span>
                  <div className="flex space-x-1">
                    {renderStars(rating)}
                  </div>
                  <span className="w-16 text-left">{getRatingText(rating)}</span>
                </button>
                
                <div className="flex-1 mx-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                
                <span className="text-sm text-gray-500 w-12 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Status */}
      {selectedRating && (
        <div className="flex items-center justify-between bg-purple-50 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-purple-700">
              Showing {summary.ratingDistribution[selectedRating] || 0} reviews with {selectedRating} stars
            </span>
          </div>
          <button
            onClick={() => onFilterChange(null)}
            className="text-sm text-purple-600 hover:text-purple-800"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Review Count */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Based on {summary.totalReviews} verified customer reviews
        </p>
      </div>
    </div>
  );
};

export default ReviewSummary;
