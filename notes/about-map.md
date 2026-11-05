# **About this map**

[Back to the map](http://127.0.0.1:4321/congress-map/)  
This is an interactive map and directory of the incoming 120th U.S. Congress, color-coded by publicly sourced positions on AI risk and domestic AI regulation.

## **Corrections**

If you find a relevant addition or correction, [open an issue in the Github repository](https://github.com/clickyquack/political-will-ai/issues) and include the member, correction, and source link. Roster, quotes, bills, and actions are in `src/data/congress/`.

## **How stance is assigned**

Each member gets one regulation color. Support for stronger-risk regulation outranks opposition to domestic regulation, which outranks support limited to AI ethical concerns such as deepfakes. Existential-risk concern is separately drawn as diagonal stripes over the color. It counts as support for stronger-risk regulation unless a sourced position gives a reason to expect they would not support it, such as prioritizing a race against China, so a member can acknowledge catastrophic or existential risk and still be shown as opposing regulation.[^1] The stripes can be filtered on their own. Chip and compute security bills, and international governance bills, are tracked in the list but do not currently move color.

* **1\. Supports stronger-risk regulation** — Sponsors, cosponsors, or supports frontier catastrophic-risk bills (for example the FRONTIER Act, AI Kill Switch Act, RISE Act, or Ban Artificial Superintelligence Act), or generally calls for addressing these risks without prioritizing racing against China.  
* **2\. Opposes domestic AI regulation** — Sourced opposition to domestic AI rulemaking (for example a state AI regulation moratorium). Does not include national-security-only measures.  
* **3\. AI ethical concerns** — Support for addressing AI ethical concerns such as deepfakes, consumer harms, and likeness protection (for example the NO FAKES Act).  
* **4\. Unknown / no sourced signal** — No sourced signal yet on regulation.  
* **Existential risk concern** — Diagonal stripes over the regulation color. Recorded for an explicit public discussion of AGI, superintelligence, loss of control, existential risk, recursive self-improvement, or the Singularity, or for sponsoring or cosponsoring the Ban Artificial Superintelligence Act (S.5493 / H.R.10538). That concern counts as support for stronger-risk regulation unless a sourced position gives a reason to expect they would not support it, such as prioritizing a race against China. Sponsoring or cosponsoring the ban still counts as that support.

Select a seat or row for sourced quotes and tracked bill actions with links.

## **Sources**

* Roster: [unitedstates/congress-legislators](https://unitedstates.github.io/congress-legislators/legislators-current.json)  
* Existential risk quotes primarily from [AIPN Congress on Superintelligence](https://theaipn.org/issue/quotes/), plus other curated public statements  
* 2026 candidate and member positions from [AI on the Ballot](https://ontheballot.ai/), added only when the underlying source could be checked and the statement fits one of the stance categories above  
* Bills and actions: Congress.gov and press (including FRONTIER H.R.9925, Ban ASI S.5493 / H.R.10538, Kill Switch H.R.9917, RISE S.2081, NO FAKES S.1367 / S.4591, Chip Security S.1705, Future of AI Innovation S.3952)  
* House geography: `public/geo/districts-120.json`. Redrawn states from Census TIGER/Line 2026 `cd120`; other states from Census `cb_2025_us_cd119_20m`

[^1]:  To account for positions such as [“If there are going to be killer robots, I would rather they be American killer robots, rather than Chinese killer robots”](https://www.politico.com/live-updates/2026/09/09/congress/ted-cruz-ai-risks-legislation-01069036).