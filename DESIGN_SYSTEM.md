# Digital Heroes — Design System & Visual Language Note

## 1. Visual Philosophy & Core Identity
**"Robinhood meets a Charity Raffle"** — Not a golf site.
Digital Heroes deliberately moves away from legacy sports tropes (no fairways, greens, tartan, country-club serif typography, or scorebook tables). Instead, it adopts the polished, high-contrast, kinetic aesthetics of modern fintech apps, high-impact social enterprises, and next-generation prize platforms.

### Three Primary Emotional Pillars:
1. **High Impact**: Supporting causes transparently with real, measurable contribution tracking.
2. **Fintech Precision**: Crisp data visualizations, real-time prize pot tracking, audited draw logic.
3. **Lottery Excitement**: Tactile score inputs, kinetic slot-machine draw number reveals, gold jackpot rollover badging.

---

## 2. Color Palette & Semantic Tokens

### Backgrounds & Surfaces (Obsidian & Ink)
- **App Background**: `#070A12` (`bg-[#070A12]`) — Deep obsidian black with cool indigo undertones.
- **Surface Elevation 1 (Cards)**: `#0D1322` with `border border-white/[0.08]` — Elevated container.
- **Surface Elevation 2 (Modals / Floats)**: `#131B30` with `border border-white/[0.12]`.
- **Glass Shimmer Overlay**: `bg-white/[0.03]` with `backdrop-blur-xl`.

### Accents & Kinetic Highlights
- **Electric Emerald (Impact & Active States)**:
  - Base: `#00F5A0`
  - Glow: `rgba(0, 245, 160, 0.25)`
  - Used for: Primary CTA actions, charity impact percentages, winning match indicators, active badges.
- **Cyber Cyan (Fintech Precision & Data)**:
  - Base: `#00D2FF`
  - Glow: `rgba(0, 210, 255, 0.25)`
  - Used for: Live subscriber counters, draw odds, secondary highlights.
- **Sunset Gold / Amber (Jackpot & Prize Engine)**:
  - Gradient: `from-[#FFB020] via-[#FF8A00] to-[#E65100]`
  - Used for: 5-number match jackpot badge, rollover tickers, celebration confetti.
- **Crimson / Coral (Critical & Warning States)**:
  - Base: `#FF4D6D`
  - Used for: Lapsed subscriptions, duplicate score warnings, rejection notices.

### Neutrals
- **Text Primary**: `#F8FAFC` (Slate 50)
- **Text Secondary**: `#94A3B8` (Slate 400)
- **Text Muted**: `#64748B` (Slate 500)
- **Subtle Borders**: `rgba(255, 255, 255, 0.08)`

---

## 3. Typography Hierarchy

- **Display & Headlines**: `Space Grotesk` / `Plus Jakarta Sans`
  - Bold, punchy, tabular numbers for jackpots, countdown timers, and rolling scores.
- **Body & Functional Data**: `Inter` / `Geist`
  - Clean, neutral grotesque for exceptional readability on desktop and mobile.

### Type Scale:
- **Hero Title**: `text-4xl md:text-6xl font-extrabold tracking-tight`
- **Section Heading**: `text-2xl md:text-3xl font-bold tracking-tight`
- **Metric / Number Display**: `font-mono font-bold tracking-wider`
- **Body Regular**: `text-sm md:text-base text-slate-300 leading-relaxed`
- **Caption / Label**: `text-xs uppercase tracking-widest text-slate-400 font-semibold`

---

## 4. Spacing Scale & Layout Grid

- **Container**: Max width `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Dashboard Layout**: Sidebar navigation (`w-64`) on desktop + compact sticky topbar; full-width glass bottom bar on mobile.
- **Card Padding**: `p-5 md:p-7` with rounded corners `rounded-2xl`.

---

## 5. Motion Principles (Framer Motion)

1. **Tactile Spring Feedback**:
   - Buttons, score stepper buttons, and cards scale slightly on press (`whileTap={{ scale: 0.98 }}`).
2. **Draw Slot Machine Reveal**:
   - When draw results are revealed, winning numbers spin vertically and settle sequentially with an emerald/gold glow.
3. **Impact Meter Interpolation**:
   - Charity contribution and prize pool figures count up smoothly with spring-based animated numbers.
4. **Staggered Orchestration**:
   - Lists (scores, charities, draw history) load with a swift staggered fade-in (`staggerChildren: 0.05`).
