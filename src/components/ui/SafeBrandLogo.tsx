import React from "react";

type Props = {
  compact?: boolean;
  className?: string;
  alt?: string;
};

export function SafeBrandLogo({ compact = false, className = "", alt }: Props) {
  const [visible, setVisible] = React.useState(true);
  const imgClass = compact ? `official-logo compact ${className}` : `official-logo ${className}`;

  if (visible) {
    return (
      <img
        className={imgClass}
        src="/brand/united-olympics-sports-logo.png"
        alt={alt ?? "United Olympics Sports | يونايتد أوليمبيكس سبورت"}
        onError={() => setVisible(false)}
      />
    );
  }

  return (
    <div className={`brand-fallback ${className}`} aria-hidden>
      <strong>United Olympics Sports</strong>
      <small lang="ar" dir="rtl">
        يونايتد أوليمبيكس سبورت
      </small>
    </div>
  );
}

export default SafeBrandLogo;
