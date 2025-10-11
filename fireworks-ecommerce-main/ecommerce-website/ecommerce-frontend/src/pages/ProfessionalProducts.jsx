import React from 'react';
import ProfessionalProductCard from '../components/ProfessionalProductCard';

const ProfessionalProducts = () => {
  // Sample product data for demonstration
  const sampleProducts = [
    {
      _id: '1',
      name: 'Golden Sparkle Fountain Premium Fireworks Display',
      price: 299,
      image: '/images/fireworks1.jpg',
      countInStock: 50,
      discountPercentage: 15
    },
    {
      _id: '2',
      name: 'Multi-Color Aerial Shell Professional Grade',
      price: 899,
      image: '/images/fireworks2.jpg',
      countInStock: 30,
      discountPercentage: 20
    },
    {
      _id: '3',
      name: 'Electric Sparklers Pack Deluxe Edition',
      price: 199,
      image: '/images/fireworks3.jpg',
      countInStock: 100,
      discountPercentage: 12
    },
    {
      _id: '4',
      name: 'Thunder Crackers Bundle Professional',
      price: 399,
      image: '/images/fireworks4.jpg',
      countInStock: 75,
      discountPercentage: 18
    },
    {
      _id: '5',
      name: 'Rainbow Roman Candle Spectacular',
      price: 149,
      image: '/images/fireworks5.jpg',
      countInStock: 60,
      discountPercentage: 25
    },
    {
      _id: '6',
      name: 'Sky Rocket Deluxe Professional Grade',
      price: 599,
      image: '/images/fireworks6.jpg',
      countInStock: 40,
      discountPercentage: 22
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Professional Product Cards Demo
          </h1>
          <p className="text-gray-600 mt-1">
            Responsive grid layout: 2 cards per row on mobile, 3 on desktop
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="professional-products-grid">
        {sampleProducts.map((product) => (
          <ProfessionalProductCard key={product._id} product={product} />
        ))}
      </div>

      {/* Features Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Component Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Responsive Grid</h3>
                <p className="text-sm text-gray-600">2 cards mobile, 3 cards desktop</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">4:3 Aspect Ratio</h3>
                <p className="text-sm text-gray-600">Images never crop, always crisp</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Animated Badges</h3>
                <p className="text-sm text-gray-600">Blinking discount badges</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Side-by-Side Layout</h3>
                <p className="text-sm text-gray-600">Qty stepper + Add to Cart</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Unique Classes</h3>
                <p className="text-sm text-gray-600">ux- prefixed class names</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Professional Design</h3>
                <p className="text-sm text-gray-600">Clean, modern, balanced</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalProducts;
