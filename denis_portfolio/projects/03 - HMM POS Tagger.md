---
publish: true
title: HMM Part-of-Speech Tagger & Text Segmentation (PGM)
shortTitle: HMM POS Tagger
graphLabel: HMM POS Tagger
group: project
order: 3
slug: hmm-pos-tagger
metric: 96.05% Accuracy • 232k+ Tokens Processed
role: Probabilistic Models • NLP • HMM
accent: "#8b5cf6"
tags: [Python, Probabilistic Graphical Models, HMM, Viterbi Algorithm, NLP, NLTK]
githubUrl: https://github.com/heangdeniss/HMM-Text_Segmentation
demoUrl: https://heangdeniss.github.io/HMM-Text_Segmentation/
images: [hmm_live_demo.jpg, hmm_methodology.jpg, hmm_results.jpg]
related:
  - Profile
---

## Summary

Formulated a first-principles Hidden Markov Model (HMM) with log-space Viterbi dynamic programming to overcome numerical underflow on sequence labeling across 232,000+ Brown Corpus tokens. Engineered Laplace smoothing with grid-search cross-validation (α = 10⁻⁹), achieving 96.05% test accuracy across 12 Universal POS categories.

## Architecture

- Brown Corpus (232k Tokens)
- Bi-Gram Transition Matrix A
- Emission Likelihood Matrix B
- Laplace Smoothing (α = 10⁻⁹)
- Log-Space Viterbi Trellis
- Backtracking Optimal Path
- 96.05% Evaluation

## Formula

**Log-Space Viterbi Recursion & Laplace Smoother**

```
v_t(j) = max_i [ v_{t-1}(i) + ln A_{ij} ] + ln B_j(o_t)  |  P(w|t) = (C(t, w) + α) / (C(t) + α|V|)
```

## Details

Formulating dynamic programming in logarithmic space converts probability multiplications into additions, eliminating underflow on long sentences exceeding 50+ tokens with O(T · |S|²) computational complexity.
