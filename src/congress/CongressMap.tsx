import { useMemo, useState } from "react";
import membersData from "../data/congress/members.json";
import evidenceData from "../data/congress/evidence.json";
import billsData from "../data/congress/bills.json";
import actionsData from "../data/congress/actions.json";
import { ListView, type ListSort } from "./components/ListView";
import { MapView } from "./components/MapView";
import { MemberPanel } from "./components/MemberPanel";
import { ModeToggle } from "./components/ModeToggle";
import { StanceLegend } from "./components/StanceLegend";
import { ViewToggle } from "./components/ViewToggle";
import { classifyAll } from "./lib/classify";
import type {
  Bill,
  ChamberFilter,
  DisplayStance,
  Evidence,
  LayoutMode,
  LegislativeAction,
  MapChamber,
  Member,
  PartyFilter,
  SenateSeatFilter,
  XriskFilter,
} from "./lib/types";
import { DISPLAY_STANCE_ORDER, STANCE_SHORT } from "./lib/types";
import "./congress.css";

const members = membersData as Member[];
const evidence = evidenceData as Evidence[];
const bills = billsData as Bill[];
const actions = actionsData as LegislativeAction[];

export default function CongressMap() {
  const [layout, setLayout] = useState<LayoutMode>("map");
  const [chamber, setChamber] = useState<MapChamber>("senate");
  const [senateSeat, setSenateSeat] = useState<SenateSeatFilter>("both");
  const [partyFilter, setPartyFilter] = useState<PartyFilter>("All");
  const [stanceFilter, setStanceFilter] = useState<DisplayStance | "All">("All");
  const [xriskFilter, setXriskFilter] = useState<XriskFilter>("All");
  const [chamberFilter, setChamberFilter] = useState<ChamberFilter>("All");
  const [stateFilter, setStateFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [billFilter, setBillFilter] = useState("All");
  const [listSort, setListSort] = useState<ListSort>("name");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const stanceById = useMemo(
    () => classifyAll(members.map((m) => m.bioguideId), evidence, actions, bills),
    [],
  );

  const counts = useMemo(() => {
    const c: Record<DisplayStance, number> = {
      strong_risk_reg: 0,
      mundane_risk: 0,
      opposes_domestic: 0,
      unknown: 0,
    };
    let uncalled = 0;
    let xrisk = 0;
    for (const member of members) {
      if (member.called === false) {
        uncalled += 1;
        continue;
      }
      const placed = stanceById.get(member.bioguideId);
      c[placed?.stance || "unknown"] += 1;
      if (placed?.xrisk) xrisk += 1;
    }
    return { ...c, uncalled, xrisk };
  }, [stanceById]);

  const selected = members.find((m) => m.bioguideId === selectedId) || null;
  const selectedPlaced = selected ? stanceById.get(selected.bioguideId) : undefined;
  const selectedStance = selectedPlaced?.stance || "unknown";
  const selectedEvidence = evidence.filter((e) => e.bioguideId === selectedId);
  const selectedActions = actions.filter((a) => a.bioguideId === selectedId);

  return (
    <div className="congress-map">
      <ModeToggle value={layout} onChange={setLayout} />
      {layout === "map" ? (
        <>
          <ViewToggle
            chamber={chamber}
            onChamber={setChamber}
            senateSeat={senateSeat}
            onSenateSeat={setSenateSeat}
          />
          <div className="filters">
            <label>
              Party
              <select value={partyFilter} onChange={(e) => setPartyFilter(e.target.value as PartyFilter)}>
                <option value="All">All</option>
                <option value="D">Democrats</option>
                <option value="R">Republicans</option>
                <option value="I">Independents</option>
              </select>
            </label>
            <label>
              Stance
              <select
                value={stanceFilter}
                onChange={(e) => setStanceFilter(e.target.value as DisplayStance | "All")}
              >
                <option value="All">All</option>
                {DISPLAY_STANCE_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {STANCE_SHORT[s]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              X-risk concern
              <select
                value={xriskFilter}
                onChange={(e) => setXriskFilter(e.target.value as XriskFilter)}
              >
                <option value="All">All</option>
                <option value="yes">Expressed concern</option>
                <option value="no">No expressed concern</option>
              </select>
            </label>
          </div>
        </>
      ) : null}
      <StanceLegend />
      <p className="counts">
        Classified: {counts.strong_risk_reg} strong-risk regs · {counts.opposes_domestic} oppose ·{" "}
        {counts.mundane_risk} ethics · {counts.unknown} unknown · {counts.xrisk} with x-risk concern ·{" "}
        {counts.uncalled} not called
      </p>
      <div className="map-main">
        {layout === "map" ? (
          <MapView
            chamber={chamber}
            senateSeat={senateSeat}
            members={members}
            stanceById={stanceById}
            partyFilter={partyFilter}
            stanceFilter={stanceFilter}
            xriskFilter={xriskFilter}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        ) : (
          <ListView
            members={members}
            stanceById={stanceById}
            selectedId={selectedId}
            onSelect={setSelectedId}
            search={search}
            onSearch={setSearch}
            stanceFilter={stanceFilter}
            onStanceFilter={setStanceFilter}
            xriskFilter={xriskFilter}
            onXriskFilter={setXriskFilter}
            chamberFilter={chamberFilter}
            onChamberFilter={setChamberFilter}
            stateFilter={stateFilter}
            onStateFilter={setStateFilter}
            partyFilter={partyFilter}
            onPartyFilter={setPartyFilter}
            billFilter={billFilter}
            onBillFilter={setBillFilter}
            sort={listSort}
            onSort={setListSort}
            bills={bills}
            actions={actions}
          />
        )}
        <MemberPanel
          member={selected}
          stance={selectedStance}
          xrisk={Boolean(selectedPlaced?.xrisk)}
          evidence={selectedEvidence}
          actions={selectedActions}
          bills={bills}
          onClose={() => setSelectedId(null)}
        />
      </div>
    </div>
  );
}
