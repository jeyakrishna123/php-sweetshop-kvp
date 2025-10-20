import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ReviewSystem = ({ productId, onReviewAdded }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [reviews, setReviews] = useState([]);
  const [statistics, setStatistics] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    title: '',
    comment: ''
  });

  useEffect(() => {
    fetchReviews();
  }, [productId, sortBy, currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/reviews/product/${productId}?sort=${sortBy}&page=${currentPage}&limit=5`);

      if (response.data && response.data.success) {
        setReviews(response.data.reviews || []);
        setStatistics(response.data.statistics || {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        });
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        // If no success flag or response data, set defaults
        setReviews([]);
        setStatistics({
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Set defaults on error
      setReviews([]);
      setStatistics({
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      });
      showToast('Failed to load reviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      showToast('Please login to write a review', 'warning');
      return;
    }

    if (reviewForm.rating === 0) {
      showToast('Please select a rating', 'warning');
      return;
    }

    try {
      const response = await axios.post('/api/reviews', {
        productId,
        ...reviewForm
      });

      if (response.data.success) {
        showToast('Review submitted successfully!', 'success');
        setReviewForm({ rating: 0, title: '', comment: '' });
        setShowReviewForm(false);
        fetchReviews();
        if (onReviewAdded) onReviewAdded();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      showToast(error.response?.data?.message || 'Failed to submit review', 'error');
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    try {
      const response = await axios.post(`/api/reviews/helpful/${reviewId}`);
      if (response.data.success) {
        showToast('Review marked as helpful!', 'success');
        fetchReviews();
      }
    } catch (error) {
      console.error('Error marking review helpful:', error);
      showToast('Failed to mark review as helpful', 'error');
    }
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : "div"}
            onClick={interactive ? () => onRatingChange(star) : undefined}
            className={`text-2xl transition-all duration-300 ${
              star <= rating
                ? 'text-yellow-400 drop-shadow-lg'
                : 'text-gray-300'
            } ${interactive ? 'hover:text-yellow-400 cursor-pointer hover:scale-110' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    const { ratingDistribution = {}, totalReviews = 0 } = statistics || {};
    
    return (
      <div className="space-y-3">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = ratingDistribution[rating] || 0;
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center space-x-3">
              <span className="text-sm font-bold text-gray-700 w-6">{rating}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-3 shadow-inner">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-600 w-8">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
        <div className="animate-pulse">
          <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-2/3"></div>
            </div>
            <div className="space-y-3">
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-1/2"></div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex space-x-4 p-6 bg-gray-50 rounded-2xl">
                <div className="h-12 w-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/4"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/2"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
      {/* Premium Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div>
            <h3 className="text-3xl font-black text-gray-900 bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
              Customer Reviews
            </h3>
            <p className="text-gray-600 font-medium">Share your experience with others</p>
          </div>
        </div>
        {user && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="group bg-gradient-to-r from-pink-500 via-purple-600 to-pink-600 hover:from-pink-600 hover:via-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500 transform hover:scale-105 active:scale-95 shadow-2xl hover:shadow-3xl"
          >
            <span className="flex items-center">
              <svg className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              {showReviewForm ? 'Cancel Review' : 'Write a Review'}
            </span>
          </button>
        )}
      </div>

      {/* Premium Review Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Overall Rating */}
        <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-3xl border border-gray-100 shadow-lg">
          <div className="flex items-center space-x-6 mb-6">
            <div className="text-6xl font-black text-gray-900 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              {statistics?.averageRating || 0}
            </div>
            <div>
              <div className="mb-2">
                {renderStars(Math.round(statistics?.averageRating || 0))}
              </div>
              <p className="text-lg font-semibold text-gray-700">
                Based on {statistics?.totalReviews || 0} reviews
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-600">Verified Reviews</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-600">Real Customer Feedback</span>
            </div>
          </div>
        </div>
        
        {/* Rating Distribution */}
        <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-3xl border border-gray-100 shadow-lg">
          <h4 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Rating Distribution
          </h4>
          {renderRatingDistribution()}
        </div>
      </div>

      {/* Premium Review Form */}
      {showReviewForm && (
        <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50 rounded-3xl p-8 mb-12 border border-pink-200 shadow-xl">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h4 className="text-2xl font-bold text-gray-900">Write Your Review</h4>
          </div>
          <form onSubmit={handleReviewSubmit} className="space-y-6">
            <div>
              <label className="block text-lg font-bold text-gray-700 mb-3">
                Rating *
              </label>
              <div className="flex items-center space-x-2">
                {renderStars(reviewForm.rating, true, (rating) => 
                  setReviewForm({ ...reviewForm, rating })
                )}
                <span className="ml-4 text-lg font-semibold text-gray-600">
                  {reviewForm.rating > 0 ? `${reviewForm.rating} out of 5 stars` : 'Select a rating'}
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-lg font-bold text-gray-700 mb-3">
                Review Title
              </label>
              <input
                type="text"
                value={reviewForm.title}
                onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-200 focus:border-pink-400 transition-all duration-300 text-lg font-medium"
                placeholder="Summarize your experience in a few words"
              />
            </div>
            
            <div>
              <label className="block text-lg font-bold text-gray-700 mb-3">
                Your Review
              </label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                rows={5}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-200 focus:border-pink-400 transition-all duration-300 text-lg font-medium resize-none"
                placeholder="Tell others about your experience with this product. What did you like? What could be improved?"
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-pink-500 via-purple-600 to-pink-600 hover:from-pink-600 hover:via-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500 transform hover:scale-105 active:scale-95 shadow-2xl hover:shadow-3xl"
              >
                <span className="flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Submit Review
                </span>
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Premium Sort Options */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <span className="text-lg font-bold text-gray-700">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-6 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-200 focus:border-pink-400 transition-all duration-300 font-medium text-lg bg-white shadow-lg"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest_rating">Highest Rating</option>
            <option value="lowest_rating">Lowest Rating</option>
            <option value="most_helpful">Most Helpful</option>
          </select>
        </div>
        <div className="text-lg font-semibold text-gray-600">
          Showing {reviews?.length || 0} of {statistics?.totalReviews || 0} reviews
        </div>
      </div>

      {/* Premium Reviews List */}
      <div className="space-y-8">
        {(!reviews || reviews.length === 0) ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Reviews Yet</h3>
            <p className="text-gray-600 text-lg mb-8">Be the first to share your experience with this product!</p>
            {user && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-gradient-to-r from-pink-500 via-purple-600 to-pink-600 hover:from-pink-600 hover:via-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500 transform hover:scale-105 shadow-2xl"
              >
                Write the First Review
              </button>
            )}
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <h4 className="text-xl font-bold text-gray-900">{review.user?.name || 'Anonymous'}</h4>
                      {review.verified && (
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 shadow-sm">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-gray-500">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Unknown date'}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                    </div>
                    {review.title && (
                      <span className="text-xl font-bold text-gray-900">{review.title}</span>
                    )}
                  </div>
                  
                  {review.comment && (
                    <p className="text-gray-700 mb-6 text-lg leading-relaxed">{review.comment}</p>
                  )}
                  
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => handleMarkHelpful(review._id)}
                      className="group flex items-center space-x-2 text-pink-600 hover:text-pink-700 font-semibold transition-all duration-300 transform hover:scale-105"
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform duration-300">👍</span>
                      <span>Helpful ({review.helpful || 0})</span>
                    </button>
                    <div className="flex items-center space-x-2 text-gray-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="text-sm font-medium">Share feedback</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Premium Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-3 mt-12">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-6 py-3 border-2 border-gray-200 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-semibold text-lg"
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-6 py-3 border-2 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                page === currentPage
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-pink-500 shadow-lg'
                  : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-6 py-3 border-2 border-gray-200 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-semibold text-lg"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewSystem;