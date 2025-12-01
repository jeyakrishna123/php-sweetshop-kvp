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
      if (response.data.success && Array.isArray(response.data.data?.team)) {
        const activeMembers = response.data.data.team.filter(member => member.isActive);
        setTeamMembers(activeMembers);
      } else {
        setTeamMembers([]);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      setTeamMembers([]);
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
    <div className="min-h-screen bg-white">
      {/* Compact Hero Section */}
      <div className="relative bg-gradient-to-br from-pink-600 via-pink-700 to-red-600 overflow-hidden">
        {/* Elegant Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px'
          }}></div>
        </div>

        {/* Decorative Shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div ref={headerTextRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          {/* Breadcrumb */}
          <nav className="mb-6 sm:mb-8 flex items-center justify-center text-sm sm:text-base">
            <Link to="/" className="text-white/80 hover:text-pink-200 transition-colors duration-200 font-medium">
              Home
            </Link>
            <span className="text-white/60 mx-3">/</span>
            <span className="text-pink-200 font-semibold">About Us</span>
          </nav>

          {/* Title Section */}
          <div className="text-center space-y-4 sm:space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight">
              About <span className="text-pink-200 block sm:inline-block mt-1 sm:mt-0">SK Bakers</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed font-light">
              Your trusted partner in creating magical moments with premium quality cakes and exceptional service.
            </p>
          </div>
        </div>

        {/* Elegant Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 sm:h-16 text-white" fill="currentColor" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
          </svg>
        </div>
      </div>

      {/* Stats Section - Modern Design */}
      <div className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-gray-50 -mt-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="group relative">
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 h-full flex flex-col items-center justify-center">
                  <div className="text-4xl sm:text-5xl mb-4 group-hover:scale-110 transition-transform duration-300 transform">{stat.icon}</div>
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-semibold text-sm sm:text-base text-center">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vision & Mission Section - Modern Card Design */}
      <div className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Our Vision & Mission
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              Delivering premium-quality cakes crafted with expertise and passion
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
            {/* Vision */}
            <div className="group relative bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl sm:rounded-3xl p-8 sm:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-red-100">
              <div className="absolute top-6 right-6 text-6xl sm:text-7xl opacity-10">🎯</div>
              <div className="relative z-10">
                <div className="inline-block mb-4">
                  <span className="text-4xl sm:text-5xl">🎯</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">Our Vision</h3>
                <p className="text-base sm:text-lg leading-relaxed text-gray-700">
                  At SK Bakers, our goal is to deliver premium-quality cakes crafted with expertise and passion.
                  We are committed to bringing new and creative baking techniques to our customers, ensuring every bite is a delightful experience.
                </p>
              </div>
            </div>

            {/* Mission */}
            <div className="group relative bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl sm:rounded-3xl p-8 sm:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-yellow-100">
              <div className="absolute top-6 right-6 text-6xl sm:text-7xl opacity-10">🚀</div>
              <div className="relative z-10">
                <div className="inline-block mb-4">
                  <span className="text-4xl sm:text-5xl">🚀</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">Our Mission</h3>
                <p className="text-base sm:text-lg leading-relaxed text-gray-700">
                  We bake with heart, using only the finest ingredients to craft irresistible treats that spread happiness and love in every bite.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section - Modern Grid */}
      <div className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do and every decision we make
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {values.map((value, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-2xl p-6 sm:p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 h-full flex flex-col">
                  <div className="text-5xl sm:text-6xl mb-5 group-hover:scale-110 transition-transform duration-300">
                    {value.icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed flex-grow">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Our Story Section - Professional Design */}
      <div className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Our Story
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-red-500 mx-auto rounded-full"></div>
          </div>

          {/* Story Content */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-pink-50 via-white to-red-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg border border-pink-100">
              {/* Founders Introduction */}
              <div className="mb-8 sm:mb-10 pb-6 sm:pb-8 border-b border-pink-200">
                <p className="text-lg sm:text-xl text-gray-800 leading-relaxed font-medium">
                  We are <span className="text-pink-600 font-bold">Dr. S. Sampathkannan</span> and <span className="text-pink-600 font-bold">Dr. R. Priyanka Sampath</span>, both practicing dentists since 2016.
                </p>
              </div>

              {/* Story Timeline */}
              <div className="space-y-6 sm:space-y-8">
                {/* The Beginning */}
                <div className="relative pl-8 sm:pl-10 border-l-4 border-pink-400">
                  <div className="absolute -left-2 sm:-left-2.5 top-0 w-4 h-4 sm:w-5 sm:h-5 bg-pink-500 rounded-full border-4 border-white shadow-lg"></div>
                  <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm">
                    <h3 className="text-xl sm:text-2xl font-bold text-pink-600 mb-3">The Beginning</h3>
                    <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                      Our journey into baking began unexpectedly during the COVID lockdown. With clinics closed and more time at home, we started experimenting in the kitchen just for joy.
                    </p>
                  </div>
                </div>

                {/* The First Cake */}
                <div className="relative pl-8 sm:pl-10 border-l-4 border-pink-400">
                  <div className="absolute -left-2 sm:-left-2.5 top-0 w-4 h-4 sm:w-5 sm:h-5 bg-pink-500 rounded-full border-4 border-white shadow-lg"></div>
                  <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm">
                    <h3 className="text-xl sm:text-2xl font-bold text-pink-600 mb-3">A Special Birthday</h3>
                    <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                      For our daughter <span className="font-semibold text-pink-600">Thanvisha's 3rd birthday</span>, since no bakeries were open in our town, we decided to bake her cake ourselves. We bought a small oven and created our very first cake with love. That simple moment changed everything for us.
                    </p>
                  </div>
                </div>

                {/* Home-Based Kitchen */}
                <div className="relative pl-8 sm:pl-10 border-l-4 border-pink-400">
                  <div className="absolute -left-2 sm:-left-2.5 top-0 w-4 h-4 sm:w-5 sm:h-5 bg-pink-500 rounded-full border-4 border-white shadow-lg"></div>
                  <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm">
                    <h3 className="text-xl sm:text-2xl font-bold text-pink-600 mb-3">Growing Passion</h3>
                    <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                      We began baking for our family and relatives, and soon started sharing our creations on WhatsApp. Friends loved our cakes and requested the same for their celebrations. That support encouraged us to start a home-based baking kitchen, which we ran successfully for 2–3 years.
                    </p>
                  </div>
                </div>

                {/* Learning & Training */}
                <div className="relative pl-8 sm:pl-10 border-l-4 border-pink-400">
                  <div className="absolute -left-2 sm:-left-2.5 top-0 w-4 h-4 sm:w-5 sm:h-5 bg-pink-500 rounded-full border-4 border-white shadow-lg"></div>
                  <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm">
                    <h3 className="text-xl sm:text-2xl font-bold text-pink-600 mb-3">Investing in Excellence</h3>
                    <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                      During this time, we invested deeply in learning. We attended many advanced baking and confectionery courses — both internationally and across major Indian cities like <span className="font-semibold">Mumbai, Delhi, and Bangalore</span>. These trainings helped us master a wide range of techniques and develop our own unique style.
                    </p>
                  </div>
                </div>

                {/* Expansion */}
                <div className="relative pl-8 sm:pl-10 border-l-4 border-pink-400">
                  <div className="absolute -left-2 sm:-left-2.5 top-0 w-4 h-4 sm:w-5 sm:h-5 bg-pink-500 rounded-full border-4 border-white shadow-lg"></div>
                  <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm">
                    <h3 className="text-xl sm:text-2xl font-bold text-pink-600 mb-3">Expanding Our Menu</h3>
                    <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                      With this knowledge and our growing passion, we expanded our menu to include premium wedding cakes, luxury celebration cakes, delicious desserts, pizzas, pastas, and a variety of scratch-made recipes. Everything we serve is made <span className="font-semibold text-pink-600">100% fresh</span>, and in a highly hygienic environment.
                    </p>
                  </div>
                </div>

                {/* SK Bakers Café */}
                <div className="relative pl-8 sm:pl-10 border-l-4 border-pink-400">
                  <div className="absolute -left-2 sm:-left-2.5 top-0 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-pink-500 to-red-500 rounded-full border-4 border-white shadow-lg"></div>
                  <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-xl p-5 sm:p-6 shadow-md border border-pink-200">
                    <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent mb-3">
                      Opening SK Bakers Café
                    </h3>
                    <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                      With the continuous support of our customers and family, we took the next step and opened our café — <span className="font-bold text-pink-600">SK Bakers</span>.
                    </p>
                    <p className="text-base sm:text-lg text-gray-700 leading-relaxed mt-3">
                      Today, SK Bakers is a place where <span className="font-semibold">passion meets perfection</span>.
                    </p>
                  </div>
                </div>

                {/* SK Cake Academy */}
                <div className="relative pl-8 sm:pl-10 border-l-4 border-pink-400">
                  <div className="absolute -left-2 sm:-left-2.5 top-0 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-pink-500 to-red-500 rounded-full border-4 border-white shadow-lg"></div>
                  <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm">
                    <h3 className="text-xl sm:text-2xl font-bold text-pink-600 mb-3">Sharing Knowledge</h3>
                    <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                      And as a way to share our knowledge, we also launched <span className="font-bold text-pink-600">SK Cake Academy</span>, where we have been conducting baking courses for the past one year — helping aspiring bakers learn professional skills with confidence.
                    </p>
                  </div>
                </div>
              </div>

              {/* Closing Statement */}
              <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-pink-200">
                <p className="text-lg sm:text-xl text-gray-800 leading-relaxed italic text-center font-medium">
                  Our journey from dentistry to baking has been unexpected but incredibly rewarding. Every product we create carries the same love, care, and dedication that went into the very first cake we baked for our daughter.
                </p>
              </div>
            </div>
          </div>

          {/* Why Choose SK Bakers - Modern Cards */}
          <div className="mt-12 sm:mt-16 lg:mt-20">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 sm:mb-10 text-center">Why Choose SK Bakers?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 text-center border border-pink-200 hover:shadow-lg transition-all duration-300">
                <div className="text-3xl mb-3">✅</div>
                <p className="text-sm sm:text-base text-gray-700 font-medium">100% fresh daily baked products</p>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 text-center border border-pink-200 hover:shadow-lg transition-all duration-300">
                <div className="text-3xl mb-3">👨‍🍳</div>
                <p className="text-sm sm:text-base text-gray-700 font-medium">Expert baking techniques</p>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 text-center border border-pink-200 hover:shadow-lg transition-all duration-300">
                <div className="text-3xl mb-3">🎂</div>
                <p className="text-sm sm:text-base text-gray-700 font-medium">Wide range of flavors</p>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 text-center border border-pink-200 hover:shadow-lg transition-all duration-300">
                <div className="text-3xl mb-3">🚚</div>
                <p className="text-sm sm:text-base text-gray-700 font-medium">Reliable delivery service</p>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 text-center border border-pink-200 hover:shadow-lg transition-all duration-300">
                <div className="text-3xl mb-3">💬</div>
                <p className="text-sm sm:text-base text-gray-700 font-medium">24/7 customer support</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">Meet Our Team</h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              The passionate professionals behind SK Bakers' success and commitment to excellence.
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            </div>
          ) : teamMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <div key={member.id || index} className="group">
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 border border-pink-200">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden border-4 border-pink-200 group-hover:border-pink-300 transition-colors duration-300">
                      <img 
                        src={member.image || 'https://via.placeholder.com/150x150?text=Team+Member'} 
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                    <p className="text-pink-600 font-semibold mb-3">{member.role || member.position}</p>
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
      <div className="py-12 sm:py-16 lg:py-20 text-white relative overflow-hidden bg-gradient-to-br from-pink-600 via-pink-700 to-red-600">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 text-white">Ready to Create Magic?</h2>
          <p className="text-base sm:text-xl text-white font-medium mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-2">
            Explore our collection of premium cakes and start planning your next celebration.
            Let us help you make every moment unforgettable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/products" 
              className="inline-block bg-white text-pink-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-pink-50 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Shop Now
            </Link>
            <Link 
              to="/contact" 
              className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-pink-600 transform hover:scale-105 transition-all duration-200"
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