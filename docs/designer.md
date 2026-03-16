## Core (well known design)

### Game design core (Decorator: room decoration commissions)

**Design pillars**
- Cozy, non-stressful creativity
- Clear commissions + satisfying “before/after”
- Gentle progression via *more options*, not via punishment
- Readable spatial rules (floor vs walls, no overlaps)

**Core loop (player-facing)**
- Read brief → decorate (move/add/remove) → submit → receive reaction + coins → unlock more

**Player goals per commission**
- Must-do: satisfy explicit add/remove requirements
- Nice-to-have: match mood/style keywords (future expansion)
- Feel-good: create aesthetically pleasing composition (subjective, but supported by tools)

**Systems (designer view)**
- **Commission system**
  - inputs: resident persona, room template, required changes, mood/style
  - outputs: brief text, validation rules, reward, reaction lines
- **Decoration / placement system**
  - surfaces: floor, left wall, right wall
  - constraints: grid bounds, no overlaps, item footprint sizes
  - interactions: drag & drop, snap, double-click remove
- **Economy / progression**
  - coins for success
  - shop: buy variants to increase creative palette
  - unlock rooms (level progression)
- **Feedback system**
  - immediate binary result (success/failure) for MVP
  - readable explanation (“missing: Lamp”, “must remove: Old Chair”) as next iteration

**Content rules**
- Every commission must be solvable with the currently available catalog.
- “Failure” must not feel punitive in a cozy game:
  - keep tone gentle
  - avoid losing progress; if needed, only deny reward, not confiscate items
- Room templates must clearly communicate wall/floor affordances.

---

## Review guidelines

These criteria are **strict**. A design change is rejected if it violates any rule below.

### Player experience (hard fail)
- **Clarity**: every commission must state requirements in unambiguous language (“add Lamp”, “remove Old Chair”).
- **No hidden rules**: the player must never fail due to an unstated condition.
- **Cozy tone**: feedback text must not shame the player; no aggressive/negative phrasing.
- **Accessibility**: interactions must be doable with one input method (mouse/touch), without precision frustration.

### Difficulty curve (hard fail)
- Difficulty must increase only by:
  - room size/shape complexity,
  - number of requirements,
  - choice variety (more items/variants),
  - optional mood objectives.
- Difficulty must NOT increase by:
  - timers,
  - harsh penalties,
  - random failure,
  - “gotcha” constraints.

### Economy & progression (hard fail)
- Rewards must be consistent and predictable.
- Shop prices must be balanced so that:
  - the player can buy at least 1 meaningful new item variant within a small number of successful commissions,
  - no “grind wall” appears in early progression.
- No pay-to-win loops, no mandatory purchases to complete required tasks.

### Content quality (hard fail)
- Every new furniture item must define:
  - surface type (floor/wall),
  - footprint size,
  - visual readability (not blending into background),
  - interaction affordance (selectable, draggable).
- Every new room template must be checked for:
  - readable surfaces,
  - consistent scale,
  - enough free space for required tasks.

### Design smell examples (hard fail)
- **Architecture decisions hiding bad design**: moving game rules into a separate layer is not an excuse for unclear or unfair rules.
- **Mismatched brief and validation**: player does everything text asks but fails because the underlying rule checks something else.
- **Overloaded rooms**: commissions that require so many objects that composition becomes unreadable on screen.

