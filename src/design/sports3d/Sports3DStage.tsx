import React from "react";
import { Sports3DIcon } from "./Sports3DIcon";

type Props = {
  sportKey?: string | null;
  size?: number;
  opacity?: number; // 0-1
  className?: string;
};

export const Sports3DStage: React.FC<Props> = ({
  sportKey,
  size = 120,
  opacity = 0.14,
  className,
}) => {
  if (!sportKey) return null;

  return (
    <div
      aria-hidden
      className={["sports-3d-stage", className].filter(Boolean).join(" ")}
      style={{ width: size, height: size, opacity }}
    >
      <div className="sports-3d-stage-inner">
        <Sports3DIcon sportKey={sportKey} size={size} />
      </div>
    </div>
  );
};

export default Sports3DStage;
