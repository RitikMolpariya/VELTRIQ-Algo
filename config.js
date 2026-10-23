/* Veltriq Capital website settings.
   Replace the example contact links below before publishing. Keep blank values as "" if unused. */
window.VELTRIQ_CONFIG = {
  brandName: "Veltriq Capital",
  whatsappUrl: "", // Example: https://wa.me/91XXXXXXXXXX
  email: "",       // Example: hello@yourdomain.com
  contactFormEndpoint: "", // Optional; configure only after implementing and testing a backend
  instagramUrl: "",
  telegramUrl: "",
  tradingViewUrl: "",
  products: {
    tradingview: {
      eyebrow: "TRADINGVIEW / CHARTING TOOLS",
      title: "TradingView Strategies & Indicators",
      description: "Charting tools and rule-based strategy concepts designed to help traders organize market structure, conditions, and trade planning.",
      bullets: ["Strategy and indicator concepts", "Market structure and signal visualization", "Documentation and setup guidance", "Backtest and forward-test before live use"]
    },
    mt5: {
      eyebrow: "METATRADER 5 / EXECUTION",
      title: "MT5 Expert Advisors",
      description: "Explore automation for trade execution and management. Exact behavior, broker compatibility, and supported order types must be confirmed for each EA.",
      bullets: ["Rule-driven order handling", "Protective stop-loss and take-profit workflows", "Demo-account testing and configuration", "Execution logs and diagnostics where supported"]
    },
    automation: {
      eyebrow: "ALGO AUTOMATION / INTEGRATIONS",
      title: "Trading Automation",
      description: "Connect signals and execution workflows with clear validation, status checks, and failure handling. Automation can fail; monitor every live integration.",
      bullets: ["TradingView alert workflow planning", "Webhook and execution-bridge concepts", "Connection and order-status checks", "Duplicate-alert and uncertain-outcome safeguards"]
    },
    management: {
      eyebrow: "TRADE OPERATIONS / RISK",
      title: "Risk & Trade Management",
      description: "Tools and operational workflows for monitoring positions, planning exposure, and making execution status easier to understand.",
      bullets: ["Position sizing and exposure planning", "Strategy-separated logs and statuses", "Error messages written for operators", "Recovery and reconciliation workflows"]
    }
  }
};
