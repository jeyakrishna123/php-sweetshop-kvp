import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../axios';

const AboutUs = () => {
  const headerTextRef = useRef(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (headerTextRef.current) {
      const textElements = headerTextRef.current.querySelectorAll('h1, div');
      textElements.forEach(el => {
        el.classList.add('opacity-100', 'translate-y-0');
      });
    }
  }, []);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get('/api/team');
      if (response.data.success) {
        setTeamMembers(response.data.teamMembers.filter(member => member.isActive));
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const values = [
    {
      icon: "🍰",
      title: "Premium Quality",
      description: "We use only the finest ingredients and traditional baking methods to create exceptional cakes that meet the highest standards."
    },
    {
      icon: "🛡️",
      title: "Fresh Daily",
      description: "Your satisfaction is our priority. All our products are baked fresh daily and comply with food safety regulations."
    },
    {
      icon: "🌟",
      title: "Customer Trust",
      description: "Building lasting relationships through transparent pricing, reliable delivery, and exceptional customer service."
    },
    {
      icon: "🎉",
      title: "Celebration Experts",
      description: "We help you create unforgettable moments with our wide range of custom cakes for every special occasion."
    }
  ];

  const stats = [
    { number: "10+", label: "Years Experience", icon: "⏰" },
    { number: "50K+", label: "Happy Customers", icon: "😊" },
    { number: "100%", label: "Fresh Daily", icon: "✅" },
    { number: "24/7", label: "Customer Support", icon: "🆘" }
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white py-24 lg:py-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div ref={headerTextRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 opacity-0 transform -translate-y-4 transition-all duration-1000 ease-out">
            About <span className="text-yellow-300">SK Bakers</span>
          </h1>
          <p className="text-xl md:text-2xl text-red-100 mb-10 opacity-0 transform -translate-y-4 transition-all duration-1000 ease-out delay-200 max-w-4xl mx-auto leading-relaxed">
            Your trusted partner in creating magical moments with premium quality cakes and exceptional service. 
            We sweeten celebrations with taste, quality, and joy.
          </p>
          <div className="text-sm mb-8 opacity-0 transform -translate-y-4 transition-all duration-1000 ease-out delay-400">
            <Link to="/" className="hover:text-yellow-300 transition-colors duration-200 text-red-200">Home</Link> 
            <span className="text-red-300 mx-3">//</span> 
            <span className="text-yellow-300 font-semibold">About Us</span>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-yellow-50 opacity-50"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-red-100">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
                  <div className="text-4xl md:text-5xl font-bold text-red-600 mb-2">{stat.number}</div>
                  <div className="text-gray-700 font-medium text-sm">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vision & Mission Section */}
      <div className="py-20 bg-gradient-to-br from-red-600 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Vision & Mission</h2>
            <p className="text-xl text-red-100 max-w-3xl mx-auto">
              Delivering premium-quality cakes crafted with expertise and passion, bringing new and creative baking techniques to our customers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Vision */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 lg:p-10 hover:bg-white/20 transition-all duration-300 border border-white/20">
              <div className="text-6xl mb-6">🎯</div>
              <h3 className="text-3xl font-bold mb-6 text-yellow-300">Our Vision</h3>
              <p className="text-lg leading-relaxed text-red-50">
                At SK Bakers, our goal is to deliver premium-quality cakes crafted with expertise and passion. 
                We are committed to bringing new and creative baking techniques to our customers, ensuring every bite is a delightful experience.
              </p>
            </div>

            {/* Mission */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 lg:p-10 hover:bg-white/20 transition-all duration-300 border border-white/20">
              <div className="text-6xl mb-6">🚀</div>
              <h3 className="text-3xl font-bold mb-6 text-yellow-300">Our Mission</h3>
              <p className="text-lg leading-relaxed text-red-50">
                We bake with heart, using only the finest ingredients to craft irresistible treats that spread happiness and love in every bite.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do and every decision we make.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="group">
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 border border-red-200 hover:border-red-300">
                  <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">{value.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Our Story</h2>
              <div className="space-y-6">
                <p className="text-lg text-gray-700 leading-relaxed">
                  <span className="text-red-600 font-semibold">Our Journey</span><br/>
                  During the COVID-19 period, my wife and I spent our free time experimenting with cake making. We shared our cakes with our neighbors, who loved the taste and encouraged us to do more. This inspired us to start baking birthday cakes and other specialty cakes for our family members. Their positive feedback motivated us to take our passion to the next level.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  <span className="text-red-600 font-semibold">Our Growth</span><br/>
                  We focused on maintaining high-quality standards in every cake we made. To enhance our skills, we traveled abroad to learn advanced cake-making techniques. We were proud to introduce these innovative concepts to Kovilpatti, making us pioneers in the region.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Today, we continue to innovate and expand our offerings while maintaining the same dedication to 
                  freshness, quality, and customer service that has been our foundation since day one.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-3xl p-8 lg:p-10 text-white shadow-2xl">
              <h3 className="text-3xl font-bold mb-8 text-yellow-300">Why Choose SK Bakers?</h3>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <span className="text-2xl mr-4 text-yellow-300">✅</span>
                  <span className="text-lg">100% fresh daily baked products</span>
                </li>
                <li className="flex items-center">
                  <span className="text-2xl mr-4 text-yellow-300">✅</span>
                  <span className="text-lg">Expert baking techniques</span>
                </li>
                <li className="flex items-center">
                  <span className="text-2xl mr-4 text-yellow-300">✅</span>
                  <span className="text-lg">Wide range of flavors</span>
                </li>
                <li className="flex items-center">
                  <span className="text-2xl mr-4 text-yellow-300">✅</span>
                  <span className="text-lg">Reliable delivery service</span>
                </li>
                <li className="flex items-center">
                  <span className="text-2xl mr-4 text-yellow-300">✅</span>
                  <span className="text-lg">24/7 customer support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The passionate professionals behind SK Bakers' success and commitment to excellence.
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : teamMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <div key={member.id || index} className="group">
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 border border-red-200">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden border-4 border-red-200 group-hover:border-red-300 transition-colors duration-300">
                      <img 
                        src={member.image || 'https://via.placeholder.com/150x150?text=Team+Member'} 
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                    <p className="text-red-600 font-semibold mb-3">{member.position}</p>
                    <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                    
                    {/* Social Links */}
                    {(member.socialLinks && Object.values(member.socialLinks).some(link => link)) && (
                      <div className="flex justify-center space-x-3">
                        {member.socialLinks.facebook && (
                          <a href={member.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                          </a>
                        )}
                        {member.socialLinks.twitter && (
                          <a href={member.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600 transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                            </svg>
                          </a>
                        )}
                        {member.socialLinks.instagram && (
                          <a href={member.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800 transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z"/>
                            </svg>
                          </a>
                        )}
                        {member.socialLinks.linkedin && (
                          <a href={member.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900 transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No team members available at the moment.</p>
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to Create Magic?</h2>
          <p className="text-xl text-red-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            Explore our collection of premium cakes and start planning your next celebration. 
            Let us help you make every moment unforgettable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/products" 
              className="inline-block bg-yellow-400 text-red-800 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Shop Now
            </Link>
            <Link 
              to="/contact" 
              className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-red-800 transform hover:scale-105 transition-all duration-200"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs; 