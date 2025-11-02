/**
 * OTP Input Type Fix
 * This script ensures OTP inputs are properly set to type="number" for mobile numeric keypad
 */

(function() {
    'use strict';
    
    // Function to fix OTP input types
    function fixOtpInputTypes() {
        // Find all input elements that look like OTP inputs
        const inputs = document.querySelectorAll('input[inputmode="numeric"], input[pattern="[0-9]*"], input[maxlength="1"]');
        
        console.log('Found OTP inputs:', inputs.length);
        
        inputs.forEach((input, index) => {
            // Force type to number and add numeric attributes
            if (input.type !== 'number') {
                input.type = 'number';
                input.inputMode = 'numeric';
                input.pattern = '[0-9]*';
                input.min = '0';
                input.max = '9';
                input.step = '1';
                
                // Remove spin buttons on webkit browsers
                input.style.WebkitAppearance = 'none';
                input.style.MozAppearance = 'textfield';
                
                console.log(`Fixed OTP input ${index + 1}: changed type to number with numeric attributes`);
            }
        });
    }
    
    // Function to fix OTP inputs when modal opens
    function observeOtpModal() {
        // Watch for changes in the DOM that might indicate OTP modal opening
        let observer = null;
        
        function createObserver() {
            try {
                observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        if (mutation.type === 'childList') {
                            // Check if OTP inputs are now visible
                            const otpInputs = document.querySelectorAll('input[inputmode="numeric"], input[pattern="[0-9]*"], input[maxlength="1"]');
                            if (otpInputs.length > 0) {
                                fixOtpInputTypes();
                            }
                        }
                    });
                });
                return true;
            } catch (e) {
                console.warn('OTP Input Fix: Could not create observer:', e.message);
                return false;
            }
        }
        
        // Start observing only if document.body exists and is a valid Node
        function startObserving() {
            try {
                // Ensure observer is created
                if (!observer && !createObserver()) {
                    return false;
                }
                
                // Check if body exists and is a valid Node
                const body = document.body;
                if (!body) {
                    return false;
                }
                
                // Additional Node validation
                if (typeof Node !== 'undefined' && !(body instanceof Node)) {
                    return false;
                }
                
                // Check if nodeType exists (older browser compatibility)
                if (body.nodeType === undefined) {
                    return false;
                }
                
                // Now safely observe
                observer.observe(body, {
                    childList: true,
                    subtree: true
                });
                return true;
            } catch (e) {
                console.warn('OTP Input Fix: Could not start observer:', e.message);
                return false;
            }
        }
        
        // Try to start observing - only after DOM is ready
        function attemptObservation() {
            if (document.body && document.body.nodeType) {
                if (!startObserving()) {
                    // Retry after a short delay
                    setTimeout(attemptObservation, 200);
                }
            } else {
                // Body not ready yet, wait
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', function() {
                        setTimeout(attemptObservation, 100);
                    });
                } else {
                    setTimeout(attemptObservation, 100);
                }
            }
        }
        
        // Start attempting observation
        attemptObservation();
    }
    
    // Function to force fix all numeric inputs
    function forceFixAllInputs() {
        const allInputs = document.querySelectorAll('input');
        allInputs.forEach((input, index) => {
            // Check if this looks like an OTP input
            if (input.maxLength === 1 || 
                input.inputMode === 'numeric' || 
                input.pattern === '[0-9]*' ||
                (input.className && input.className.includes('otp')) ||
                (input.parentElement && input.parentElement.className && input.parentElement.className.includes('otp'))) {
                
                input.type = 'number';
                input.inputMode = 'numeric';
                input.pattern = '[0-9]*';
                input.min = '0';
                input.max = '9';
                input.step = '1';
                input.style.WebkitAppearance = 'none';
                input.style.MozAppearance = 'textfield';
                
                console.log(`Force fixed input ${index + 1} to number type`);
            }
        });
    }
    
    // Run immediately
    fixOtpInputTypes();
    forceFixAllInputs();
    
    // Run after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            fixOtpInputTypes();
            forceFixAllInputs();
        });
    }
    
    // Run after a short delay to catch dynamically loaded content
    setTimeout(function() {
        fixOtpInputTypes();
        forceFixAllInputs();
    }, 1000);
    
    setTimeout(function() {
        fixOtpInputTypes();
        forceFixAllInputs();
    }, 3000);
    
    // Run every 2 seconds to catch any missed inputs
    setInterval(function() {
        fixOtpInputTypes();
        forceFixAllInputs();
    }, 2000);
    
    // Start observing for dynamic content
    observeOtpModal();
    
    console.log('OTP Input Type Fix loaded - Enhanced version');
})();
