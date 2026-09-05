import React from "react";
import sports3dRegistry from "./sports3d.registry";

type Props = {
  sportKey?: string | null;
  size?: number;
  className?: string;
  alt?: string;
};

const FootballBadge: React.FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 200 200" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="fb-bg" cx="50%" cy="40%" r="75%">
        <stop offset="0%" stopColor="#1a2744" />
        <stop offset="55%" stopColor="#0d1528" />
        <stop offset="100%" stopColor="#050913" />
      </radialGradient>
      <radialGradient id="fb-gold" cx="50%" cy="30%" r="60%">
        <stop offset="0%" stopColor="#fff4c2" />
        <stop offset="35%" stopColor="#e6c064" />
        <stop offset="75%" stopColor="#b88a2a" />
        <stop offset="100%" stopColor="#7a5a18" />
      </radialGradient>
      <linearGradient id="fb-panel" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f5f5f5" />
        <stop offset="50%" stopColor="#d9dde5" />
        <stop offset="100%" stopColor="#aeb5c2" />
      </linearGradient>
      <linearGradient id="fb-shape" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#141b2e" />
        <stop offset="100%" stopColor="#0a0f1c" />
      </linearGradient>
      <radialGradient id="fb-metallic" cx="30%" cy="30%" r="50%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </radialGradient>
    </defs>

    <circle cx="100" cy="100" r="98" fill="url(#fb-bg)" />
    <circle cx="100" cy="100" r="92" fill="none" stroke="url(#fb-gold)" strokeWidth="2.5" opacity="0.9" />
    <circle cx="100" cy="100" r="84" fill="none" stroke="url(#fb-gold)" strokeWidth="1" opacity="0.55" />

    <g transform="translate(100 100)">
      <polygon
        points="0,-58 49,-30 49,30 0,58 -49,30 -49,-30"
        fill="none"
        stroke="url(#fb-gold)"
        strokeWidth="1.5"
        opacity="0.45"
      />
    </g>

    <g transform="translate(100 105) scale(0.72)">
      <circle cx="0" cy="0" r="52" fill="url(#fb-panel)" stroke="url(#fb-shape)" strokeWidth="2" />

      <polygon
        points="0,-30 17,-10 10.5,14.5 -10.5,14.5 -17,-10"
        fill="url(#fb-shape)"
        stroke="#000"
        strokeWidth="0.8"
      />
      <polygon
        points="30,-17 17,-10 10.5,14.5 30,5"
        fill="url(#fb-panel)"
        stroke="#000"
        strokeWidth="0.8"
      />
      <polygon
        points="-30,-17 -17,-10 -10.5,14.5 -30,5"
        fill="url(#fb-panel)"
        stroke="#000"
        strokeWidth="0.8"
      />
      <polygon
        points="18,26 10.5,14.5 -10.5,14.5 -18,26 0,34"
        fill="url(#fb-panel)"
        stroke="#000"
        strokeWidth="0.8"
      />
      <polygon
        points="18,-33 10.5,-22.5 -10.5,-22.5 -18,-33 0,-40"
        fill="url(#fb-panel)"
        stroke="#000"
        strokeWidth="0.8"
      />
      <polygon
        points="30,5 10.5,14.5 18,26 38,18"
        fill="url(#fb-shape)"
        stroke="#000"
        strokeWidth="0.8"
      />
      <polygon
        points="-30,5 -10.5,14.5 -18,26 -38,18"
        fill="url(#fb-shape)"
        stroke="#000"
        strokeWidth="0.8"
      />
      <polygon
        points="38,18 30,-17 38,-8"
        fill="url(#fb-panel)"
        stroke="#000"
        strokeWidth="0.8"
      />
      <polygon
        points="-38,18 -30,-17 -38,-8"
        fill="url(#fb-panel)"
        stroke="#000"
        strokeWidth="0.8"
      />
      <polygon
        points="38,-8 30,-17 17,-10 18,-33 0,-40 0,-52"
        fill="url(#fb-shape)"
        stroke="#000"
        strokeWidth="0.8"
      />
      <polygon
        points="-38,-8 -30,-17 -17,-10 -18,-33 0,-40 0,-52"
        fill="url(#fb-panel)"
        stroke="#000"
        strokeWidth="0.8"
      />
      <polygon
        points="38,18 18,26 0,34 0,46 -0,46 0,34 18,26 38,18 46,0"
        fill="url(#fb-panel)"
        stroke="#000"
        strokeWidth="0.8"
      />
      <polygon
        points="-38,18 -18,26 0,34 0,46 -0,46 0,34 -18,26 -38,18 -46,0"
        fill="url(#fb-shape)"
        stroke="#000"
        strokeWidth="0.8"
      />
      <polygon
        points="46,0 38,-8 38,18"
        fill="url(#fb-shape)"
        stroke="#000"
        strokeWidth="0.8"
      />
      <polygon
        points="-46,0 -38,-8 -38,18"
        fill="url(#fb-panel)"
        stroke="#000"
        strokeWidth="0.8"
      />
      <polygon
        points="0,-52 0,-40 18,-33 30,-17 38,-8 46,0 38,18 18,26 0,34 0,46 -18,26 -38,18 -46,0 -38,-8 -30,-17 -18,-33 0,-40"
        fill="none"
        stroke="#0a0a12"
        strokeWidth="1.2"
        opacity="0.6"
      />

      <circle cx="0" cy="0" r="52" fill="url(#fb-metallic)" />
    </g>

    <g opacity="0.55">
      <path d="M40 34 Q52 26 68 28" fill="none" stroke="url(#fb-gold)" strokeWidth="1.2" />
      <path d="M132 28 Q148 26 160 34" fill="none" stroke="url(#fb-gold)" strokeWidth="1.2" />
      <path d="M36 166 Q50 174 66 172" fill="none" stroke="url(#fb-gold)" strokeWidth="1.2" />
      <path d="M134 172 Q150 174 164 166" fill="none" stroke="url(#fb-gold)" strokeWidth="1.2" />
    </g>

    <text x="100" y="186" textAnchor="middle" fontFamily="Georgia, serif" fontSize="10" fill="url(#fb-gold)" letterSpacing="3" opacity="0.85">
      UOS
    </text>
  </svg>
);

const BasketballBadge: React.FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 200 200" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bb-bg" cx="50%" cy="40%" r="75%">
        <stop offset="0%" stopColor="#1e2a48" />
        <stop offset="55%" stopColor="#0f1729" />
        <stop offset="100%" stopColor="#060a18" />
      </radialGradient>
      <radialGradient id="bb-gold" cx="50%" cy="30%" r="60%">
        <stop offset="0%" stopColor="#fff6c8" />
        <stop offset="35%" stopColor="#eac870" />
        <stop offset="75%" stopColor="#c09234" />
        <stop offset="100%" stopColor="#80601a" />
      </radialGradient>
      <radialGradient id="bb-ball" cx="42%" cy="38%" r="65%">
        <stop offset="0%" stopColor="#ff7a3d" />
        <stop offset="45%" stopColor="#d94e12" />
        <stop offset="85%" stopColor="#8a2a06" />
        <stop offset="100%" stopColor="#4a1602" />
      </radialGradient>
      <radialGradient id="bb-ball-shine" cx="30%" cy="28%" r="40%">
        <stop offset="0%" stopColor="rgba(255,220,180,0.55)" />
        <stop offset="100%" stopColor="rgba(255,220,180,0)" />
      </radialGradient>
      <linearGradient id="bb-seam" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#2a1408" />
        <stop offset="50%" stopColor="#1a0c04" />
        <stop offset="100%" stopColor="#2a1408" />
      </linearGradient>
    </defs>

    <circle cx="100" cy="100" r="98" fill="url(#bb-bg)" />
    <circle cx="100" cy="100" r="92" fill="none" stroke="url(#bb-gold)" strokeWidth="2.5" opacity="0.9" />
    <circle cx="100" cy="100" r="84" fill="none" stroke="url(#bb-gold)" strokeWidth="1" opacity="0.55" />

    <g transform="translate(100 100)">
      <polygon
        points="0,-58 49,-30 49,30 0,58 -49,30 -49,-30"
        fill="none"
        stroke="url(#bb-gold)"
        strokeWidth="1.5"
        opacity="0.45"
      />
    </g>

    <g transform="translate(100 106) scale(0.74)">
      <circle cx="0" cy="0" r="52" fill="url(#bb-ball)" />
      <circle cx="0" cy="0" r="52" fill="none" stroke="url(#bb-seam)" strokeWidth="2" />

      <path d="M-52 0 Q0 -8 52 0" fill="none" stroke="url(#bb-seam)" strokeWidth="1.8" />
      <path d="M-52 0 Q0 8 52 0" fill="none" stroke="url(#bb-seam)" strokeWidth="1.8" />
      <path d="M0 -52 Q-8 0 0 52" fill="none" stroke="url(#bb-seam)" strokeWidth="1.8" />
      <path d="M0 -52 Q8 0 0 52" fill="none" stroke="url(#bb-seam)" strokeWidth="1.8" />

      <path d="M-36 -36 Q-18 -44 0 -36 Q18 -44 36 -36" fill="none" stroke="url(#bb-seam)" strokeWidth="1.4" />
      <path d="M-36 36 Q-18 44 0 36 Q18 44 36 36" fill="none" stroke="url(#bb-seam)" strokeWidth="1.4" />

      <circle cx="0" cy="0" r="52" fill="url(#bb-ball-shine)" />
    </g>

    <g opacity="0.55">
      <path d="M38 36 Q50 28 66 30" fill="none" stroke="url(#bb-gold)" strokeWidth="1.2" />
      <path d="M134 30 Q150 28 162 36" fill="none" stroke="url(#bb-gold)" strokeWidth="1.2" />
      <path d="M34 164 Q48 172 64 170" fill="none" stroke="url(#bb-gold)" strokeWidth="1.2" />
      <path d="M136 170 Q152 172 166 164" fill="none" stroke="url(#bb-gold)" strokeWidth="1.2" />
    </g>

    <g transform="translate(100 34)" opacity="0.9">
      <path
        d="M0 0 L-22 16 L-14 16 L-14 28 L14 28 L14 16 L22 16 Z"
        fill="none"
        stroke="url(#bb-gold)"
        strokeWidth="1.5"
      />
      <path
        d="M-10 0 L-10 28 M10 0 L10 28 M-6 8 L-6 20 M6 8 L6 20"
        stroke="url(#bb-gold)"
        strokeWidth="0.8"
        opacity="0.6"
      />
    </g>

    <text x="100" y="186" textAnchor="middle" fontFamily="Georgia, serif" fontSize="10" fill="url(#bb-gold)" letterSpacing="3" opacity="0.85">
      UOS
    </text>
  </svg>
);

const SwimmingBadge: React.FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 200 200" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="sw-bg" cx="50%" cy="40%" r="75%">
        <stop offset="0%" stopColor="#162847" />
        <stop offset="55%" stopColor="#0b1530" />
        <stop offset="100%" stopColor="#040814" />
      </radialGradient>
      <radialGradient id="sw-gold" cx="50%" cy="30%" r="60%">
        <stop offset="0%" stopColor="#fff4c0" />
        <stop offset="35%" stopColor="#e8c46a" />
        <stop offset="75%" stopColor="#bd8e30" />
        <stop offset="100%" stopColor="#7d5d1c" />
      </radialGradient>
      <linearGradient id="sw-water-1" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0a2848" />
        <stop offset="25%" stopColor="#12487a" />
        <stop offset="50%" stopColor="#1e68a8" />
        <stop offset="75%" stopColor="#12487a" />
        <stop offset="100%" stopColor="#0a2848" />
      </linearGradient>
      <linearGradient id="sw-water-2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0e385e" />
        <stop offset="25%" stopColor="#1a5a94" />
        <stop offset="50%" stopColor="#2882c8" />
        <stop offset="75%" stopColor="#1a5a94" />
        <stop offset="100%" stopColor="#0e385e" />
      </linearGradient>
      <linearGradient id="sw-water-3" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#144a74" />
        <stop offset="25%" stopColor="#2472b0" />
        <stop offset="50%" stopColor="#3a9cdc" />
        <stop offset="75%" stopColor="#2472b0" />
        <stop offset="100%" stopColor="#144a74" />
      </linearGradient>
      <radialGradient id="sw-crest" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#fff8dc" />
        <stop offset="40%" stopColor="#e8c870" />
        <stop offset="100%" stopColor="#8a6620" />
      </radialGradient>
      <radialGradient id="sw-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(100,200,255,0.3)" />
        <stop offset="100%" stopColor="rgba(100,200,255,0)" />
      </radialGradient>
    </defs>

    <circle cx="100" cy="100" r="98" fill="url(#sw-bg)" />
    <circle cx="100" cy="100" r="92" fill="none" stroke="url(#sw-gold)" strokeWidth="2.5" opacity="0.9" />
    <circle cx="100" cy="100" r="84" fill="none" stroke="url(#sw-gold)" strokeWidth="1" opacity="0.55" />

    <g transform="translate(100 100)">
      <polygon
        points="0,-58 49,-30 49,30 0,58 -49,30 -49,-30"
        fill="none"
        stroke="url(#sw-gold)"
        strokeWidth="1.5"
        opacity="0.45"
      />
    </g>

    <g transform="translate(100 102)">
      <circle cx="0" cy="0" r="62" fill="url(#sw-glow)" />

      <path
        d="M-58 -14 Q-50 -22 -38 -18 Q-26 -14 -14 -22 Q-2 -30 10 -22 Q22 -14 34 -20 Q46 -26 58 -18"
        fill="none"
        stroke="url(#sw-water-3)"
        strokeWidth="3.5"
        opacity="0.9"
      />
      <path
        d="M-58 -4 Q-50 -12 -38 -8 Q-26 -4 -14 -12 Q-2 -20 10 -12 Q22 -4 34 -10 Q46 -16 58 -8"
        fill="none"
        stroke="url(#sw-water-2)"
        strokeWidth="3.5"
        opacity="0.85"
      />
      <path
        d="M-58 6 Q-50 -2 -38 2 Q-26 6 -14 -2 Q-2 -10 10 -2 Q22 6 34 0 Q46 -6 58 2"
        fill="none"
        stroke="url(#sw-water-1)"
        strokeWidth="3.5"
        opacity="0.9"
      />
      <path
        d="M-58 16 Q-50 8 -38 12 Q-26 16 -14 8 Q-2 0 10 8 Q22 16 34 10 Q46 4 58 12"
        fill="none"
        stroke="url(#sw-water-3)"
        strokeWidth="3.5"
        opacity="0.85"
      />
      <path
        d="M-58 26 Q-50 18 -38 22 Q-26 26 -14 18 Q-2 10 10 18 Q22 26 34 20 Q46 14 58 22"
        fill="none"
        stroke="url(#sw-water-2)"
        strokeWidth="3.5"
        opacity="0.8"
      />
      <path
        d="M-58 36 Q-50 28 -38 32 Q-26 36 -14 28 Q-2 20 10 28 Q22 36 34 30 Q46 24 58 32"
        fill="none"
        stroke="url(#sw-water-1)"
        strokeWidth="3.5"
        opacity="0.75"
      />
    </g>

    <g transform="translate(100 48)" opacity="0.95">
      <path
        d="M0 -14 L-16 6 L-8 6 L-8 20 L8 20 L8 6 L16 6 Z"
        fill="none"
        stroke="url(#sw-crest)"
        strokeWidth="1.6"
      />
      <path d="M0 -6 L0 20 M-6 0 L-6 20 M6 0 L6 20 M-12 -4 L-12 14 M12 -4 L12 14" stroke="url(#sw-crest)" strokeWidth="0.8" opacity="0.55" />
    </g>

    <g opacity="0.55">
      <path d="M38 36 Q50 28 66 30" fill="none" stroke="url(#sw-gold)" strokeWidth="1.2" />
      <path d="M134 30 Q150 28 162 36" fill="none" stroke="url(#sw-gold)" strokeWidth="1.2" />
      <path d="M34 164 Q48 172 64 170" fill="none" stroke="url(#sw-gold)" strokeWidth="1.2" />
      <path d="M136 170 Q152 172 166 164" fill="none" stroke="url(#sw-gold)" strokeWidth="1.2" />
    </g>

    <text x="100" y="186" textAnchor="middle" fontFamily="Georgia, serif" fontSize="10" fill="url(#sw-gold)" letterSpacing="3" opacity="0.85">
      UOS
    </text>
  </svg>
);

const TennisBadge: React.FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 200 200" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="tn-bg" cx="50%" cy="40%" r="75%">
        <stop offset="0%" stopColor="#1c2742" />
        <stop offset="55%" stopColor="#0e1630" />
        <stop offset="100%" stopColor="#050916" />
      </radialGradient>
      <radialGradient id="tn-gold" cx="50%" cy="30%" r="60%">
        <stop offset="0%" stopColor="#fff5c4" />
        <stop offset="35%" stopColor="#e8c468" />
        <stop offset="75%" stopColor="#be9032" />
        <stop offset="100%" stopColor="#7e5e1c" />
      </radialGradient>
      <radialGradient id="tn-ball" cx="40%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#f8ffb0" />
        <stop offset="45%" stopColor="#d4e046" />
        <stop offset="85%" stopColor="#8a9e1a" />
        <stop offset="100%" stopColor="#4a5808" />
      </radialGradient>
      <radialGradient id="tn-ball-shine" cx="28%" cy="28%" r="40%">
        <stop offset="0%" stopColor="rgba(255,255,220,0.6)" />
        <stop offset="100%" stopColor="rgba(255,255,220,0)" />
      </radialGradient>
      <linearGradient id="tn-frame" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8a1010" />
        <stop offset="50%" stopColor="#c01818" />
        <stop offset="100%" stopColor="#7a0e0e" />
      </linearGradient>
      <linearGradient id="tn-seam" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#e8e4c0" />
      </linearGradient>
    </defs>

    <circle cx="100" cy="100" r="98" fill="url(#tn-bg)" />
    <circle cx="100" cy="100" r="92" fill="none" stroke="url(#tn-gold)" strokeWidth="2.5" opacity="0.9" />
    <circle cx="100" cy="100" r="84" fill="none" stroke="url(#tn-gold)" strokeWidth="1" opacity="0.55" />

    <g transform="translate(100 100)">
      <polygon
        points="0,-58 49,-30 49,30 0,58 -49,30 -49,-30"
        fill="none"
        stroke="url(#tn-gold)"
        strokeWidth="1.5"
        opacity="0.45"
      />
    </g>

    <g transform="translate(100 108) scale(0.78)">
      <ellipse
        cx="-12"
        cy="-16"
        rx="58"
        ry="62"
        fill="none"
        stroke="url(#tn-frame)"
        strokeWidth="5"
        transform="rotate(-22)"
      />

      <g transform="rotate(-22 -12 -16)" opacity="0.35">
        <path d="M-68 -16 H44" stroke="#ffffff" strokeWidth="0.8" />
        <path d="M-58 -36 L-58 4 M-48 -52 L-48 20 M-38 -60 L-38 28 M-28 -64 L-28 32 M-18 -66 L-18 34 M-8 -66 L-8 34 M2 -64 L2 32 M12 -60 L12 28 M22 -52 L22 20 M32 -36 L32 4" stroke="#ffffff" strokeWidth="0.8" />
        <path d="M-12 -76 V44" stroke="#ffffff" strokeWidth="0.8" />
        <path d="M-58 -60 L34 28 M-48 -66 L44 22 M-38 -70 L52 14 M-28 -72 L56 4 M-18 -72 L58 -8 M-8 -70 L56 -20 M2 -66 L50 -32 M12 -60 L42 -44" stroke="#ffffff" strokeWidth="0.6" />
      </g>

      <g transform="translate(30 10)">
        <circle cx="0" cy="0" r="30" fill="url(#tn-ball)" />
        <circle cx="0" cy="0" r="30" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="1.2" />

        <path
          d="M-28 -10 Q-10 -18 10 -10 Q24 -4 28 8"
          fill="none"
          stroke="url(#tn-seam)"
          strokeWidth="2"
          opacity="0.9"
        />
        <path
          d="M-8 -28 Q-16 -10 -8 8 Q-2 24 10 28"
          fill="none"
          stroke="url(#tn-seam)"
          strokeWidth="2"
          opacity="0.9"
        />
        <path
          d="M8 -28 Q16 -10 8 8 Q2 24 -10 28"
          fill="none"
          stroke="url(#tn-seam)"
          strokeWidth="1.2"
          opacity="0.55"
        />

        <circle cx="0" cy="0" r="30" fill="url(#tn-ball-shine)" />
      </g>
    </g>

    <g opacity="0.55">
      <path d="M38 36 Q50 28 66 30" fill="none" stroke="url(#tn-gold)" strokeWidth="1.2" />
      <path d="M134 30 Q150 28 162 36" fill="none" stroke="url(#tn-gold)" strokeWidth="1.2" />
      <path d="M34 164 Q48 172 64 170" fill="none" stroke="url(#tn-gold)" strokeWidth="1.2" />
      <path d="M136 170 Q152 172 166 164" fill="none" stroke="url(#tn-gold)" strokeWidth="1.2" />
    </g>

    <g transform="translate(100 34)" opacity="0.9">
      <circle cx="0" cy="0" r="12" fill="none" stroke="url(#tn-gold)" strokeWidth="1.4" />
      <circle cx="0" cy="0" r="7" fill="none" stroke="url(#tn-gold)" strokeWidth="1" opacity="0.6" />
      <circle cx="0" cy="0" r="2.5" fill="url(#tn-gold)" />
      <line x1="0" y1="-14" x2="0" y2="-22" stroke="url(#tn-gold)" strokeWidth="1.4" />
      <line x1="14" y1="0" x2="22" y2="0" stroke="url(#tn-gold)" strokeWidth="1.4" />
      <line x1="-14" y1="0" x2="-22" y2="0" stroke="url(#tn-gold)" strokeWidth="1.4" />
      <line x1="0" y1="14" x2="0" y2="20" stroke="url(#tn-gold)" strokeWidth="1.4" />
    </g>

    <text x="100" y="186" textAnchor="middle" fontFamily="Georgia, serif" fontSize="10" fill="url(#tn-gold)" letterSpacing="3" opacity="0.85">
      UOS
    </text>
  </svg>
);

const inlineBadges: Record<string, React.FC<{ size: number }>> = {
  football: FootballBadge,
  basketball: BasketballBadge,
  swimming: SwimmingBadge,
  tennis: TennisBadge,
};

export const Sports3DIcon: React.FC<Props> = ({ sportKey, size = 64, className, alt }) => {
  if (!sportKey) return null;

  const entry = sports3dRegistry[sportKey];
  if (!entry) return null;
  if (entry.licenseStatus === "unavailable") return null;

  if (entry.assetPath) {
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
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }

  const InlineBadge = inlineBadges[sportKey];
  if (!InlineBadge) return null;

  return (
    <span
      className={["sports-3d-inline-badge", className].filter(Boolean).join(" ")}
      role="img"
      aria-label={alt ?? `${sportKey} 3D identity badge`}
      style={{ display: "inline-block", width: size, height: size }}
    >
      <InlineBadge size={size} />
    </span>
  );
};

export default Sports3DIcon;
