import { useSettings } from "../../context/useSettings";

export function UnitToggle() {
  const { unit, setUnit } = useSettings();
  return (
    <div
      className="flex items-center gap-0.5 rounded-xl p-1 text-sm font-bold progress-bar-light"
    >
      {(["C", "F"] as const).map((u) => (
        <button
          key={u}
          onClick={() => setUnit(u)}
          aria-pressed={unit === u}
          className={`h-7 w-9 rounded-lg text-xs font-bold transition-all duration-200 ${
            unit === u ? "" : "unit-toggle-text"
          }`}
          style={
            unit === u
              ? { background: "var(--accent-blue)", color: "#fff" }
              : { background: "transparent" }
          }
        >
          °{u}
        </button>
      ))}
    </div>
  );
}
