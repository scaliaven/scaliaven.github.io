// Stagger the highlight-sweep animation on bio <strong> tags.
// Sets --i on each element so CSS can compute: delay = 0.55s + i * 0.09s
document.querySelectorAll(".post article > .clearfix strong").forEach(function (el, i) {
  el.style.setProperty("--i", i);
});
