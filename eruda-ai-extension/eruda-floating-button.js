/**
 * Eruda Floating Button - DOM Shortcut for Direct Eruda Initialization
 * Bypasses extension popup limitations and Android compatibility issues
 */

(function() {
    'use strict';
    
    // Prevent multiple injections
    if (window.erudaFloatingButtonInjected) {
        return;
    }
    window.erudaFloatingButtonInjected = true;

    // Configuration
    const CONFIG = {
        buttonSize: '64px',
        buttonPosition: {
            bottom: '20px',
            right: '20px'
        },
        zIndex: 999999,
        animationDuration: '0.3s',
        colors: {
            primary: '#007bff',
            secondary: '#28a745',
            danger: '#dc3545',
            warning: '#ffc107',
            background: 'rgba(0, 123, 255, 0.95)',
            backgroundHover: 'rgba(0, 123, 255, 1)',
            text: '#ffffff'
        },
        // Mobile detection and adjustments
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isAndroid: /Android/i.test(navigator.userAgent)
    };

    // State management
    let isErudaLoaded = false;
    let isErudaVisible = false;
    let floatingButton = null;
    let statusIndicator = null;

    /**
     * Create the floating button element
     */
    function createFloatingButton() {
        const button = document.createElement('div');
        button.id = 'eruda-floating-button';
        
        // Enhanced icon for better visibility
        button.innerHTML = `
            <div class="eruda-btn-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                </svg>
            </div>
            <div class="eruda-btn-text">Debug</div>
        `;

        // Mobile-responsive sizing
        const buttonSize = CONFIG.isMobile ? '72px' : CONFIG.buttonSize;
        const fontSize = CONFIG.isMobile ? '11px' : '10px';
        const iconSize = CONFIG.isMobile ? '32px' : '28px';

        // Apply styles
        Object.assign(button.style, {
            position: 'fixed',
            bottom: CONFIG.buttonPosition.bottom,
            right: CONFIG.buttonPosition.right,
            width: buttonSize,
            height: buttonSize,
            backgroundColor: CONFIG.colors.background,
            color: CONFIG.colors.text,
            borderRadius: '50%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: CONFIG.zIndex,
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)',
            transition: `all ${CONFIG.animationDuration} ease`,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: fontSize,
            fontWeight: '700',
            userSelect: 'none',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(10px)',
            // Enhanced mobile touch support
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent'
        });

        // Icon styles
        const icon = button.querySelector('.eruda-btn-icon');
        Object.assign(icon.style, {
            marginBottom: '2px',
            transition: `transform ${CONFIG.animationDuration} ease`
        });

        // Text styles
        const text = button.querySelector('.eruda-btn-text');
        Object.assign(text.style, {
            fontSize: '8px',
            lineHeight: '1',
            opacity: '0.9'
        });

        return button;
    }

    /**
     * Create status indicator
     */
    function createStatusIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'eruda-status-indicator';
        
        Object.assign(indicator.style, {
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: CONFIG.colors.danger,
            border: '2px solid white',
            transition: `all ${CONFIG.animationDuration} ease`,
            zIndex: CONFIG.zIndex + 1
        });

        return indicator;
    }

    /**
     * Update button appearance based on Eruda state
     */
    function updateButtonState() {
        if (!floatingButton || !statusIndicator) return;

        if (isErudaLoaded) {
            if (isErudaVisible) {
                // Eruda is loaded and visible
                floatingButton.style.backgroundColor = CONFIG.colors.secondary;
                statusIndicator.style.backgroundColor = CONFIG.colors.secondary;
                floatingButton.querySelector('.eruda-btn-text').textContent = 'Hide';
                floatingButton.title = 'Hide Eruda Console';
            } else {
                // Eruda is loaded but hidden
                floatingButton.style.backgroundColor = CONFIG.colors.warning;
                statusIndicator.style.backgroundColor = CONFIG.colors.warning;
                floatingButton.querySelector('.eruda-btn-text').textContent = 'Show';
                floatingButton.title = 'Show Eruda Console';
            }
        } else {
            // Eruda not loaded
            floatingButton.style.backgroundColor = CONFIG.colors.background;
            statusIndicator.style.backgroundColor = CONFIG.colors.danger;
            floatingButton.querySelector('.eruda-btn-text').textContent = 'Debug';
            floatingButton.title = 'Initialize Eruda Console';
        }
    }

    /**
     * Add hover effects
     */
    function addHoverEffects() {
        if (!floatingButton) return;

        floatingButton.addEventListener('mouseenter', () => {
            floatingButton.style.transform = 'scale(1.1)';
            floatingButton.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
            floatingButton.querySelector('.eruda-btn-icon').style.transform = 'rotate(10deg)';
        });

        floatingButton.addEventListener('mouseleave', () => {
            floatingButton.style.transform = 'scale(1)';
            floatingButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
            floatingButton.querySelector('.eruda-btn-icon').style.transform = 'rotate(0deg)';
        });
    }

    /**
     * Load Eruda library dynamically
     */
    async function loadEruda() {
        return new Promise((resolve, reject) => {
            // Check if Eruda is already available
            if (window.eruda) {
                resolve(window.eruda);
                return;
            }

            // Try to load from extension first
            const extensionScript = document.createElement('script');
            extensionScript.src = chrome.runtime.getURL('eruda.min.js');
            extensionScript.onload = () => {
                console.log('✅ Eruda loaded from extension');
                resolve(window.eruda);
            };
            extensionScript.onerror = () => {
                console.log('⚠️ Extension Eruda failed, trying CDN...');
                
                // Fallback to CDN
                const cdnScript = document.createElement('script');
                cdnScript.src = 'https://cdn.jsdelivr.net/npm/eruda@3.0.1/eruda.min.js';
                cdnScript.onload = () => {
                    console.log('✅ Eruda loaded from CDN');
                    resolve(window.eruda);
                };
                cdnScript.onerror = () => {
                    console.error('❌ Failed to load Eruda from both extension and CDN');
                    reject(new Error('Failed to load Eruda'));
                };
                document.head.appendChild(cdnScript);
            };
            document.head.appendChild(extensionScript);
        });
    }

    /**
     * Initialize Eruda console
     */
    async function initializeEruda() {
        try {
            showLoadingState();
            
            const eruda = await loadEruda();
            
            if (!eruda) {
                throw new Error('Eruda library not available');
            }

            // Initialize Eruda if not already initialized
            if (!eruda._isInit) {
                eruda.init({
                    container: document.body,
                    tool: ['console', 'elements', 'network', 'resources', 'info', 'snippets', 'sources'],
                    useShadowDom: true,
                    autoScale: true,
                    defaults: {
                        displaySize: 50,
                        transparency: 0.9,
                        theme: 'auto'
                    }
                });
                
                console.log('🚀 Eruda initialized successfully');
            }

            isErudaLoaded = true;
            isErudaVisible = true;
            
            // Monitor Eruda visibility
            monitorErudaVisibility();
            
            updateButtonState();
            hideLoadingState();
            
            // Show success notification
            showNotification('Eruda Console Activated!', 'success');
            
        } catch (error) {
            console.error('❌ Failed to initialize Eruda:', error);
            hideLoadingState();
            showNotification('Failed to load Eruda Console', 'error');
        }
    }

    /**
     * Toggle Eruda visibility
     */
    function toggleEruda() {
        if (!window.eruda || !isErudaLoaded) {
            initializeEruda();
            return;
        }

        if (isErudaVisible) {
            window.eruda.hide();
            isErudaVisible = false;
            showNotification('Eruda Console Hidden', 'info');
        } else {
            window.eruda.show();
            isErudaVisible = true;
            showNotification('Eruda Console Shown', 'success');
        }
        
        updateButtonState();
    }

    /**
     * Monitor Eruda visibility changes
     */
    function monitorErudaVisibility() {
        if (!window.eruda) return;

        // Check for Eruda container visibility
        const checkVisibility = () => {
            const erudaContainer = document.querySelector('.eruda-container');
            if (erudaContainer) {
                const isVisible = erudaContainer.style.display !== 'none' && 
                                erudaContainer.offsetParent !== null;
                if (isVisible !== isErudaVisible) {
                    isErudaVisible = isVisible;
                    updateButtonState();
                }
            }
        };

        // Monitor visibility changes
        setInterval(checkVisibility, 1000);
        
        // Listen for Eruda events if available
        if (window.eruda.on) {
            window.eruda.on('show', () => {
                isErudaVisible = true;
                updateButtonState();
            });
            
            window.eruda.on('hide', () => {
                isErudaVisible = false;
                updateButtonState();
            });
        }
    }

    /**
     * Show loading state
     */
    function showLoadingState() {
        if (!floatingButton) return;
        
        floatingButton.style.backgroundColor = CONFIG.colors.warning;
        floatingButton.querySelector('.eruda-btn-text').textContent = 'Loading...';
        floatingButton.style.animation = 'pulse 1s infinite';
        
        // Add pulse animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Hide loading state
     */
    function hideLoadingState() {
        if (!floatingButton) return;
        
        floatingButton.style.animation = '';
    }

    /**
     * Show notification
     */
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'eruda-notification';
        notification.textContent = message;
        
        const colors = {
            success: CONFIG.colors.secondary,
            error: CONFIG.colors.danger,
            warning: CONFIG.colors.warning,
            info: CONFIG.colors.primary
        };
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: colors[type] || CONFIG.colors.primary,
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: '500',
            zIndex: CONFIG.zIndex + 10,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            transform: 'translateX(100%)',
            transition: `transform ${CONFIG.animationDuration} ease`,
            maxWidth: '300px',
            wordWrap: 'break-word'
        });
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Handle button click/touch
     */
    function handleButtonClick(event) {
        event.preventDefault();
        event.stopPropagation();
        
        // Prevent double-tap zoom on mobile
        if (CONFIG.isMobile) {
            event.preventDefault();
        }
        
        // Add click animation
        floatingButton.style.transform = 'scale(0.9)';
        setTimeout(() => {
            floatingButton.style.transform = 'scale(1)';
        }, 150);
        
        // Haptic feedback on supported devices
        if (navigator.vibrate && CONFIG.isMobile) {
            navigator.vibrate(50);
        }
        
        toggleEruda();
    }

    /**
     * Handle touch events for better mobile experience
     */
    function addTouchHandlers() {
        if (!floatingButton || !CONFIG.isMobile) return;

        let touchStartTime = 0;
        let touchMoved = false;

        floatingButton.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            touchMoved = false;
            floatingButton.style.transform = 'scale(0.95)';
        }, { passive: true });

        floatingButton.addEventListener('touchmove', (e) => {
            touchMoved = true;
        }, { passive: true });

        floatingButton.addEventListener('touchend', (e) => {
            const touchDuration = Date.now() - touchStartTime;
            
            // Reset scale
            floatingButton.style.transform = 'scale(1)';
            
            // Only trigger if it was a quick tap and didn't move much
            if (!touchMoved && touchDuration < 500) {
                handleButtonClick(e);
            }
        }, { passive: false });

        floatingButton.addEventListener('touchcancel', (e) => {
            floatingButton.style.transform = 'scale(1)';
        }, { passive: true });
    }

    /**
     * Initialize the floating button
     */
    function initializeFloatingButton() {
        // Remove existing button if present
        const existingButton = document.getElementById('eruda-floating-button');
        if (existingButton) {
            existingButton.remove();
        }

        // Create and setup button
        floatingButton = createFloatingButton();
        statusIndicator = createStatusIndicator();
        
        floatingButton.appendChild(statusIndicator);
        floatingButton.addEventListener('click', handleButtonClick);
        
        addHoverEffects();
        addTouchHandlers();
        updateButtonState();
        
        // Add to page
        document.body.appendChild(floatingButton);
        
        console.log('🎯 Eruda floating button initialized');
        
        // Show Android-specific welcome message
        if (CONFIG.isAndroid) {
            setTimeout(() => {
                showNotification('🔧 Tap the floating debug button to open Eruda Console!', 'info');
            }, 2000);
        }
        
        // Check if Eruda is already loaded
        if (window.eruda && window.eruda._isInit) {
            isErudaLoaded = true;
            isErudaVisible = !document.querySelector('.eruda-container') || 
                           document.querySelector('.eruda-container').style.display !== 'none';
            updateButtonState();
            monitorErudaVisibility();
        }
    }

    /**
     * Wait for DOM to be ready
     */
    function waitForDOM() {
        if (document.body) {
            initializeFloatingButton();
        } else if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeFloatingButton);
        } else {
            // DOM is ready but body might not be available yet
            setTimeout(waitForDOM, 10);
        }
    }

    /**
     * Handle page navigation (SPA support)
     */
    function handleNavigation() {
        // Re-initialize button after navigation
        setTimeout(() => {
            if (!document.getElementById('eruda-floating-button')) {
                initializeFloatingButton();
            }
        }, 1000);
    }

    // Listen for navigation changes (SPA support)
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            handleNavigation();
        }
    }).observe(document, { subtree: true, childList: true });

    // Initialize when DOM is ready
    waitForDOM();

    // Expose global functions for debugging
    window.erudaFloatingButton = {
        toggle: toggleEruda,
        show: () => {
            if (window.eruda && isErudaLoaded) {
                window.eruda.show();
                isErudaVisible = true;
                updateButtonState();
            } else {
                initializeEruda();
            }
        },
        hide: () => {
            if (window.eruda && isErudaLoaded) {
                window.eruda.hide();
                isErudaVisible = false;
                updateButtonState();
            }
        },
        reload: () => {
            isErudaLoaded = false;
            isErudaVisible = false;
            initializeEruda();
        },
        remove: () => {
            if (floatingButton) {
                floatingButton.remove();
                floatingButton = null;
                statusIndicator = null;
            }
        }
    };

    console.log('🔧 Eruda Floating Button script loaded successfully');
    console.log('💡 Use window.erudaFloatingButton.toggle() to control programmatically');

})();