---
publish: true
title: Credit Risk Analysis, Prediction & RAG Assistant
shortTitle: Credit Risk RAG
graphLabel: Credit Risk RAG
group: project
order: 1
slug: credit-risk-rag
metric: 30k+ Loan Records • Basel Grades (A–F)
role: Predictive Modeling • RAG • FastAPI
accent: "#f59e0b"
tags: [FastAPI, React, Llama 3.2, ChromaDB, LangChain, CatBoost, Scikit-learn]
githubUrl: https://github.com/heangdeniss/creditAnalysisAsistantChatbot
demoUrl: https://github.com/heangdeniss/creditAnalysisAsistantChatbot
images: [creditrisk_pred.jpg, creditrisk_rag.jpg]
related:
  - Profile
  - Motion System
---

## Summary

Trained gradient-boosted CatBoost and Neural Network classifiers on 30,000+ financial records to forecast probability of default (PD) categorized into Basel-compliant risk ratings. Integrated a conversational Llama 3.2 RAG agent backed by LangChain and ChromaDB with Whisper speech-to-text, deployed via a high-throughput FastAPI and React platform.

## Architecture

- 30k+ Financial Records
- Imputation & Outlier Winsorization
- CatBoost & Neural Net (PD)
- Basel Risk Mapping (A–F)
- Whisper STT + ChromaDB Retrieval
- Llama 3.2 + FastAPI Serving

## Formula

**Logistic Probability of Default (PD) & Basel Expected Loss**

```
PD = σ(w^T x + b) = 1 / (1 + e^{-(w^T x + b)})  |  EL = PD × LGD × EAD
```

## Details

Calculated loan risk grades aligned with Basel II/III regulatory standards. The RAG module embeds financial documents with semantic chunking, queried via cosine similarity top-k search in ChromaDB.
