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
  Evidence,
  LayoutMode,
  LegislativeAction,
  MapChamber,
  Member,
  PartyFilter,
  SenateSeatFilter,
  Stance,
} from "./lib/types";
import { STANCE_ORDER, STANCE_SHORT } from "./lib/types";
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
  const [stanceFilter, setStanceFilter] = useState<Stance | "All">("All");
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
    const c: Record<Stance, number> = {
      xrisk_concern: 0,
      strong_risk_reg: 0,
      mundane_risk: 0,
      opposes_domestic: 0,
      unknown: 0,
    };
    for (const s of stanceById.values()) c[s]++;
    return c;
  }, [stanceById]);

  const selected = members.find((m) => m.bioguideId === selectedId) || null;
  const selectedStance = selected ? stanceById.get(selected.bioguideId) || "unknown" : "unknown";
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
                onChange={(e) => setStanceFilter(e.target.value as Stance | "All")}
              >
                <option value="All">All</option>
                {STANCE_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {STANCE_SHORT[s]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </>
      ) : null}
      <StanceLegend />
      <p className="counts">
        Classified: {counts.xrisk_concern} x-risk · {counts.strong_risk_reg} strong-risk regs ·{" "}
        {counts.opposes_domestic} oppose · {counts.mundane_risk} ethics · {counts.unknown} unknown
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
          evidence={selectedEvidence}
          actions={selectedActions}
          bills={bills}
          onClose={() => setSelectedId(null)}
        />
      </div>
    </div>
  );
}
