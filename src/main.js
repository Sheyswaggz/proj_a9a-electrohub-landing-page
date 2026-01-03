/**
 * Main JavaScript Entry Point
 * 
 * ES module entry point that imports main CSS and sets up basic app initialization.
 * Provides structured logging and initialization verification.
 * 
 * @module main
 * @generated-from task-id:TASK-002 sprint:current
 * @modifies index.html:v1.0.0
 * @dependencies ["src/styles/main.css"]
 */

// Import main CSS for Tailwind and global styles
import './styles/main.css';

/**
 * Application initialization state
 * @typedef {Object} AppState
 * @property {boolean} initialized - Whether app has been initialized
 * @property {number} timestamp - Initialization timestamp
 * @property {string} environment - Current environment
 */

/**
 * Logger utility for structured logging
 */
const logger = {
  /**
   * Log info message with structured context
   * @param {string} message - Log message
   * @param {Object} [context={}] - Additional context
   */
  info(message, context = {}) {
    console.log(
      JSON.stringify({
        level: 'info',
        timestamp: new Date().toISOString(),
        message,
        ...context,
      })
    );
  },

  /**
   * Log error message with structured context
   * @param {string} message - Error message
   * @param {Error} [error] - Error object
   * @param {Object} [context={}] - Additional context
   */
  error(message, error, context = {}) {
    console.error(
      JSON.stringify({
        level: 'error',
        timestamp: new Date().toISOString(),
        message,
        error: error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : undefined,
        ...context,
      })
    );
  },

  /**
   * Log warning message with structured context
   * @param {string} message - Warning message
   * @param {Object} [context={}] - Additional context
   */
  warn(message, context = {}) {
    console.warn(
      JSON.stringify({
        level: 'warn',
        timestamp: new Date().toISOString(),
        message,
        ...context,
      })
    );
  },
};

/**
 * Application state
 * @type {AppState}
 */
const appState = {
  initialized: false,
  timestamp: 0,
  environment: import.meta.env.MODE || 'production',
};

/**
 * Initialize application
 * Sets up basic app configuration and verifies DOM readiness
 * 
 * @returns {Promise<void>}
 * @throws {Error} If initialization fails
 */
async function initializeApp() {
  try {
    const startTime = performance.now();

    logger.info('ElectroHub application initializing', {
      environment: appState.environment,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    });

    // Verify critical DOM elements exist
    const criticalElements = ['header', 'main', 'footer'];
    const missingElements = criticalElements.filter(
      (selector) => !document.querySelector(selector)
    );

    if (missingElements.length > 0) {
      throw new Error(
        `Critical DOM elements missing: ${missingElements.join(', ')}`
      );
    }

    // Mark app as initialized
    appState.initialized = true;
    appState.timestamp = Date.now();

    const endTime = performance.now();
    const initDuration = endTime - startTime;

    logger.info('ElectroHub application initialized successfully', {
      duration: `${initDuration.toFixed(2)}ms`,
      timestamp: appState.timestamp,
      readyState: document.readyState,
    });

    // Dispatch custom event for other modules to hook into
    window.dispatchEvent(
      new CustomEvent('app:initialized', {
        detail: {
          timestamp: appState.timestamp,
          duration: initDuration,
        },
      })
    );
  } catch (error) {
    logger.error('Application initialization failed', error, {
      state: appState,
    });
    throw error;
  }
}

/**
 * Handle DOM content loaded event
 * Ensures initialization happens after DOM is ready
 */
function handleDOMContentLoaded() {
  logger.info('DOM content loaded', {
    readyState: document.readyState,
  });

  initializeApp().catch((error) => {
    logger.error('Failed to initialize app after DOM ready', error);
  });
}

/**
 * Handle page load event
 * Logs when all resources are fully loaded
 */
function handlePageLoad() {
  logger.info('Page fully loaded', {
    readyState: document.readyState,
    performance: {
      navigation: performance.getEntriesByType('navigation')[0]?.toJSON(),
      timing: {
        domContentLoaded:
          performance.timing.domContentLoadedEventEnd -
          performance.timing.navigationStart,
        load:
          performance.timing.loadEventEnd - performance.timing.navigationStart,
      },
    },
  });
}

/**
 * Handle unhandled errors
 * Provides global error boundary for uncaught errors
 * 
 * @param {ErrorEvent} event - Error event
 */
function handleError(event) {
  logger.error('Unhandled error', event.error, {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
}

/**
 * Handle unhandled promise rejections
 * Provides global error boundary for unhandled promise rejections
 * 
 * @param {PromiseRejectionEvent} event - Promise rejection event
 */
function handleUnhandledRejection(event) {
  logger.error('Unhandled promise rejection', event.reason, {
    promise: event.promise,
  });
}

// Set up event listeners
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
} else {
  // DOM already loaded, initialize immediately
  initializeApp().catch((error) => {
    logger.error('Failed to initialize app', error);
  });
}

window.addEventListener('load', handlePageLoad);
window.addEventListener('error', handleError);
window.addEventListener('unhandledrejection', handleUnhandledRejection);

// Log initial script load
logger.info('Main JavaScript module loaded', {
  environment: appState.environment,
  timestamp: Date.now(),
});

// Export for testing and module access
export { appState, logger, initializeApp };