# FIXD — Fixed Income Credit Analytics Terminal

A comprehensive web-based platform for fixed income analytics, credit risk assessment, and portfolio management.

🔗 **[Live Demo](https://fixd-terminal.vercel.app)** *(Deploy to get your actual URL)*

---

## Features

### Bond Analytics
- **Bond Pricing Calculator** — Calculate price, yield, duration, and convexity
- **Live Treasury Yield Curve** — Real-time visualization of the US Treasury curve
- **Credit Risk Scoring** — Proprietary credit scoring engine with explainability metrics

### Portfolio Management
- **Portfolio Risk Analysis** — Duration, DV01, and convexity aggregation
- **Scenario Modeling** — Stress testing across rate shocks and spread widening
- **Sector Exposure** — Industry and rating distribution analytics

### AI-Powered Analysis
- **Credit Memo Generation** — AI-powered fundamental credit analysis using Claude API
- Automated investment recommendations
- Risk factor identification

---

## Tech Stack

- **Frontend:** React 18, modern hooks-based architecture
- **Data Visualization:** Recharts for interactive charts and graphs
- **Build Tool:** Vite for fast development and optimized production builds
- **Styling:** Custom CSS with professional dark theme
- **Deployment:** Vercel with serverless functions
- **AI Integration:** Anthropic Claude API for credit analysis

---

## Project Structure

```
fixd-terminal/
├── src/
│   ├── App.jsx          # Main application component
│   └── main.jsx         # React entry point
├── api/
│   └── memo.js          # Serverless function for AI credit memos
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
└── vercel.json          # Vercel routing configuration
```

---

## Features in Detail

### Bond Pricing Engine
- Calculates clean and dirty price
- Computes Macaulay and Modified duration
- Calculates convexity for interest rate sensitivity
- Supports various coupon frequencies

### Credit Risk Scoring
- Multi-factor credit analysis
- Leverage, profitability, and liquidity metrics
- Industry-adjusted scoring
- Explainability dashboard showing factor contributions

### Portfolio Analytics
- Aggregate portfolio statistics
- Weighted average duration and yield
- Risk concentration analysis
- Scenario stress testing

---

## Built By

**Amadou Bah**  
Economics Student @ York University  
[GitHub](https://github.com/Amadoubbah) • [LinkedIn](https://www.linkedin.com/in/amadou-bah-b43284218/)

---

## Purpose

This project was developed to:
- Demonstrate understanding of fixed income markets and credit analysis
- Showcase full-stack development capabilities
- Apply economic and financial theory to practical tools
- Build familiarity with modern web technologies

Built as part of my transition from molecular biology to economics and finance, combining quantitative analysis with software development.

---

## License

MIT License - feel free to use and modify for learning purposes.

---

## Notes

- The AI credit memo feature requires an Anthropic API key
- Treasury yield curve data is simulated for demo purposes
- Not intended for actual investment decisions — educational tool only

---

**Questions or feedback?** Open an issue or reach out via LinkedIn.
