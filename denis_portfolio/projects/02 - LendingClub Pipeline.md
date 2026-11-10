---
publish: true
title: LendingClub Big Data Pipeline & Default Prediction
shortTitle: LendingClub Pipeline
graphLabel: LendingClub Pipeline
group: project
order: 2
slug: lendingclub-pipeline
metric: Columnar Parquet • ROC-AUC Optimization
role: Big Data • DuckDB • XGBoost
accent: "#10b981"
tags: [DuckDB, Python, XGBoost, TensorFlow, Pandas, NumPy, hvPlot]
githubUrl: https://github.com/heangdeniss/LendingLoanClubDataAnalysis
demoUrl: https://github.com/heangdeniss/LendingLoanClubDataAnalysis
images: [LLC_AUC.png, LLC_importance_feature.png, LLC_bi_1_(1).png, LLC_bi_1_(2).png, LLC_bi_1_(3).png]
related:
  - Profile
---

## Summary

Converted massive multi-CSV loan datasets into high-performance columnar Parquet using DuckDB, drastically reducing memory overhead for exploratory analysis and feature engineering. Benchmarked hyperparameter-tuned XGBoost, Random Forest, and TensorFlow ANN architectures with RandomizedSearchCV, optimizing for maximum ROC-AUC discrimination.

## Architecture

- Multi-CSV Raw Datasets
- DuckDB Ingestion Engine
- Columnar Parquet Compression
- Vectorized Feature Engineering
- RandomizedSearchCV Tuning
- XGBoost & TensorFlow ANN
- ROC-AUC Evaluation

## Formula

**DuckDB Columnar Query & ROC-AUC Discrimination**

```
ROC-AUC = ∫₀¹ TPR(FPR⁻¹(t)) dt  |  Memory Reduction: > 70%
```

## Details

Transformed tabular schemas into partitioned Parquet format, accelerating filtering and aggregations across millions of data points while preventing out-of-memory crashes on exploratory notebooks.
