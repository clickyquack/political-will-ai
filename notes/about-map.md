# **About this map**

[Back to the map](http://127.0.0.1:4321/congress-map/)  
This is an interactive map and directory of the incoming 120th U.S. Congress, color-coded by publicly sourced positions on AI risk and AI regulation.

## **Corrections**

If you find a relevant addition or correction, [open an issue in the Github repository](https://github.com/clickyquack/political-will-ai/issues) and include the correction and source link. Data is stored in `src/data/congress/`.

## **Stance assignment**

Support for stronger risk regulation outranks opposition to AI regulation or light-touch-only approaches, which outranks support limited to AI ethical concerns such as deepfakes. Positions are color-coded, and existential risk concern is separately drawn as diagonal stripes over the color. It counts as support for stronger risk regulation unless there is reason to expect they would not support it, such as prioritizing a race against China. That is, a member can acknowledge catastrophic or existential risk and still be shown as opposing regulation.[^1] Chip and compute security bills are tracked in the list but do not currently move color.

* **1\. Supports stronger-risk regulation** — Sponsors, cosponsors, or supports frontier catastrophic-risk bills (e.g. the [FRONTIER Act](https://www.congress.gov/bill/119th-congress/house-bill/9925), [AI Kill Switch Act](https://www.congress.gov/bill/119th-congress/house-bill/9917), or [Ban Artificial Superintelligence Act](https://www.congress.gov/bill/119th-congress/senate-bill/5493)), or generally calls for addressing these risks without prioritizing racing against China.  
* **2\. Opposes AI regulation or light-touch only** — Sourced opposition to substantive AI rulemaking, or support only for light-touch approaches (e.g. a state AI regulation moratorium). Does not include national-security-only measures.  
* **3\. AI ethical concerns** — Support for addressing AI ethical concerns such as deepfakes, consumer harms, etc. (e.g. the [NO FAKES Act](https://www.congress.gov/bill/119th-congress/senate-bill/1367)).  
* **4\. Unknown / no sourced signal** — No sourced signal yet on regulation.  
* **Existential risk concern** — Explicit public discussion of AGI, superintelligence, loss of control, existential risk, recursive self-improvement, or the Singularity, or sponsors or cosponsors the Ban Artificial Superintelligence Act ([S.5493](https://www.congress.gov/bill/119th-congress/senate-bill/5493) / [H.R.10538](https://www.congress.gov/bill/119th-congress/house-bill/10538)). This as support for stronger risk regulation unless there is reason to expect they would not support it, such as prioritizing racing against China.

Select a seat or row for sourced quotes and bill actions with links.

## **Sources**

* Roster: [unitedstates/congress-legislators](https://unitedstates.github.io/congress-legislators/legislators-current.json)  
* Existential risk quotes primarily from [AIPN Congress on Superintelligence](https://theaipn.org/issue/quotes/), plus other curated statements  
* 2026 candidate and member positions from [AI on the Ballot](https://ontheballot.ai/) when applicable
* Some positions inferred from super PAC support as tracked by [Transformer's AI Campaign Finance Tracker](https://elections.transformernews.ai/) when no better signal is available
* Bills and actions: Congress.gov and relevant press releases 
* House geography: `public/geo/districts-120.json`. Redrawn states from Census TIGER/Line 2026 `cd120`; other states from Census `cb_2025_us_cd119_20m`

[^1]:  To account for positions such as [“If there are going to be killer robots, I would rather they be American killer robots, rather than Chinese killer robots”](https://www.politico.com/live-updates/2026/09/09/congress/ted-cruz-ai-risks-legislation-01069036).