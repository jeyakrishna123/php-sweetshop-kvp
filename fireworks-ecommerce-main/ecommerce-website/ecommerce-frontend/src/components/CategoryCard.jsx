import React from 'react';
import { useNavigate } from 'react-router-dom';

const CategoryCard = ({ category }) => {
  const navigate = useNavigate();

  const handleCategoryClick = () => {
    navigate(`/products?category=${category._id}`);
  };

  return (
    <div 
      className="card cursor-pointer group overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      onClick={handleCategoryClick}
    >
      {/* Category Image */}
      <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
        <img 
          src={category.image} 
          alt={category.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&h=400&fit=crop";
          }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
        
        {/* Category Name */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h3 className="text-white text-xl font-bold text-center px-4 group-hover:scale-110 transition-transform duration-300">
            {category.name}
          </h3>
        </div>
      </div>
      
      {/* Category Info */}
      <div className="p-4">
        <p className="text-gray-600 text-sm text-center line-clamp-2">
          {category.description}
        </p>
        
        <button className="w-full mt-3 px-4 py-2 border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white active:bg-red-700 active:text-white rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 active:scale-95">
          View Products
        </button>
      </div>
    </div>
  );
};

export default CategoryCard;
