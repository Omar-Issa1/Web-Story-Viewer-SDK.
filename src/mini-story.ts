export class MiniStory extends HTMLElement {
  static get observedAttributes() {
    return ["config", "interval", "autoplay"];
  }

  images: string[] = [];
  index: number = 0;
  interval: number = 3000;
  timer: number | null = null;
  autoplay: boolean = true;
  paused: boolean = false;

  imgEl!: HTMLImageElement;
  progressEl!: HTMLDivElement;
  imageCache: Map<string, HTMLImageElement> = new Map();

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    shadow.innerHTML = `
      <style>
        :host{
          display:block;
          position:relative;
          overflow:hidden;
          user-select:none;
          border-radius:8px;
        }
        img{
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
        }
        .progress{
          position:absolute;
          bottom:0;
          left:0;
          height:4px;
          background:rgba(255,255,255,0.85);
          width:0%;
          transition:width linear;
        }
      </style>
      <img />
      <div class="progress"></div>
    `;

    this.imgEl = shadow.querySelector("img")!;
    this.progressEl = shadow.querySelector(".progress")!;
  }

  /* ----------------------------------------------------
     Lifecycle
  ---------------------------------------------------- */

  connectedCallback() {
    this.readAttributes();

    this.preloadInitialImages().then(() => {
      this.show();
      if (this.autoplay) this.startAuto();
    });

    this.enableClickNavigation();
    this.enableSwipeNavigation();
  }

  disconnectedCallback() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === "config") {
      this.readAttributes();
      this.goTo(this.index);
    }
    if (name === "interval") {
      const n = Number(newValue);
      if (n > 0) this.interval = n;
      if (this.timer) this.startAuto();
    }
    if (name === "autoplay") {
      this.autoplay = newValue !== "false";
      if (this.autoplay) this.startAuto();
      else if (this.timer) clearInterval(this.timer);
    }
  }

  /* ----------------------------------------------------
     Preload Images
  ---------------------------------------------------- */

  preloadImage(src: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      if (this.imageCache.has(src)) return resolve(this.imageCache.get(src)!);

      const img = new Image();
      img.src = src;
      img.onload = () => {
        this.imageCache.set(src, img);
        resolve(img);
      };
      img.onerror = reject;
    });
  }

  async preloadInitialImages() {
    if (!this.images.length) return;
    await this.preloadImage(this.images[0]);
    if (this.images[1]) this.preloadImage(this.images[1]);
  }

  preloadNeighbors() {
    if (!this.images.length) return;

    const next = (this.index + 1) % this.images.length;
    const prev = (this.index - 1 + this.images.length) % this.images.length;

    this.preloadImage(this.images[next]);
    this.preloadImage(this.images[prev]);
  }

  /* ----------------------------------------------------
     SHOW IMAGE + progress sync
  ---------------------------------------------------- */

  show() {
    if (!this.images.length) return;

    const src = this.images[this.index];
    this.imgEl.src = this.imageCache.get(src)?.src || src;

    // STEP 1 — stop ANY previous animation fully
    this.progressEl.style.transition = "none";
    this.progressEl.style.width = "0%";

    // Force full reflow twice to drop old animation frame
    this.progressEl.getBoundingClientRect();
    void this.progressEl.offsetHeight;

    // STEP 2 — trigger new animation in NEXT frame
    requestAnimationFrame(() => {
      // RESET AGAIN INSIDE FRAME (important!)
      this.progressEl.style.transition = "none";
      this.progressEl.style.width = "0%";
      this.progressEl.getBoundingClientRect();

      // START A CLEAN ANIMATION
      requestAnimationFrame(() => {
        this.progressEl.style.transition = `width ${this.interval}ms linear`;
        this.progressEl.style.width = "100%";
      });
    });

    this.dispatchEvent(
      new CustomEvent("story-start", {
        detail: { index: this.index, interval: this.interval },
        bubbles: true,
      })
    );

    this.preloadNeighbors();
  }

  /* ----------------------------------------------------
     Autoplay
  ---------------------------------------------------- */

  startAuto() {
    if (this.timer) clearInterval(this.timer);

    this.timer = window.setInterval(() => {
      if (!this.paused) this.next();
    }, this.interval);
  }

  pause() {
    if (this.paused) return;
    this.paused = true;

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    const w = getComputedStyle(this.progressEl).width;
    this.progressEl.style.transition = "none";
    this.progressEl.style.width = w;

    this.dispatchEvent(new CustomEvent("story-pause", { bubbles: true }));
  }

  resume() {
    if (!this.paused) return;
    this.paused = false;

    const parentW =
      this.progressEl.parentElement!.getBoundingClientRect().width;
    const curW = this.progressEl.getBoundingClientRect().width;
    const perc = Math.max(0, curW / parentW);
    const remaining = (1 - perc) * this.interval;

    requestAnimationFrame(() => {
      this.progressEl.style.transition = `width ${remaining}ms linear`;
      this.progressEl.style.width = "100%";
    });

    if (this.autoplay) this.startAuto();

    this.dispatchEvent(
      new CustomEvent("story-resume", {
        detail: { remaining },
        bubbles: true,
      })
    );
  }

  /* ----------------------------------------------------
     Navigation
  ---------------------------------------------------- */

  next() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;

    this.index++;

    const done = this.index >= this.images.length;
    if (done) {
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
    if (this.autoplay) this.startAuto();
  }

  prev() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;

    this.index = Math.max(0, this.index - 1);

    this.dispatchEvent(
      new CustomEvent("story-prev", {
        detail: { index: this.index },
        bubbles: true,
      })
    );

    this.show();
    if (this.autoplay) this.startAuto();
  }

  goTo(i: number) {
    if (i < 0 || i >= this.images.length) return;

    if (this.timer) clearInterval(this.timer);
    this.timer = null;

    this.index = i;

    this.show();
    if (this.autoplay) this.startAuto();
  }

  /* ----------------------------------------------------
     Controls (tap + swipe)
  ---------------------------------------------------- */

  readAttributes() {
    const cfg = this.getAttribute("config");
    if (cfg) {
      try {
        const json = JSON.parse(cfg);
        this.images = json.images ?? this.images;
        this.interval = json.interval ?? this.interval;
        this.autoplay = json.autoplay ?? this.autoplay;
      } catch {}
    }
  }

  enableClickNavigation() {
    this.addEventListener("click", (e) => {
      const rect = this.getBoundingClientRect();
      const x = (e as MouseEvent).clientX - rect.left;
      if (x > rect.width / 2) this.next();
      else this.prev();
    });
  }

  enableSwipeNavigation() {
    let startX = 0;

    this.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
    });

    this.addEventListener("touchend", (e) => {
      const diff = e.changedTouches[0].clientX - startX;
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
