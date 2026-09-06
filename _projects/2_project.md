---
layout: page
title: Music Classification from Spectrograms
description: "Treating vocal spectrograms as greyscale images: an ensemble that reached 83.04% test accuracy"
importance: 2
category: Coursework
img: assets/img/audio.jpg
github: https://github.com/scaliaven/ML_contest
related_publications: false
---

### The task

This was the final project for my Machine Learning course, run as a Kaggle-style class competition on music audio classification: given short clips of music, predict the label of each clip. Submissions were scored on a held-out test set of songs the model had never heard.

### Audio as images

The decision that shaped everything else was to stop treating this as an audio problem.

I ran each track through [Spleeter](https://github.com/deezer/spleeter) to separate it into vocal and instrumental stems and kept the vocal stem. [Librosa](https://librosa.org/) then turned that stem into a `[128, 130]` tensor carrying frequency against time. I sliced it to `[128, 128]` and reshaped it to `[1, 128, 128]` — which is exactly the shape of a single-channel greyscale image.

Once the data is in that form, the entire image-classification toolbox is available. Greyscale also turned out to be the better representation on its own merits, outperforming the RGB variants I tried.

### Architectures, and one change to the first layer

I tried ResNet18, [ResNeXt50 and ResNeXt101](https://arxiv.org/abs/1611.05431), [DenseNet201](https://arxiv.org/abs/1608.06993), an LSTM, [Shake-Shake](https://arxiv.org/abs/1705.07485) ResNet26, Shake-Shake ResNeXt, and a ResNet variant with attention modules. The ResNet backbones and a good deal of the training code came from my earlier [CIFAR-10 classification with ResNet](https://scaliaven.github.io/blog/2025/cifar/) write-up.

One modification mattered more than the choice among them. torchvision's ResNets open with a 7×7 convolution at stride 2 and padding 3, followed by a 3×3 max-pool at stride 2. That opening is sized for 224×224 photographs, where discarding resolution immediately is cheap. My inputs were already only 128×128, so the same stack throws away far too much before the network has done any work. I changed the first convolution to 3×3 with stride 1 and padding 1, and neutralised the max-pool with kernel size 1, stride 1 and padding 0 — the layer stays where it is but no longer downsamples.

### Training

I checkpointed on the best validation accuracy and used that checkpoint for test predictions.

For the learning rate I started with [cosine annealing with warm restarts](https://arxiv.org/abs/1608.03983), setting a cycle to roughly the number of iterations the model needed to converge, so that each restart could settle into a different local optimum and I could keep the best one. In practice I dropped the extra restarts from the final runs: they were expensive, and a higher validation accuracy did not reliably translate into a higher test accuracy. Plain cosine annealing stayed.

For augmentation I applied [SpecAugment](https://arxiv.org/abs/1904.08779) time and frequency masking inside each batch, so the masking varies from batch to batch, and [mixup](https://arxiv.org/abs/1710.09412) for the first half of training only, switching to plain cross-entropy for the second half — prolonged mixup is believed to hurt generalisation to new data, and the split schedule helped deeper models such as DenseNet201. Together, mixup and SpecAugment were worth roughly 2% accuracy.

### Ensembling

Different architectures should latch onto different features of the same input, so I trained models independently, summed their output probabilities and took the argmax. The best combination was a ResNeXt50 together with a DenseNet201, and that was my final submission: **83.04% accuracy on the test set**.

I also tried learning the combination instead of summing it, with a meta-model of a single convolution layer followed by batch normalisation. It overfit quickly and test accuracy dropped slightly. Unweighted summing was simply better.

Every model here trains on an RTX 8000, though the deeper ones would be happier on an A100, H100 or A800. Thanks to NYU Greene HPC and NYUSH HPC for the resources.

### What I would do differently

My validation split was optimistic. The dataset was built by splitting songs into train and test sets first and only then slicing them into three-second snippets, so my training and validation splits contained snippets of the same songs while the test set contained none. Validation was measuring an easier problem than the leaderboard was, and K-fold cross-validation would have been the right choice.

I also started implementations of a GAN and an autoencoder to synthesise extra training data — the autoencoder to reconstruct clips sharing a label — and finished neither.

---

- **Full report:** [ML_project.pdf](/assets/pdf/ML_project.pdf)
- **Code:** [scaliaven/ML_contest](https://github.com/scaliaven/ML_contest)
