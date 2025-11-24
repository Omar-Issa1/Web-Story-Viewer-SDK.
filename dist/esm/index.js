class MiniStory extends HTMLElement {
  static get observedAttributes() {
    return ["config", "interval", "autoplay"];
  }
  constructor() {
    super();
    this.images = [];
    this.index = 0;
    this.interval = 3000;
    this.timer = null;
    this.autoplay = true;
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        :host{display:block;position:relative;overflow:hidden;user-select:none;border-radius:8px;}
        img{width:100%;height:100%;object-fit:cover;display:block;}
        .progress{position:absolute;bottom:0;left:0;height:4px;background:rgba(255,255,255,0.8);transition:width linear;}
      </style>
      <img/>
      <div class="progress"></div>
    `;
    this.imgEl = shadow.querySelector("img");
    this.progressEl = shadow.querySelector(".progress");
  }
  connectedCallback() {
    this.readAttributes();
    this.show();
    if (this.autoplay) this.startAuto();
    this.enableClickNavigation();
    this.enableSwipeNavigation();
  }
  disconnectedCallback() {
    if (this.timer) window.clearInterval(this.timer);
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "config" && newValue) {
      this.readAttributes();
      this.show();
    }
    if (name === "interval" && newValue) {
      const v = Number(newValue);
      if (!Number.isNaN(v) && v > 0) this.interval = v;
      if (this.timer) {
        window.clearInterval(this.timer);
        this.startAuto();
      }
    }
    if (name === "autoplay") {
      this.autoplay = newValue !== "false";
      if (this.autoplay) this.startAuto();
      else if (this.timer) {
        window.clearInterval(this.timer);
        this.timer = null;
      }
    }
  }
  readAttributes() {
    var _a, _b;
    const cfg = this.getAttribute("config");
    if (cfg) {
      try {
        const json = JSON.parse(cfg);
        this.images = json.images || this.images;
        this.interval =
          (_a = json.interval) !== null && _a !== void 0 ? _a : this.interval;
        this.autoplay =
          (_b = json.autoplay) !== null && _b !== void 0 ? _b : this.autoplay;
      } catch (e) {
        const imgs = this.getAttribute("images");
        if (imgs)
          this.images = imgs
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
      }
    } else {
      const imgs = this.getAttribute("images");
      if (imgs)
        this.images = imgs
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      const iv = this.getAttribute("interval");
      if (iv) this.interval = Number(iv) || this.interval;
      const ap = this.getAttribute("autoplay");
      if (ap !== null) this.autoplay = ap !== "false";
    }
  }
  startAuto() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.next(), this.interval);
  }

  show() {
    // أوقف أي مؤقت سابق
    if (this.timer) clearTimeout(this.timer);

    // إعادة ضبط الأنيميشن بالكامل
    this.progressEl.style.transition = "none";
    this.progressEl.style.width = "0%";
    void this.progressEl.offsetWidth;

    // ابدأ transition نظيف 100%
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.progressEl.style.transition = `width ${this.interval}ms linear`;
        this.progressEl.style.width = "100%";

        // ابدأ توقيت الصورة بعد بداية transition فعليًا
        if (this.autoplay) {
          this.timer = setTimeout(() => this.next(), this.interval);
        }
      });
    });

    this.preloadNeighbors();
  }

  next() {
    this.index++;
    const completed = this.index >= this.images.length;
    if (completed) {
      this.dispatchEvent(new CustomEvent("story-complete", { bubbles: true }));
      this.index = 0;
    } else {
      this.dispatchEvent(
        new CustomEvent("story-next", {
          detail: { index: this.index },
          bubbles: true,
        })
      );
    }
    this.show();
  }
  prev() {
    this.index = Math.max(0, this.index - 1);
    this.dispatchEvent(
      new CustomEvent("story-prev", {
        detail: { index: this.index },
        bubbles: true,
      })
    );
    this.show();
  }
  goTo(i) {
    if (i >= 0 && i < this.images.length) {
      this.index = i;
      this.show();
    }
  }
  // click navigation (left/right)
  enableClickNavigation() {
    this.addEventListener("click", (e) => {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      if (x > rect.width / 2) this.next();
      else this.prev();
    });
  }
  // simple touch swipe navigation
  enableSwipeNavigation() {
    let startX = 0;
    this.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
    });
    this.addEventListener("touchend", (e) => {
      const endX = e.changedTouches[0].clientX;
      const diff = endX - startX;
      if (Math.abs(diff) > 40) {
        if (diff < 0) this.next();
        else this.prev();
      }
    });
  }
}
if (!customElements.get("mini-story")) {
  customElements.define("mini-story", MiniStory);
}

export { MiniStory };
