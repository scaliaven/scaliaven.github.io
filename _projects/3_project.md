---
layout: page
title: Chemical Reaction Prediction
description: Course Project on Natural Language Processing
importance: 1
category: Coursework
img: assets/img/molecule.jpg
related_publications: true
---

This is the final project for the graduate level course Natural Language Processing with Representation Learning. The project is based on **Chemformer** {%cite Irwin_2022 %} and **LlasMol** {%cite yu2024llasmol %}. Instead of exploring the capacity of LLM in performing such task, we shifted our focus to the finetuning process of small LMs as well as dataset construction for training. The strong motive for this shifted goal/focus is because of the limited resources one may have in real-world scenarios. In this project, we first popose a data construction pipeline when time and chemical resources are rather limited. Then, we tried out various finetunning methods on a Bart-based pretrained small scale LM and acquire a good enough performance comparing to a full parameter finetunning. We tested our model on the dataset we constructed as well as the original dataset.

### [Report](/assets/pdf/NLP_final.pdf)

### [Repo](https://github.com/scaliaven/NLP_project)

### [Huggingface](https://huggingface.co/datasets/scaliaven/Ustop50k)
