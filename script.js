document.addEventListener("DOMContentLoaded", () => {
  const select = document.getElementById("easing-select");
  const durationInput = document.getElementById("duration");
  const durationVal = document.getElementById("duration-val");
  const playBtn = document.getElementById("play-btn");
  const ball = document.getElementById("ball");
  const copyBtn = document.getElementById("copy-btn");
  const cssCode = document.getElementById("css-code");
  const ctx = document.getElementById("graph").getContext("2d");

  let chart,
    duration = 1000,
    currentEasing = "easeOutBack";

  const easings = {
    linear: (t) => t,
    easeInSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
    easeOutSine: (t) => Math.sin((t * Math.PI) / 2),
    easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => 1 - (1 - t) ** 2,
    easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2),
    easeInCubic: (t) => t ** 3,
    easeOutCubic: (t) => 1 - (1 - t) ** 3,
    easeInOutCubic: (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2),
    easeInBack: (t) => 2.70158 * t ** 3 - 1.70158 * t * t,
    easeOutBack: (t) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2,
    easeInOutBack: (t) =>
      t < 0.5
        ? ((2 * t) ** 2 * (3.59491 * 2 * t - 2.59491)) / 2
        : ((2 * t - 2) ** 2 * (3.59491 * (t * 2 - 2) + 2.59491) + 2) / 2,
    easeOutBounce: (t) => {
      if (t < 1 / 2.75) return 7.5625 * t * t;
      if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
      if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    },
  };

  const bezierMap = {
    linear: [0, 0, 1, 1],
    easeInSine: [0.12, 0, 0.39, 0],
    easeOutSine: [0.61, 1, 0.88, 1],
    easeInOutSine: [0.37, 0, 0.63, 1],
    easeInQuad: [0.11, 0, 0.5, 0],
    easeOutQuad: [0.5, 1, 0.89, 1],
    easeInOutQuad: [0.45, 0, 0.55, 1],
    easeInCubic: [0.32, 0, 0.67, 0],
    easeOutCubic: [0.33, 1, 0.68, 1],
    easeInOutCubic: [0.65, 0, 0.35, 1],
    easeInBack: [0.36, 0, 0.66, -0.56],
    easeOutBack: [0.34, 1.56, 0.64, 1],
    easeInOutBack: [0.68, -0.6, 0.32, 1.6],
  };

  function updateChart() {
    const labels = [],
      data = [];
    for (let i = 0; i <= 100; i++) {
      labels.push((i / 100).toFixed(2));
      data.push(easings[currentEasing](i / 100));
    }

    if (chart) {
      chart.data.labels = labels;
      chart.data.datasets[0].data = data;
      chart.data.datasets[0].label = currentEasing;
      chart.update();
    } else {
      chart = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: currentEasing,
              data,
              borderColor: "#3498db",
              borderWidth: 3,
              pointRadius: 0,
              tension: 0.1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            x: { title: { display: true, text: "Time" } },
            y: { title: { display: true, text: "Progress" } },
          },
        },
      });
    }
  }

  function updateCode() {
    const b = bezierMap[currentEasing];
    if (b) {
      cssCode.textContent = `.element {\n  transition: transform ${duration}ms cubic-bezier(${b.join(", ")});\n}\n\n.element:hover {\n  transform: translateX(100px);\n}`;
    } else if (currentEasing === "easeOutBounce") {
      cssCode.textContent = `@keyframes bounceOut {
  0% { transform: translateX(0); }
  36.36% { transform: translateX(100px); }
  54.54% { transform: translateX(75px); }
  72.72% { transform: translateX(100px); }
  81.81% { transform: translateX(93.75px); }
  90.90% { transform: translateX(100px); }
  95.45% { transform: translateX(98.4375px); }
  100% { transform: translateX(100px); }
}

.element {
  animation: bounceOut ${duration}ms forwards;
}`;
    } else {
      cssCode.textContent = `/* ${currentEasing} needs keyframes or JS */`;
    }
  }

  function playAnimation() {
    const trackWidth = ball.parentElement.offsetWidth - ball.offsetWidth;
    const start = performance.now();
    ball.style.left = "0";
    (function animate(time) {
      const t = Math.min((time - start) / duration, 1);
      ball.style.left = easings[currentEasing](t) * trackWidth + "px";
      if (t < 1) requestAnimationFrame(animate);
    })(start);
  }

  select.onchange = (e) => {
    currentEasing = e.target.value;
    updateChart();
    updateCode();
  };
  durationInput.oninput = () => {
    duration = +durationInput.value;
    durationVal.textContent = duration;
    updateCode();
  };
  playBtn.onclick = playAnimation;
  copyBtn.onclick = async () => {
    await navigator.clipboard.writeText(cssCode.textContent);
    copyBtn.textContent = "Copied!";
    copyBtn.classList.add("copied");
    setTimeout(() => {
      copyBtn.textContent = "Copy";
      copyBtn.classList.remove("copied");
    }, 2000);
  };

  updateChart();
  updateCode();
});
