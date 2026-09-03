"use client";

import dynamic from "next/dynamic";

const LegacyUnitedOlympicsApp = dynamic(
  () => import("../App").then((module) => module.App),
  {
    ssr: false,
    loading: () => (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <div>Loading United Olympics Sports…</div>
      </main>
    ),
  },
);

export function RocketAppClient() {
  return <LegacyUnitedOlympicsApp />;
}
