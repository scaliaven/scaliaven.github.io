---
layout: about
title: about
permalink: /
splash: true
subtitle: <a href='https://www.ri.cmu.edu/'>CMU Robotics Institute</a> · MSR · <a href='https://rchi-lab.github.io/'>RCHI Lab</a> · previously <a href='https://shanghai.nyu.edu/'>NYU Shanghai</a>

profile:
  align: right
  image: prof_pic.jpg
  image_compare: prof_pic_color.png
  image_circular: false
  more_info: >
    <p>Robotics Institute, Carnegie Mellon</p>
    <p>RCHI Lab</p>
    <p>Contact: hongjiah@andrew.cmu.edu</p>
    <p>Secondary: hh3043@nyu.edu</p>

selected_papers: false
social: true

announcements:
  enabled: true
  scrollable: true
  limit: 5

latest_posts:
  enabled: true
  scrollable: true
  limit: 3

images:
  compare: true
  slider: false
---

My name is 黄泓嘉 (Hongjia Huang), also known as Alex. I am a master's student in the [MSR program](https://www.ri.cmu.edu/education/academic-programs/master-of-science-robotics/) at [Carnegie Mellon's Robotics Institute](https://www.ri.cmu.edu/), working with Professor [Zackory Erickson](https://zackory.com/) in the [Robotic Caregiving and Human Interaction (RCHI) Lab](https://rchi-lab.github.io/) on **manipulation policies a person can steer**: how someone's intent reaches a learned policy at the moments that matter, and what supplying it costs them. Before CMU I completed my B.S. in **Computer Science** and **Mathematics** at [New York University Shanghai](https://shanghai.nyu.edu/), graduating summa cum laude (GPA 3.93/4.0).

What connects that to the rest of my work is an interest in AI systems that are **physically grounded** — models that understand, simulate, and reason about the world as it actually works, from molecular dynamics to robot manipulation. Pixels are what we record, but 3D structure and motion are what transfer across embodiments, viewpoints, and scenes, so I look for physical constraints — from atomic-scale interactions to macroscopic motion — that can act as inductive biases for representations that are stable, interpretable, and generalizable.

**Structure a policy can act on.** Most of my research asks what a policy should reason over, if not pixels. With [Professor Furong Huang](https://furong-huang.com/) at [UMD](https://www.umiacs.umd.edu/) I work on world models in a compact 3D trace-space of scene-level trajectories, so that motion can be predicted geometrically and learned from cross-embodiment, cross-environment video; with Professor Huang and [Professor Tianyi Zhou](https://tianyizhou.github.io/), on physics-informed vision-language-action models that fold trajectory planning into the action-prediction objective. With [Professor Shengjie Wang](https://sheng-jie-wang.github.io/) at NYU Shanghai I put the same question to video diffusion: what training-time auxiliary structure buys a frozen video-diffusion world-action model, particularly for spatial out-of-distribution generalization.

**Physics at the smallest scale.** The same instinct led me to molecular force fields, where the physics is explicit and the data is expensive. With Professor Wang and Professor Zhou I work on training graph neural networks for force prediction efficiently — using submodular selection to decide which conformations are worth recomputing at high precision, and geometry-aware latent representations to define what makes a set of them diverse.

My interest in physics traces back to competing in the [Chinese Physics Olympiad (CPhO)](https://physoly.tech/resources/) in high school, which first made me think seriously about how to model the real world computationally.
