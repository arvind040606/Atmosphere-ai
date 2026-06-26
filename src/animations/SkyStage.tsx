import { AnimatePresence, motion } from "framer-motion";
import type { ConditionFamily } from "../constants/weather";
import { SCENE_THEMES } from "./sceneThemes";
import { SunLayer } from "./SunLayer";
import { CloudLayer } from "./CloudLayer";
import { RainLayer } from "./RainLayer";
import { StormLayer } from "./StormLayer";
import { SnowLayer } from "./SnowLayer";
import { FogLayer } from "./FogLayer";
import type { ReactNode } from "react";

const LAYER_MAP: Record<ConditionFamily, React.ComponentType> = {
  sun:   SunLayer,
  cloud: CloudLayer,
  rain:  RainLayer,
  storm: StormLayer,
  snow:  SnowLayer,
  fog:   FogLayer,
};

export function SkyStage({ family, children, className = "", style }: {
  family: ConditionFamily;
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const theme = SCENE_THEMES[family];
  const Layer = LAYER_MAP[family];

  return (
    <div className={`relative isolate overflow-hidden ${className}`} style={style}>
      <AnimatePresence mode="wait">
        <motion.div
          key={family + "-bg"}
          className="absolute inset-0"
          style={{ background: theme.heroBg }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        />
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <motion.div
          key={family + "-layer"}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Layer />
        </motion.div>
      </AnimatePresence>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
