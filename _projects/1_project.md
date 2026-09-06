---
layout: page
title: YouTube View Forecasting
description: Predicting 30-day view counts from what happens on screen, cutting error 26.5% below a views-only baseline
importance: 1
category: Research
img: assets/img/video.jpg
github: https://github.com/scaliaven/Durf_2023
related_publications: false
---

Summer research at NYU Shanghai in 2023, advised by Prof. Xianbin Gu and supported by the Dean's Undergraduate Research Fund (DURF). The work was written up as _Integrating High-Level Visual Features for YouTube View Forecasting: A Neural Network-Based Approach_.

### The task and the metric

Given a video's daily view counts over its first few days, predict its total views on day 30.

Early views alone get you a long way, and most prior work is built on exactly that signal — Szabo and Huberman showed future popularity can be extrapolated from early counts with a single fitted factor. But early counts describe what has happened to a video, not anything about the video. Two clips with near-identical first weeks can end up far apart, and the difference has to come from somewhere.

How you score this matters as much as how you predict it. View counts span orders of magnitude, so mean squared error is dominated by whatever the largest video in the batch happens to be. We used relative squared error instead, which divides the prediction by the truth before squaring:

RSE = (N̂(v, t_r, t_t) / N(v, t_t) − 1)²

A video that is off by a factor of two costs the same whether it has a thousand views or a million. Averaged over a collection this gives mRSE, which is both the reported metric and the training loss — not MSE.

### Turning video into a sequence of actions

For content features we ran each video through [SlowFast](https://arxiv.org/abs/1812.03982), an action-recognition network with two pathways over the same clip. The slow pathway samples frames sparsely and carries most of the capacity, so it picks up spatial semantics; the fast pathway samples densely but stays narrow, so it picks up motion cheaply. Lateral connections fuse them.

We used it off the shelf, on the [Kinetics-400](https://arxiv.org/abs/1705.06950) pretrained checkpoint, adjusting only the frame rate. Its output per video is not a single label but a chronological array of action labels, one per segment of frames, drawn from the 400-label Kinetics vocabulary. That sequence is the raw material for everything downstream, and the question becomes how to represent it.

### Two ways to represent the actions

**Bag-of-words.** Count how often each of the 400 labels appears, giving a fixed 400-dimensional vector regardless of video length. Most videos contain only a handful of distinct actions, so these vectors are very sparse; we compressed them with PCA and kept the leading components. Simple and stable, but it throws away the order in which things happen.

**BERT embeddings.** Order and context are exactly what a bag of words discards, so the second variant feeds the label sequence to [BERT](https://arxiv.org/abs/1810.04805) instead. Self-attention relates labels to each other and positional embeddings encode where in the video each one occurred, so the representation carries what happened, in what order, and in what context. We took the last hidden layer and average-pooled across the embedding dimension, which collapses each token to a scalar while preserving sequence length — keeping the chronology and still producing a one-dimensional vector that concatenates cleanly with the view features.

### The predictor

Both variants share a backbone: an MLP with four hidden layers and sigmoid nonlinearities, with an identity output producing a single scalar. Input is the first `t_r` days of view counts concatenated with the visual representation, which passes through its own fully connected header first so the two modalities are processed separately before they meet. Training used a 3:1 split, up to 3000 epochs at batch size 32, AdamW at learning rate 0.001 with weight decay 0.01 and a linear schedule.

### Data

We used the YouTube dataset collected by Figueiredo, Benevenuto and Almeida, restricted to its <a href="https://doi.org/10.1145/1935826.1935925">Top</a> subset, and dropped videos that were no longer available, had incomplete records, or had fewer than 100 views on the target day.

Crane and Sornette showed that YouTube videos follow <a href="https://doi.org/10.1073/pnas.0803685105">a few distinct popularity shapes</a> — viral, quality, junk and memoryless — and that training one model per shape beats training a single general model. We applied their classifier and kept three subsets: Viral (270 videos), Quality (571) and Junk (620). Memoryless had too few videos to train and test on, so it was dropped.

### Results

Both variants beat the views-only MLP on every subset and every reference day, against baselines including <a href="https://doi.org/10.1145/2433396.2433443">MRBF</a> and PMRBFV. Averaged mRSE reduction over that baseline:

| Reference days | Bag-of-words | BERT embedding |
| -------------- | ------------ | -------------- |
| 1              | 20.7%        | 19.2%          |
| 2              | 25.6%        | 29.9%          |
| 3              | 26.0%        | 30.2%          |
| 4              | 26.0%        | 30.8%          |
| 5              | 22.4%        | 26.0%          |
| 7              | 19.1%        | 23.6%          |
| **Mean**       | **22.9%**    | **26.5%**      |

Three things stand out. The gain peaks between days 2 and 4, where both variants clear 25% — early enough that view history is still thin, late enough that there is something to condition on. The BERT variant beats bag-of-words by 3.6% on average, which is the case for keeping chronological and semantic structure rather than only counting actions. And training per trend subset beats training on the whole Top set, more so the fewer reference days you have: on the Viral subset at day 7, mRSE falls from 0.2277 for views-only to 0.0995 with BERT embeddings.

### Limitations

The dataset was collected years before this work, and many of its videos are gone from YouTube, which caps how large the usable set can be. A newer and larger collection is the obvious next step, along with richer semantic features from stronger video analyzers.

---

- **Paper** — [Integrating High-Level Visual Features for YouTube View Forecasting](/assets/pdf/youtube_view_forecasting.pdf)
- **Code** — [scaliaven/Durf_2023](https://github.com/scaliaven/Durf_2023), a modified [PySlowFast](https://github.com/facebookresearch/SlowFast) tree covering the feature-extraction half of the pipeline
