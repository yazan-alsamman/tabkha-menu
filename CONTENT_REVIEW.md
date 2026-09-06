# Content review — source discrepancies

The printed menu (`referenses/tabkha & more.pdf`) is a flattened 9-page JPEG. Arabic names and prices stay aligned when an English name wraps onto two lines; the English column then slips. **Arabic + price is treated as authoritative.** English was remapped rather than copied row-for-row.

Flagged items. Nothing below was invented silently in the live menu.

## English names missing from the source

These Arabic dishes have no matching English line. `name_en` is stored as `null` and the English UI shows Arabic plus a small “pending review” hint. Suggested translations (not used in the product until signed off):

| Arabic | Suggested English |
| --- | --- |
| فول باللبن | Foul with Yogurt |
| كبيس مشكل | Mixed Pickles |
| شوربة كريم الخضرة | Cream of Vegetable Soup |
| منقوشة عكاوي | Akkawi Manousheh |
| منقوشة حلوم | Halloumi Manousheh |
| بيني بالاجبان الاربعة | Penne with Four Cheeses |

## Mismatched English

| Arabic (authoritative) | Printed English | What we stored |
| --- | --- | --- |
| كفته (بالطحينة - بالبندورة) | Butter Chicken | `Kofta (tahini or tomato)` — printed English is almost certainly a layout error |
| منقوشة زيتون | Spinach Manousheh (duplicate of the previous block) | `Olive Manousheh` |

## Portion note

`كيلو و400 (صحن 250 غ)` appears on hummus / msabbaha lines. Meaning is ambiguous (weight vs. two sizes). Stored verbatim in `portion_note` and shown as a caption.

## Unclear dish name

`بسمشكات لحمه` / `Basmashkat Meat` is stored as printed. Confirm spelling and recipe with the kitchen.

## Photography

There are no per-dish photos. Category heroes are crops of the art-directed photography already on each menu page. Individual dish photography would need a new shoot.

## Typography

The brand book uses **DIN Next LT Arabic**. That family is commercial, so the site ships **Cairo** until a licensed webfont is available. Swap one token in `src/styles/tokens.css`.
