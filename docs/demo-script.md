# FarmSense Demo Script

## 1. Opening: Problem and Motivation

"FarmSense solves a very practical agriculture problem: farmers and policymakers often do not know whether to sell today, store for a week, or move produce to a better mandi. That uncertainty creates post-harvest losses and unstable markets."

"Our system combines mandi price history with weather, arrivals, and production-side signals to generate short-term forecast guidance and market comparison insights."

## 2. Data and Feature Story

"We started with a cleaned AGMARKNET-style mandi dataset covering 1.85 million rows, 27 commodities, and more than 2,200 markets."

"On top of raw price history, we engineered three categories of features:"

- weather features such as rainfall, temperature, humidity, and a weather-shock index
- arrival features such as market activity and arrival pressure
- production features such as monthly supply index and harvest-window flags

"If real external files are available, the pipeline uses them. If not, it still runs today using structured proxy features so the model workflow remains operational."

## 3. Dashboard Walkthrough

"On the dashboard, we can choose a commodity and mandi, inspect the latest modal price, view a short-term forecast range, and see a recommendation for the best selling window."

"Below that, we compare nearby or high-value mandis for the same commodity so a farmer or policymaker can quickly understand which market looks stronger."

Suggested clicks during demo:

1. Open the dashboard.
2. Change the commodity.
3. Change the market.
4. Switch the forecast horizon between 7, 14, and 30 days.
5. Highlight the mandi comparison section.

## 4. Model Benchmark Story

"We also built a separate benchmark pipeline for SARIMAX and LSTM models with exogenous features."

"The benchmark writes holdout metrics, future forecast CSVs, and plots to the `artifacts/` folder. That gives us a reproducible way to compare classical time-series modeling against deep sequence models."

"At the moment, SARIMAX is the most reliable model overall on stable series. But in a more volatile potato market like Pehowa, Haryana, the LSTM improved on the naive baseline, which shows the architecture is ready to benefit from richer external signals."

## 5. Key Result to Highlight

"A good result to call out is the volatile-market case study for Potato in Pehowa, Haryana:"

- naive baseline MAE: 125.00
- LSTM MAE: 94.21
- LSTM MAPE: 10.64%

"That tells the judges we are not only building UI screens; we are actively benchmarking model quality on meaningful market conditions."

## 6. Honest Limitation and Next Step

"The biggest next step is to plug in real historical weather, official mandi arrival tonnage, and production estimates. The codebase is already structured for that, and we expect model quality to improve once those external signals are real rather than proxy-based."

## 7. Close

"FarmSense gives farmers and policymakers a path from guesswork to data-driven decision-making. The current MVP already works end-to-end, and the modeling stack is ready to grow as richer external agricultural data is added."
