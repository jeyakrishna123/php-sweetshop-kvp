import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import PaymentMethods from "../components/PaymentMethods";
import CheckoutSkeleton from "../components/CheckoutSkeleton";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_key');

const Checkout = () => {
  const { cart, dispatch } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod"); // Default to Cash on Delivery
  const [upiId, setUpiId] = useState(""); // For UPI payment
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);

  // Calculate totals
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const deliveryCharge = subtotal > 1000 ? 0 : 100;
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + deliveryCharge + tax;

  const getImageUrl = (image) => {
    if (typeof image === 'string') return image;
    if (image && image.url) return image.url;
    if (image && image.images && image.images.length > 0) {
      const firstImage = image.images[0];
      if (typeof firstImage === "string") return firstImage;
      if (firstImage && firstImage.url) return firstImage.url;
    }
    return "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop";
  };

  // Payment success handler
  const handlePaymentSuccess = (paymentData) => {
    showToast("Payment successful! Order placed.", "success");
    dispatch({ type: "CLEAR_CART" });
    navigate(`/success?orderId=${paymentData.orderId}`);
  };

  // Payment error handler
  const handlePaymentError = (error) => {
    showToast(error || "Payment failed. Please try again.", "error");
  };

  useEffect(() => {
    // Simulate initial page load
    const initCheckout = async () => {
      setPageLoading(true);

      // Minimum loading time for smooth UX
      await new Promise(resolve => setTimeout(resolve, 800));

      if (!user) {
        showToast("Please login to checkout", "warning");
        navigate("/login");
        return;
      }

      if (cart.length === 0) {
        showToast("Your cart is empty", "warning");
        navigate("/cart");
        return;
      }

      // Load saved address
      const savedAddress = localStorage.getItem("shippingAddress");
      if (savedAddress) {
        try {
          const parsed = JSON.parse(savedAddress);
          setFormData(prev => ({ ...prev, ...parsed }));
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error("Error parsing saved address:", error);
          }
        }
      }

      // Pre-fill with user data
      if (user) {
        setFormData(prev => ({
          ...prev,
          email: user.email || "",
          firstName: user.name?.split(" ")[0] || "",
          lastName: user.name?.split(" ").slice(1).join(" ") || ""
        }));
      }

      setPageLoading(false);
    };

    initCheckout();
  }, [user, cart, navigate, showToast]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.postalCode.trim()) newErrors.postalCode = "Postal code is required";
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    // UPI validation
    if (paymentMethod === "upi" && !upiId.trim()) {
      newErrors.upiId = "UPI ID is required";
    } else if (paymentMethod === "upi" && upiId.trim()) {
      const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;
      if (!upiRegex.test(upiId.trim())) {
        newErrors.upiId = "Please enter a valid UPI ID (e.g., name@upi)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };



  const handleStripePayment = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to load");
      }

      const response = await axios.post(`${process.env.NODE_ENV === 'production' ? 'https://skbakers.com/api' : 'http://localhost:8000/api'}/stripe/create-checkout-session`, {
        cartItems: cart.map(item => ({
          _id: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: getImageUrl(item),
          selectedWeight: item.selectedWeight
        })),
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country
        },
        customerInfo: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone
        }
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data && response.data.id) {
        const result = await stripe.redirectToCheckout({
          sessionId: response.data.id
        });

        if (result.error) {
          throw new Error(result.error.message);
        }
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Stripe payment error:", error);
      }
      if (error.response?.status === 503) {
        showToast("Credit card payment is not available. Please use Cash on Delivery.", "warning");
      } else {
        showToast("Payment processing failed. Please try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

    const handleCODPayment = async () => {
    setLoading(true);
    try {
      // Debug: Check authentication (development only)
      const token = localStorage.getItem('token');
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Checkout: Token exists:', !!token);
        console.log('🔍 Checkout: Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
        console.log('🔍 Checkout: User:', user);
      }
      
      if (!token) {
        showToast("Please login to place an order", "error");
        navigate('/login');
        return;
      }

      // Validate form data before creating order
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || 
          !formData.address || !formData.city || !formData.state || !formData.postalCode) {
        showToast("Please fill in all required fields", "error");
        setLoading(false);
        return;
      }

      const orderData = {
        orderItems: cart.map((item) => {
          // Get the correct image - check multiple possible fields
          let itemImage = item.image;

          if (!itemImage && item.thumbnail) {
            itemImage = item.thumbnail;
          }

          if (!itemImage && item.images && Array.isArray(item.images) && item.images.length > 0) {
            itemImage = typeof item.images[0] === 'string' ? item.images[0] : item.images[0]?.url;
          }

          // Fallback to a placeholder if still no image
          if (!itemImage) {
            itemImage = '/images/placeholder-product.jpg';
            if (process.env.NODE_ENV === 'development') {
              console.warn('⚠️ No image found for product:', item.name);
            }
          }

          return {
            product: item._id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: itemImage,
            selectedWeight: item.selectedWeight
          };
        }),
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country
        },
        paymentMethod: "cod",
        itemsPrice: subtotal,
        taxPrice: tax,
        shippingPrice: deliveryCharge,
        totalPrice: total,
        customerInfo: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone
        }
      };

      // Only log in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Checkout: Making order API call...');
        console.log('🔍 Checkout: Order data:', JSON.stringify(orderData, null, 2));
        console.log('🔍 Checkout: Cart items:', JSON.stringify(cart, null, 2));
      }
      
      const response = await axios.post(`${process.env.NODE_ENV === 'production' ? 'https://skbakers.com/api' : 'http://localhost:8000/api'}/orders`, orderData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        timeout: 30000 // 30 second timeout
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Checkout: API response received:', response.data);
        console.log('✅ Checkout: Order response:', JSON.stringify(response.data, null, 2));
      }

      if (response.data && response.data.success) {
        // Clear cart after successful order
        dispatch({ type: 'CLEAR_CART' });

        // Clear cart from localStorage as well
        localStorage.removeItem('cartItems');

        showToast("Order placed successfully! Your bill has been sent to your email. Pay on delivery.", "success", 4000);

        // Handle different response structures
        const orderData = response.data.data?.order || response.data.order || response.data.data || {};
        const orderId = orderData.id || orderData._id || response.data.orderId || response.data.data?.orderId;
        // Use 6-digit order number if available (prioritize from response.data)
        // This is the dynamically generated unique 6-digit order ID
        const orderNumber = response.data.orderNumber || 
                           response.data.displayOrderId || 
                           orderData.order_number || 
                           orderData.display_order_id ||
                           null; // Don't fallback to orderId - we want the 6-digit number
        const totalPrice = orderData.total_price || orderData.totalPrice || total;
        const trackingNumber = orderData.tracking_number || response.data.trackingNumber || response.data.data?.trackingNumber;

        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Checkout: Extracted order data:', { orderId, orderNumber, totalPrice, trackingNumber });
        }

        // Store order details in sessionStorage as backup
        const orderSuccessData = {
          orderId: orderId,
          orderNumber: orderNumber, // 6-digit unique order ID for display (dynamically generated)
          total: totalPrice,
          trackingNumber: trackingNumber,
          orderDetails: {
            ...orderData,
            order_number: orderNumber, // Ensure order_number is in orderDetails too
            display_order_id: orderNumber
          },
          paymentStatus: 'pending'
        };
        
        // Log for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Checkout: Order success data:', { orderId, orderNumber, orderData });
        }
        sessionStorage.setItem('orderSuccessDetails', JSON.stringify(orderSuccessData));

        // Navigate to success page with order details
        navigate('/success', {
          replace: true,
          state: orderSuccessData
        });
      } else {
        throw new Error("Failed to create order");
      }
    } catch (error) {
      // CRITICAL: Handle invalid products error FIRST - before ANY console logging
      // Check multiple possible error response structures
      const errorData = error.response?.data;
      const errorStatus = error.response?.status;
      
      // Check for missingProductIds in different possible locations
      const missingProductIds = errorData?.errors?.missingProductIds || 
                                 errorData?.missingProductIds || 
                                 (errorStatus === 400 && errorData?.message?.includes('Invalid products') ? [] : null);
      
      // Check for unavailableProductIds
      const unavailableProductIds = errorData?.errors?.unavailableProductIds || 
                                     errorData?.unavailableProductIds;
      
      // Handle invalid/missing products error
      if (errorStatus === 400 && (missingProductIds || unavailableProductIds)) {
        const invalidIds = missingProductIds || unavailableProductIds || [];
        const errorMessage = errorData?.errors?.error || 
                            errorData?.error || 
                            "Some products in your cart are no longer available";
        
        // Remove invalid products from cart
        // Compare both string and number IDs to handle type mismatches
        const validCart = cart.filter(item => {
          const itemId = item._id || item.id;
          if (!itemId) return true; // Keep items without ID (shouldn't happen)
          
          return !invalidIds.some(invalidId => {
            // Try multiple comparison methods
            return itemId == invalidId || 
                   String(itemId) === String(invalidId) ||
                   Number(itemId) === Number(invalidId);
          });
        });
        
        const removedCount = cart.length - validCart.length;
        
        if (removedCount > 0) {
          // Update cart with only valid products
          dispatch({ type: 'SET_CART', payload: validCart });
          
          // Update localStorage
          localStorage.setItem('cartItems', JSON.stringify(validCart));
          
          // Show user-friendly message
          showToast(
            `${removedCount} product(s) removed from cart as they are no longer available. Please review your cart and try again.`,
            "warning",
            5000
          );
          
          // Navigate back to cart to review
          setTimeout(() => {
            navigate('/cart');
          }, 2000);
        } else {
          // Fallback if product IDs don't match - still show message
          showToast(errorMessage + ". Please refresh your cart.", "error");
          // Navigate to cart anyway
          setTimeout(() => {
            navigate('/cart');
          }, 2000);
        }
        
        setLoading(false);
        return; // CRITICAL: Exit early - NO console errors for this case
      }
      
      // Note: Product validation errors (400 with missingProductIds/unavailableProductIds) 
      // are handled above and return early - no console errors for those cases
      
      // Only log errors for non-product validation issues (and only in development)
      // NEVER log 400 errors - they're handled above
      if (process.env.NODE_ENV === 'development' && error.response?.status !== 400) {
        console.error("❌ Checkout: COD payment error:", error);
        console.error("❌ Checkout: Error details:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
      }
      
      // For ANY 400 errors (including product validation), show message but NEVER log
      // This catches any 400 errors that weren't caught above
      if (error.response?.status === 400) {
        const backendMessage = errorData?.message || 
                             errorData?.errors?.message || 
                             errorData?.errors?.error ||
                             "Invalid request. Please check your order and try again.";
        showToast(backendMessage, "error");
        setLoading(false);
        return; // Exit early - no console logging
      }
      
      // Check if it's a timeout error but order might have been created
      if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 Checkout: Timeout error detected, checking if order was created...');
        }
        showToast("Order is being processed. Please check your orders page.", "info");
        dispatch({ type: 'CLEAR_CART' });
        localStorage.removeItem('cartItems');
        navigate('/orders');
        return;
      }
      
      // Check if it's a network error (backend not running)
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        showToast("Backend server is not available. Please try again later.", "error");
      } else if (error.response?.status === 401) {
        showToast("Please login again to place your order.", "error");
        navigate('/login');
      } else {
        // All other errors (non-400, non-network, non-auth)
        showToast("Failed to place order. Please try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUPIPayment = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const orderData = {
        orderItems: cart.map((item) => {
          // Get the correct image - check multiple possible fields
          let itemImage = item.image;

          if (!itemImage && item.thumbnail) {
            itemImage = item.thumbnail;
          }

          if (!itemImage && item.images && Array.isArray(item.images) && item.images.length > 0) {
            itemImage = typeof item.images[0] === 'string' ? item.images[0] : item.images[0]?.url;
          }

          // Fallback to a placeholder if still no image
          if (!itemImage) {
            itemImage = '/images/placeholder-product.jpg';
            if (process.env.NODE_ENV === 'development') {
              console.warn('⚠️ No image found for product:', item.name);
            }
          }

          return {
            product: item._id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: itemImage,
            selectedWeight: item.selectedWeight
          };
        }),
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country
        },
        paymentMethod: "upi",
        itemsPrice: subtotal,
        taxPrice: tax,
        shippingPrice: deliveryCharge,
        totalPrice: total,
        customerInfo: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone
        },
        upiId: upiId.trim()
      };

      const response = await axios.post(`${process.env.NODE_ENV === 'production' ? 'https://skbakers.com/api' : 'http://localhost:8000/api'}/orders`, orderData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        timeout: 10000
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Checkout UPI: Order response:', JSON.stringify(response.data, null, 2));
      }

      if (response.data && response.data.success) {
        // Clear cart after successful order
        dispatch({ type: 'CLEAR_CART' });

        // Clear cart from localStorage as well
        localStorage.removeItem('cartItems');

        showToast("Order placed successfully! Your bill has been sent to your email. Payment received via UPI.", "success", 4000);

        // Handle different response structures
        const orderData = response.data.data?.order || response.data.order || response.data.data || {};
        const orderId = orderData.id || orderData._id || response.data.orderId || response.data.data?.orderId;
        // Use 6-digit order number if available (prioritize from response.data)
        // This is the dynamically generated unique 6-digit order ID
        const orderNumber = response.data.orderNumber || 
                           response.data.displayOrderId || 
                           orderData.order_number || 
                           orderData.display_order_id ||
                           null; // Don't fallback to orderId - we want the 6-digit number
        const totalPrice = orderData.total_price || orderData.totalPrice || total;
        const trackingNumber = orderData.tracking_number || response.data.trackingNumber || response.data.data?.trackingNumber;

        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Checkout UPI: Extracted order data:', { orderId, orderNumber, totalPrice, trackingNumber });
        }

        // Store order details in sessionStorage as backup
        const orderSuccessData = {
          orderId: orderId,
          orderNumber: orderNumber, // 6-digit unique order ID for display (dynamically generated)
          total: totalPrice,
          trackingNumber: trackingNumber,
          orderDetails: {
            ...orderData,
            order_number: orderNumber, // Ensure order_number is in orderDetails too
            display_order_id: orderNumber
          },
          paymentStatus: 'paid'
        };
        
        // Log for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Checkout UPI: Order success data:', { orderId, orderNumber, orderData });
        }
        sessionStorage.setItem('orderSuccessDetails', JSON.stringify(orderSuccessData));

        // Navigate to success page with order details
        navigate('/success', {
          replace: true,
          state: orderSuccessData
        });
      } else {
        throw new Error("Failed to create order");
      }
    } catch (error) {
      // CRITICAL: Handle invalid products error FIRST - same logic as COD
      const errorData = error.response?.data;
      const errorStatus = error.response?.status;
      
      const missingProductIds = errorData?.errors?.missingProductIds || 
                                 errorData?.missingProductIds;
      const unavailableProductIds = errorData?.errors?.unavailableProductIds || 
                                     errorData?.unavailableProductIds;
      
      // Handle invalid/missing products error
      if (errorStatus === 400 && (missingProductIds || unavailableProductIds)) {
        const invalidIds = missingProductIds || unavailableProductIds || [];
        const errorMessage = errorData?.errors?.error || 
                            errorData?.error || 
                            "Some products in your cart are no longer available";
        
        const validCart = cart.filter(item => {
          const itemId = item._id || item.id;
          if (!itemId) return true;
          
          return !invalidIds.some(invalidId => {
            return itemId == invalidId || 
                   String(itemId) === String(invalidId) ||
                   Number(itemId) === Number(invalidId);
          });
        });
        
        const removedCount = cart.length - validCart.length;
        
        if (removedCount > 0) {
          dispatch({ type: 'SET_CART', payload: validCart });
          localStorage.setItem('cartItems', JSON.stringify(validCart));
          showToast(
            `${removedCount} product(s) removed from cart as they are no longer available. Please review your cart and try again.`,
            "warning",
            5000
          );
          setTimeout(() => navigate('/cart'), 2000);
        } else {
          showToast(errorMessage + ". Please refresh your cart.", "error");
          setTimeout(() => navigate('/cart'), 2000);
        }
        
        setLoading(false);
        return; // Exit early - no console errors
      }
      
      // For ANY 400 errors, show message but NEVER log
      if (errorStatus === 400) {
        const backendMessage = errorData?.message || 
                             errorData?.errors?.message || 
                             errorData?.errors?.error ||
                             "Invalid request. Please check your order and try again.";
        showToast(backendMessage, "error");
        setLoading(false);
        return; // Exit early - no console logging
      }
      
      // Only log non-400 errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error("UPI payment error:", error);
      }
      
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        showToast("Backend server is not available. Please try again later.", "error");
      } else if (error.response?.status === 401) {
        showToast("Please login again to place your order.", "error");
        navigate('/login');
      } else {
        showToast("Failed to place order. Please try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (paymentMethod === "stripe") {
      await handleStripePayment();
    } else if (paymentMethod === "upi") {
      await handleUPIPayment();
    } else {
      await handleCODPayment();
    }
  };

  // Show loading skeleton on page load
  if (pageLoading) {
    return <CheckoutSkeleton />;
  }

  if (!user || cart.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl mb-4 shadow-lg">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">Secure Checkout</h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600">Complete your purchase with confidence</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* Customer Information */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8">
                <div className="flex items-center mb-6 sm:mb-8">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Customer Information</h2>
                    <p className="text-gray-600 text-sm sm:text-base">Tell us about yourself</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="group">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mr-2"></span>
                      First Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full px-3 sm:px-4 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-gray-900 placeholder-gray-400 text-sm sm:text-base ${
                          errors.firstName 
                            ? 'border-red-400 bg-red-50' 
                            : 'border-gray-200 hover:border-blue-300 focus:border-blue-500 bg-white'
                        }`}
                        placeholder="Enter your first name"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                    {errors.firstName && (
                      <div className="flex items-center mt-2 text-red-500 text-xs sm:text-sm">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.firstName}
                      </div>
                    )}
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Last Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-gray-900 placeholder-gray-400 ${
                          errors.lastName 
                            ? 'border-red-400 bg-red-50' 
                            : 'border-gray-200 hover:border-blue-300 focus:border-blue-500 bg-white'
                        }`}
                        placeholder="Enter your last name"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                    {errors.lastName && (
                      <div className="flex items-center mt-2 text-red-500 text-sm">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.lastName}
                      </div>
                    )}
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Email Address *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-300 text-gray-900 placeholder-gray-400 ${
                          errors.email 
                            ? 'border-red-400 bg-red-50' 
                            : 'border-gray-200 hover:border-green-300 focus:border-green-500 bg-white'
                        }`}
                        placeholder="Enter your email address"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg className="w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    {errors.email && (
                      <div className="flex items-center mt-2 text-red-500 text-sm">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.email}
                      </div>
                    )}
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                      Phone Number *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 text-gray-900 placeholder-gray-400 ${
                          errors.phone 
                            ? 'border-red-400 bg-red-50' 
                            : 'border-gray-200 hover:border-purple-300 focus:border-purple-500 bg-white'
                        }`}
                        placeholder="Enter your phone number"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                    </div>
                    {errors.phone && (
                      <div className="flex items-center mt-2 text-red-500 text-sm">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="flex items-center mb-8">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Shipping Address</h2>
                    <p className="text-gray-600">Where should we deliver your order?</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                      Street Address *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 transition-all duration-300 text-gray-900 placeholder-gray-400 ${
                          errors.address 
                            ? 'border-red-400 bg-red-50' 
                            : 'border-gray-200 hover:border-orange-300 focus:border-orange-500 bg-white'
                        }`}
                        placeholder="Enter your complete street address"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    </div>
                    {errors.address && (
                      <div className="flex items-center mt-2 text-red-500 text-sm">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.address}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        City *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-500/20 transition-all duration-300 text-gray-900 placeholder-gray-400 ${
                            errors.city 
                              ? 'border-red-400 bg-red-50' 
                              : 'border-gray-200 hover:border-red-300 focus:border-red-500 bg-white'
                          }`}
                          placeholder="Enter city name"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <svg className="w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      </div>
                      {errors.city && (
                        <div className="flex items-center mt-2 text-red-500 text-sm">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.city}
                        </div>
                      )}
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                        State *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-500/20 transition-all duration-300 text-gray-900 placeholder-gray-400 ${
                            errors.state 
                              ? 'border-red-400 bg-red-50' 
                              : 'border-gray-200 hover:border-yellow-300 focus:border-yellow-500 bg-white'
                          }`}
                          placeholder="Enter state name"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <svg className="w-5 h-5 text-gray-400 group-focus-within:text-yellow-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4-2m-4 2V5m-4 2l4-2m-4 2v10" />
                          </svg>
                        </div>
                      </div>
                      {errors.state && (
                        <div className="flex items-center mt-2 text-red-500 text-sm">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.state}
                        </div>
                      )}
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Postal Code *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-300 text-gray-900 placeholder-gray-400 ${
                            errors.postalCode 
                              ? 'border-red-400 bg-red-50' 
                              : 'border-gray-200 hover:border-green-300 focus:border-green-500 bg-white'
                          }`}
                          placeholder="Enter postal code"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <svg className="w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                          </svg>
                        </div>
                      </div>
                      {errors.postalCode && (
                        <div className="flex items-center mt-2 text-red-500 text-sm">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.postalCode}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                      Country
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 text-gray-900 placeholder-gray-400 hover:border-indigo-300 focus:border-indigo-500 bg-white"
                        placeholder="Enter country name"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
                    <p className="text-gray-600">Choose how you'd like to pay</p>
                  </div>
                  </div>
                  <button
                    onClick={() => setShowPaymentMethods(!showPaymentMethods)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {showPaymentMethods ? 'Hide Options' : 'Show All Options'}
                  </button>
                </div>
                
                {showPaymentMethods ? (
                  <PaymentMethods
                    cartItems={cart}
                    totalAmount={total}
                    shippingAddress={formData}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                  />
                ) : (
                <div className="space-y-6">
                    {/* Quick Payment Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cash on Delivery */}
                  <div className="group">
                    <div className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-300 transition-all duration-300 cursor-pointer bg-white">
                      <input
                        type="radio"
                        id="cod"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                      />
                      <div className="ml-4 flex-1">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <div>
                            <label htmlFor="cod" className="text-lg font-semibold text-gray-900 cursor-pointer">
                              Cash on Delivery
                            </label>
                            <p className="text-sm text-gray-600">Pay when you receive your order</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* UPI Payment */}
                  <div className="group">
                    <div className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 transition-all duration-300 cursor-pointer bg-white">
                      <input
                        type="radio"
                        id="upi"
                        name="paymentMethod"
                        value="upi"
                        checked={paymentMethod === "upi"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300"
                      />
                      <div className="ml-4 flex-1">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <label htmlFor="upi" className="text-lg font-semibold text-gray-900 cursor-pointer">
                              UPI Payment
                            </label>
                            <p className="text-sm text-gray-600">Instant payment via UPI</p>
                          </div>
                        </div>
                      </div>
                    </div>
                          </div>
                        </div>
                          </div>
                        )}
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-8 sticky top-8">
              <div className="flex items-center mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
                  <p className="text-gray-600">Review your order details</p>
                </div>
              </div>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item._id} className="flex items-center space-x-4">
                    <img
                      src={getImageUrl(item)}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop";
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      {item.selectedWeight && (
                        <p className="text-sm text-gray-500">Weight: {item.selectedWeight.weight} Kg</p>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({cart.length} items)</span>
                  <span className="text-gray-900">₹{subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Charge</span>
                  <span className="text-gray-900">
                    {deliveryCharge === 0 ? 'Free' : `₹${deliveryCharge}`}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (18% GST)</span>
                  <span className="text-gray-900">₹{tax.toLocaleString()}</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-pink-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-8"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    <span className="text-lg">Processing Order...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Place Order - ₹{total.toLocaleString()}</span>
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate('/cart')}
                className="w-full border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-xl font-semibold text-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 mt-4 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

