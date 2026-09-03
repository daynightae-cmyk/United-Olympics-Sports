import React from "react";
import sports3dRegistry from "./sports3d.registry";

type Props = {
  sportKey?: string | null;
  size?: number;
  className?: string;
  alt?: string;
};

export const Sports3DIcon: React.FC<Props> = ({ sportKey, size = 64, className, alt }) => {
  if (!sportKey) return null;
  const entry = sports3dRegistry[sportKey];
  if (!entry || !entry.assetPath) return null;

  return (
    <img
      src={entry.assetPath}
      alt={alt ?? `${sportKey} icon`}
      width={size}
      height={size}
      className={className}
      loading="lazy"
      decoding="async"
      onError={(e) => {
        // hide broken images silently; parent components should provide fallback visuals
        (e.currentTarget as HTMLImageElement).style.display = "none";
      }}
    />
  );
};

export default Sports3DIcon;
