# How the Approach Works

> A plain-language tour of the whole approach — the logic, end to end, step by step.

**The big idea, in one line:** instead of rebuilding a website by hand, we turn the work into a calm, repeating routine — plan it, then build one piece at a time, checking each against the original — until the new store is a faithful, reusable copy.

A few characters appear throughout:

- **The Plan** — a checklist of every piece the site needs, one tick-box each, in sensible order.
- **The Knowledge Base** — a front desk that points to the right guide for whatever the task is.
- **The Worker** — handles exactly one piece, then hands off. Each piece gets a fresh Worker with a clear head.
- **The Quality Gate** — compares each new piece to the original, on desktop *and* phone.
- **The Notebook** — the shared memory: lessons learned, kept for everyone after.

---

## 1. The whole journey

There are two phases: first we **plan**, then we **build** — one piece at a time, checking each, until nothing is left. Lessons learned along the way flow back into the shared memory, so the work keeps getting sharper.

```mermaid
flowchart TD
    Src["A website we want to recreate"] --> Plan["PHASE 1 — PLAN<br/>understand the site, agree the goal,<br/>write the checklist"]
    Plan --> List["The Plan — a phased checklist,<br/>one tick-box per piece"]
    List --> Build["PHASE 2 — BUILD<br/>work the checklist one piece at a time,<br/>checking each against the original"]
    Build --> Deliver["Each finished piece<br/>is put live and delivered"]
    Deliver --> Q{"Anything left to build?"}
    Q -->|"yes"| Build
    Q -->|"no"| Done["The new store is complete<br/>and matches the original"]
    Build -.->|"lessons feed back"| NB[("The Notebook")]
    NB -.->|"read before each piece"| Build
```

---

## 2. Phase 1 — Making the plan

We study the original closely — every page, layout, colour, font, image, language and link, on desktop and phone — and agree the goal: a faithful copy, or a fresh design that keeps the content. Then we interview in short rounds, **but only about things we genuinely can't work out ourselves**, until the plan is clear. Finally, we bake any useful lesson into our reusable way of working, so the next project starts smarter.

```mermaid
flowchart TD
    U["Study the original site closely —<br/>pages, layout, colour, font, images,<br/>languages, links — desktop and phone"] --> Mode{"Which goal?"}
    Mode -->|"faithful copy"| M1["Recreate it as closely as possible"]
    Mode -->|"fresh look"| M2["Keep the content, apply a new design"]
    M1 --> Int["Interview in short rounds —<br/>only about things we truly<br/>can't work out ourselves"]
    M2 --> Int
    Int --> Clear{"Plan clear and complete?"}
    Clear -->|"no"| Int
    Clear -->|"yes"| Write["Write the Plan: a phased checklist<br/>foundations → sections → pages,<br/>navigation, languages → quality pass,<br/>each with how it will be checked"]
    Write --> Bake["Bake any useful lesson into our<br/>reusable way of working"]
```

---

## 3. What every Worker leans on — the Knowledge Base

Nothing is done from memory or guesswork. A short front desk points to the right guide for the task at hand, plus the Plan and the Notebook. Each Worker reads the front desk first and opens **only** the guides its piece needs — keeping its head clear. For anything about the platform itself, it trusts the official guidance rather than guessing.

```mermaid
flowchart TD
    FD["The front desk —<br/>a short index that points to the<br/>right guide for the task"]
    FD --> G1["Build a piece properly"]
    FD --> G2["Colours, spacing & layout"]
    FD --> G3["Recreate a page faithfully"]
    FD --> G4["Publish & deliver"]
    FD --> PL["The Plan<br/>(what to build, in order)"]
    FD --> NB[("The Notebook<br/>(lessons learned)")]
```

---

## 4. Phase 2 — One build step

Every piece follows the same gentle routine. A fresh Worker reads the guides, the plan and the lessons, picks the single most important unfinished item, checks it isn't already done, builds it, puts it live, proves it works, and compares it to the original. If something is off, it pinpoints the difference and fixes it; once it matches, it ticks the item, notes any lesson, saves and delivers — then stops. The next piece gets a brand-new Worker.

```mermaid
flowchart TD
    S["A fresh worker begins<br/>(a clear head, nothing carried over)"] --> R["Reads the guides, the plan,<br/>and the lessons so far"]
    R --> P["Picks the single most important<br/>unfinished item"]
    P --> A{"Already done?"}
    A -->|"yes"| T["Tick it off"]
    A -->|"no"| B["Builds that one piece"]
    B --> L["Puts it live so it can be seen"]
    L --> V["Proves it works, and<br/>guards it from breaking later"]
    V --> G["Compares it to the original<br/>— the Quality Gate"]
    G --> M{"Does it match?"}
    M -->|"not yet"| F["Pinpoints what's off, and fixes it"]
    F --> G
    M -->|"yes"| T
    T --> W["Writes down any lesson learned"]
    W --> Dl["Saves and delivers the work"]
    Dl --> X["Stops — the next piece gets a brand-new worker"]
```

---

## 5. A fresh start every time — yet it remembers

Why a new Worker for each piece? Because a clear head makes fewer mistakes than a tired one juggling everything at once. The trick is the Notebook: each Worker reads it before starting and writes back what it learned afterwards. So the work stays focused, while the knowledge quietly builds up.

```mermaid
flowchart TD
    J[("The Notebook:<br/>lessons learned")] -->|"every fresh worker reads it first"| W["A fresh worker<br/>for the next piece"]
    W -->|"does the work, then writes back what it learned"| J
```

---

## 6. What "building it properly" means

Two quiet rules make the result durable, not throwaway:

- **Every piece is a reusable building block.** It has a plain, neutral name, adjustable colours, spacing and layout, works on desktop and phone, and keeps its wording editable. So the owner ends up with a proper, flexible store they can keep changing — not a one-off that only fits today.
- **We recreate everything, not just the look.** Every page, section, article and link the original had is rebuilt, so nothing goes missing — not only the home page, and not only the visuals.

---

## 7. How we know it's actually right

We never just trust that it "looks close." For every piece we photograph the original and the new version the same way — the full length of the page, on desktop and phone — and place them side by side. We measure the difference precisely *and* take a careful look. If anything is off, we don't guess: we name exactly what differs — a colour, a size, a piece of text, spacing, or a missing image — and turn that into a precise fix-list, which goes straight back into the build.

```mermaid
flowchart TD
    O["Capture the ORIGINAL page<br/>— full length, desktop and phone"] --> SS["Place original and new<br/>side by side in one picture"]
    N["Capture the NEW page<br/>the same way"] --> SS
    SS --> SC["Measure the difference precisely,<br/>and take a careful look"]
    SC --> Q{"Identical?"}
    Q -->|"yes"| PASS["Passes — move on"]
    Q -->|"no"| DI["Diagnose: name exactly what differs<br/>— colour, size, text, spacing, missing image"]
    DI --> FL["Produce a precise fix-list:<br/>change this, to that"]
    FL --> BK["Feed the fix-list back into the build"]
```

---

## 8. Delivering, and knowing when to stop

Every finished piece is delivered to two places automatically — the live store, and a clean copy kept in sync for the platform — so what we build and what goes live always stay in step.

And the routine has clear stopping points, so it never wanders. After each piece we ask, in order: Is everything built? Are we blocked on something only a person should decide? Have we hit a sensible safety limit? Are we making no progress? Any "yes" ends it cleanly — finished, paused for a person, or flagged for help. Otherwise, on to the next piece.

```mermaid
flowchart TD
    T["A build step just finished"] --> Q1{"Any unfinished items left?"}
    Q1 -->|"no"| DONE["Finished — the store is complete and matches"]
    Q1 -->|"yes"| Q2{"Blocked on a decision<br/>only a person should make?"}
    Q2 -->|"yes"| PAUSE["Pause, and flag it for a person"]
    Q2 -->|"no"| Q3{"Hit a sensible safety limit?<br/>(too many tries, or budget)"}
    Q3 -->|"yes"| CAP["Stop at the safety cap"]
    Q3 -->|"no"| Q4{"No progress for<br/>several tries in a row?"}
    Q4 -->|"yes"| STUCK["Stop — looks stuck, ask for help"]
    Q4 -->|"no"| NEXT["Start the next build step"]
    NEXT --> T
```

---

## Why this works

- **Faithful** — every piece is checked against the original, on desktop and phone, before it counts as done.
- **Steady** — small, focused steps with a clear head each time, so quality doesn't drift.
- **Self-correcting** — when something's off, we pinpoint the exact change, not a vague "make it better."
- **Durable** — the result is a reusable, editable store, with every page recreated, not a throwaway.
- **It remembers** — lessons are written down once and reused by everyone after, so each project starts smarter than the last.
- **It knows when to stop** — finished, blocked, or stuck each have a clear, safe ending.
