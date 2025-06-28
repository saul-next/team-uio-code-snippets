function initBloomreachGA() {
  // Configuration: Customize for each experience
  const CONFIG = {
    TICKET_NUMBER: "YOUR_TICKET_NUMBER", // e.g., "4439259"
    TICKET_TITLE: "YOUR_TICKET_TITLE", // e.g., "Have You Thought About Links"
    COUNTRY_CODE: "YOUR_COUNTRY_CODE", // e.g., "UK", "IE", "UAE"
    PAGE_TYPE: "PDP", // e.g., "PDP", "PLP", "MA"
    IS_EXP: true, // true for EXP, false for CTRL
  };

  /**
   * Retrieves the device type from dataLayer or fallback.
   * @returns {string} The device type ('mobile', 'desktop', etc.) or 'Unknown'.
   */
  const getDeviceType = () => window.dataLayer[1].device_type || "Unknown";

  /**
   * Sets up GA tracking configuration.
   * @returns {Object} GA configuration object with category and baseLabel.
   */
  const setupGAConfig = () => {
    const deviceType = getDeviceType();
    const isMobile = deviceType === "mobile";
    const expLabel = CONFIG.IS_EXP ? "-EXP" : "-CTRL";
    const gaCategory = `UIO-${CONFIG.TICKET_NUMBER}-${
      isMobile ? "M" : "DT"
    }${expLabel}`;
    const baseLabel = `${CONFIG.PAGE_TYPE} | ${CONFIG.TICKET_TITLE} | ${CONFIG.COUNTRY_CODE}`;
    return { gaCategory, baseLabel };
  };

  /**
   * Tracks a GA event with the given category, action, and label.
   * @param {string} category - GA event category.
   * @param {string} action - GA event action (e.g., 'pageview', 'click').
   * @param {string} label - GA event label (without prefix).
   */
  const trackGAEvent = (category, action, label) => {
    const { baseLabel } = setupGAConfig();
    const fullLabel = `${baseLabel} | ${label}`;
    try {
      const trackFn =
        typeof GoogleAnalyticsNext.TrackGAEvent === "function"
          ? GoogleAnalyticsNext.TrackGAEvent
          : TrackGAEvent;
      if (!trackFn) throw new Error("GA tracking function not found");
      trackFn(category, action, fullLabel);
    } catch (err) {
      console.error(`GA Tracking Error: ${err.message}`);
    }
  };

  /**
   * Retrieves the product code from the DOM.
   * @returns {string} The product code or 'Unknown' if not found.
   */
  const getProductCode = () => {
    const pidElement = document.querySelector('[data-testid="product-code"]');
    return pidElement ? pidElement.innerText : "Unknown";
  };

  // Track initial Pageview
  const { gaCategory } = setupGAConfig();
  trackGAEvent(gaCategory, "pageview", "Pageview");

  // Track PID (product ID) changes for SPA pageviews
  let lastProductCode = getProductCode();
  const productObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const currentProductCodeElement = document.querySelector(
        '[data-testid="product-code"]'
      );
      if (!currentProductCodeElement) return;

      const currentProductCode =
        currentProductCodeElement.innerText || "Unknown";
      if (currentProductCode && currentProductCode !== lastProductCode) {
        trackGAEvent(
          gaCategory,
          "pageview",
          `Pageview | Product: ${currentProductCode}`
        );
        lastProductCode = currentProductCode;
      }
    });
  });

  productObserver.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  // Track ATB Clicked
  window.subjects["$ SHOPPING_BAG_ADD_CALLBACK"].subscribe(() => {
    trackGAEvent(
      gaCategory,
      "click",
      `ATB Clicked | Product: ${getProductCode()}`
    );
    // Optional: Add custom events triggered after ATB
  });

  // Example: Adding a custom button click event
  /*
      const customButton = document.querySelector('[data-testid="your-button-selector"]');
          if (customButton) {
              customButton.addEventListener('click', () => {
                  trackGAEvent(gaCategory, 'click', `Custom Button Clicked | Product: ${getProductCode()}`);
              });
          }
      */
}

initBloomreachGA();
