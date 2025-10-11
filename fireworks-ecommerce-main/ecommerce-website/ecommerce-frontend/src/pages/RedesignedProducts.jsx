import React from 'react';
import RedesignedProductCard from '../components/RedesignedProductCard';

const RedesignedProducts = () => {
  // Sample product data for demonstration
  const sampleProducts = [
    {
      _id: '1',
      name: 'Golden Sparkle Fountain Premium Fireworks Display',
      price: 299,
      image: '/images/fireworks1.jpg',
      countInStock: 50,
      discountPercentage: 15,
      isNew: true
    },
    {
      _id: '2',
      name: 'Multi-Color Aerial Shell Professional Grade',
      price: 899,
      image: '/images/fireworks2.jpg',
      countInStock: 30,
      discountPercentage: 20,
      isNew: true
    },
    {
      _id: '3',
      name: 'Electric Sparklers Pack Deluxe Edition',
      price: 199,
      image: '/images/fireworks3.jpg',
      countInStock: 100,
      discountPercentage: 12,
      isNew: true
    },
    {
      _id: '4',
      name: 'Thunder Crackers Bundle Professional',
      price: 399,
      image: '/images/fireworks4.jpg',
      countInStock: 75,
      discountPercentage: 18,
      isNew: true
    },
    {
      _id: '5',
      name: 'Rainbow Roman Candle Spectacular',
      price: 149,
      image: '/images/fireworks5.jpg',
      countInStock: 60,
      discountPercentage: 25,
      isNew: true
    },
    {
      _id: '6',
      name: 'Sky Rocket Deluxe Professional Grade',
      price: 599,
      image: '/images/fireworks6.jpg',
      countInStock: 40,
      discountPercentage: 22,
      isNew: true
    },
    {
      _id: '7',
      name: 'Strobe Light Aerial Fireworks',
      price: 699,
      image: '/images/fireworks7.jpg',
      countInStock: 35,
      discountPercentage: 30,
      isNew: true
    },
    {
      _id: '8',
      name: 'Ground Bloom Flower Fireworks',
      price: 249,
      image: '/images/fireworks8.jpg',
      countInStock: 80,
      discountPercentage: 28,
      isNew: true
    },
    {
      _id: '9',
      name: 'Silver Rain Fountain Display',
      price: 349,
      image: '/images/fireworks9.jpg',
      countInStock: 45,
      discountPercentage: 24,
      isNew: true
    },
    {
      _id: '10',
      name: 'Spinning Wheel of Fire',
      price: 799,
      image: '/images/fireworks10.jpg',
      countInStock: 25,
      discountPercentage: 33,
      isNew: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Redesigned Product Section
            </h1>
            <p className="text-gray-600 text-lg">
              Fully responsive design with professional layout for all screen sizes
            </p>
          </div>
        </div>
      </div>

      {/* Responsive Grid Demo */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Responsive Grid Layout
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="font-semibold text-green-600 mb-1">Mobile (2 columns)</div>
                <div>Optimized for small screens with compact design</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="font-semibold text-blue-600 mb-1">Tablet (3-4 columns)</div>
                <div>Balanced layout for medium screens</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="font-semibold text-purple-600 mb-1">Desktop (4-5 columns)</div>
                <div>Full layout for large screens</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {sampleProducts.map((product) => (
          <RedesignedProductCard key={product._id} product={product} />
        ))}
      </div>

      {/* Features Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Design Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Consistent Sizing</h3>
                <p className="text-sm text-gray-600">All cards have equal height and width for professional appearance</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Perfect Images</h3>
                <p className="text-sm text-gray-600">Images never crop, always crisp with proper aspect ratios</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Responsive Design</h3>
                <p className="text-sm text-gray-600">Works perfectly on all devices from mobile to desktop</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Professional Layout</h3>
                <p className="text-sm text-gray-600">Clean, modern design with proper spacing and alignment</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Interactive Elements</h3>
                <p className="text-sm text-gray-600">Smooth hover effects and proper button interactions</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">No UI Collapse</h3>
                <p className="text-sm text-gray-600">All elements remain visible and properly aligned</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedesignedProducts;
