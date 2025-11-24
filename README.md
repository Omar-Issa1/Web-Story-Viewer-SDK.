# Web Story Viewer SDK

Web Story Viewer SDK is a lightweight Web Component (Custom Element) that brings **Instagram-like Stories** to any website using **pure JavaScript + Web Components** without any framework.

It supports:

- Images & Videos
- Preloading for fast transitions
- Tap Navigation (left/right)
- Hold to Pause (just like Instagram)
- Auto-play with per-item durations
- rAF‑based smooth progress animation
- Fully theme-able and embeddable anywhere

---

## 🚀 Features

### ✔️ Web Component — no framework needed

Just import and use `<mini-story>` anywhere.

### ✔️ Images & Videos

Stories accept mixed media with their own durations.

### ✔️ Smart Preloading

Next slide is preloaded in the background for instant switches.

### ✔️ Tap / Swipe Navigation

- Tap left → Previous
- Tap right → Next
- Hold → Pause
- Release → Resume

### ✔️ Smooth Progress Bar

Uses `requestAnimationFrame` for 1:1 Instagram-like animation.

### ✔️ Auto-loop

Can loop stories or stop at the end and emit `story-ended`.

---

## 📦 Installation

```bash
npm install mini-story-sdk
```

Or use directly via CDN:

```html
<script
  type="module"
  src="https://cdn.yourdomain.com/mini-story-sdk/index.js"
></script>
```

---

## 🧩 Basic Usage

```html
<script type="module">
  import "/dist/esm/index.js";
</script>

<mini-story
  config='{
    "items": [
      { "type": "image", "src": "1.jpg", "caption": "Hello" },
      { "type": "video", "src": "clip.mp4", "caption": "My Clip" }
    ],
    "autoplay": true,
    "interval": 3500
  }'
></mini-story>
```

---

## 🎛 Config Options

| Option     | Type        | Description                       |
| ---------- | ----------- | --------------------------------- |
| `items`    | array       | List of story items (image/video) |
| `interval` | number (ms) | Default duration for images       |
| `autoplay` | boolean     | Whether stories auto-play         |
| `loop`     | boolean     | Loop stories infinitely           |

### Story Item Format

```ts
{
  type: "image" | "video",
  src: "path/to/file",
  duration?: number,
  caption?: string
}
```

---

## 🎧 Events

The component emits several useful events:

### `story-next`

Fires when moving to the next slide.

```js
story.addEventListener("story-next", (e) => {
  console.log("Next:", e.detail.index);
});
```

### `story-prev`

### `story-ended`

Triggers when last story is done.

---

## 🧪 Demo

A full Instagram-style demo is included in:

```
/demo/index.html
```

Features:

- Header (avatar + name + time)
- Progress segments per story
- Caption
- Tap zones
- Automatic user switching

---

## 🏗 Build & Dev

### Build

```bash
npm run build
```

### Development mode

```bash
npm run dev
```

### Start demo locally

```bash
npx http-server . -p 8080
```

Then open:

```
http://localhost:8080/demo/index.html
```

---

## 📁 Project Structure

```
mini-story-sdk/
│
├── src/
│   └── mini-story.ts
│
├── dist/
│   ├── esm/
│   ├── cjs/
│   └── types/
│
├── demo/
│   └── index.html
│
├── package.json
└── README.md
```

---

## 📝 License

MIT © 2025

---

## ✨ Credits

Created by **Omar Issa**.
