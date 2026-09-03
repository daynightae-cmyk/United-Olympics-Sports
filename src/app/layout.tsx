import type { Metadata } from "next";
import "../index.css";
import "../styles/visual-system.css";
import "../styles/theme-closure.css";
import "../styles/enterprise.css";
import "../styles/portal-experience.css";
import "../styles/admin-directory-v2.css";

export const metadata: Metadata = {
  title: "United Olympics Sports",
  description: "United Olympics Sports — multi-portal sports operations platform.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
