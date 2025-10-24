import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';

const FAQ = () => {
  const [openItems, setOpenItems] = useState(new Set());

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const faqData = [
    {
      category: "General Information",
      questions: [
        {
          question: "What is SK Bakers?",
          answer: "SK Bakers is a premium home-made cakes and cafe business specializing in fresh, delicious baked goods. We offer a wide variety of cakes, pastries, cookies, and other sweet treats made with the finest ingredients."
        },
        {
          question: "Where are you located?",
          answer: "We are a home-based bakery serving customers through online orders and local delivery. Our kitchen is located in a residential area where we prepare all our fresh baked goods daily."
        },
        {
          question: "Do you have a physical store?",
          answer: "Currently, we operate as a home-based bakery with online ordering and delivery services. We don't have a physical storefront, but you can visit us by appointment for cake consultations and pickups."
        }
      ]
    },
    {
      category: "Ordering & Delivery",
      questions: [
        {
          question: "How do I place an order?",
          answer: "You can place orders through our website by browsing our products, adding items to your cart, and proceeding to checkout. You can also call us directly for custom orders and special requests."
        },
        {
          question: "What are your delivery areas?",
          answer: "We deliver within a 15km radius of our location. Free delivery is available for orders over ₹500. For areas beyond our delivery zone, we can arrange pickup from our kitchen."
        },
        {
          question: "How far in advance should I place my order?",
          answer: "For regular items, we recommend placing orders at least 24 hours in advance. For custom cakes and special occasions, please order at least 3-5 days in advance to ensure we can accommodate your request."
        },
        {
          question: "Can I modify or cancel my order?",
          answer: "You can modify or cancel your order up to 6 hours before the scheduled delivery time. For custom items, modifications may not be possible once production has started. Please contact us immediately for any changes."
        }
      ]
    },
    {
      category: "Products & Customization",
      questions: [
        {
          question: "Do you offer custom cakes?",
          answer: "Yes! We specialize in custom cakes for birthdays, weddings, anniversaries, and special occasions. We can create unique designs based on your preferences, themes, and dietary requirements."
        },
        {
          question: "What flavors do you offer?",
          answer: "We offer a wide variety of flavors including chocolate, vanilla, strawberry, red velvet, coffee, lemon, orange, and seasonal flavors. We also have sugar-free and eggless options available."
        },
        {
          question: "Do you have vegan or gluten-free options?",
          answer: "Yes, we offer vegan and gluten-free options for most of our products. Please specify your dietary requirements when placing your order, and we'll ensure your items are prepared accordingly."
        },
        {
          question: "Can I request specific ingredients or avoid certain allergens?",
          answer: "Absolutely! We can accommodate most dietary restrictions and preferences. Please inform us about any allergies or specific ingredient requirements when placing your order."
        }
      ]
    },
    {
      category: "Payment & Pricing",
      questions: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept cash on delivery, online payments through UPI, Google Pay, PhonePe, Paytm, and bank transfers. For large orders, we may require advance payment."
        },
        {
          question: "Are your prices fixed or do they vary?",
          answer: "Our base prices are fixed, but custom orders and special designs may have additional charges. We'll provide a detailed quote for custom orders before confirmation."
        },
        {
          question: "Do you offer any discounts or promotions?",
          answer: "Yes! We offer discounts for bulk orders, regular customers, and special occasions. Follow us on social media and subscribe to our newsletter for exclusive offers and seasonal promotions."
        }
      ]
    },
    {
      category: "Quality & Freshness",
      questions: [
        {
          question: "How fresh are your products?",
          answer: "All our products are baked fresh daily using the finest ingredients. We never use preservatives or artificial additives, ensuring maximum freshness and taste."
        },
        {
          question: "How should I store my cakes and pastries?",
          answer: "Store cakes in the refrigerator and consume within 3-4 days. Pastries are best consumed within 2-3 days. For longer storage, you can freeze most items for up to 2 weeks."
        },
        {
          question: "What ingredients do you use?",
          answer: "We use only premium, high-quality ingredients including real butter, fresh eggs, pure vanilla extract, and the finest chocolates. We source our ingredients from trusted suppliers to ensure quality."
        }
      ]
    },
    {
      category: "Customer Service",
      questions: [
        {
          question: "What if I'm not satisfied with my order?",
          answer: "Customer satisfaction is our priority. If you're not completely satisfied with your order, please contact us within 24 hours, and we'll make it right with a replacement or full refund."
        },
        {
          question: "How can I contact you?",
          answer: "You can reach us through our website contact form, WhatsApp, phone calls, or email. We typically respond within 2-4 hours during business hours (9 AM - 8 PM)."
        },
        {
          question: "Do you have a loyalty program?",
          answer: "Yes! We have a customer loyalty program where you earn points for every purchase. These points can be redeemed for discounts on future orders. Sign up is free and automatic with your first order."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Find answers to common questions about our products, ordering process, delivery, and more.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {faqData.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Icon name="help" className="w-6 h-6 text-pink-600 mr-3" />
              {category.category}
            </h2>
            
            <div className="space-y-4">
              {category.questions.map((item, questionIndex) => {
                const globalIndex = `${categoryIndex}-${questionIndex}`;
                const isOpen = openItems.has(globalIndex);
                
                return (
                  <div key={questionIndex} className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <button
                      onClick={() => toggleItem(globalIndex)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                    >
                      <span className="text-lg font-semibold text-gray-900 pr-4">
                        {item.question}
                      </span>
                      <Icon 
                        name={isOpen ? "chevron-up" : "chevron-down"} 
                        className="w-5 h-5 text-pink-600 flex-shrink-0" 
                      />
                    </button>
                    
                    {isOpen && (
                      <div className="px-6 pb-4">
                        <div className="border-t border-gray-100 pt-4">
                          <p className="text-gray-700 leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Contact Section */}
      <div className="bg-pink-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Still Have Questions?
          </h2>
          <p className="text-gray-600 mb-8">
            Can't find the answer you're looking for? We're here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center px-6 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-colors duration-200"
            >
              <Icon name="mail" className="w-5 h-5 mr-2" />
              Contact Us
            </Link>
            <a
              href="tel:+91-XXXXXXXXXX"
              className="inline-flex items-center px-6 py-3 bg-white text-pink-600 font-semibold rounded-lg border border-pink-600 hover:bg-pink-50 transition-colors duration-200"
            >
              <Icon name="phone" className="w-5 h-5 mr-2" />
              Call Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
