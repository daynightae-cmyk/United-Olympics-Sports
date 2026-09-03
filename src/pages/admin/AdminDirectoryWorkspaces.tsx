import {
  ArrowRight,
  BarChart3,
  Building2,
  Flag,
  FolderCog,
  Gamepad2,
  Globe2,
  ShieldCheck,
  Trophy,
  UsersRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useBranches, useCountries, usePrograms, useSports } from "../../admin/data/adminHooks";
import { PageHeader } from "../../components/admin/AdminUI";
import { BilingualText, bi } from "../../components/bilingual/BilingualText";
import {
  EnterpriseEmpty,
  EnterpriseProgress,
  EnterpriseSelect,
  EnterpriseStatus,
  EnterpriseToolbar,
  PreviewNotice,
} from "../../components/enterprise/EnterpriseUI";
import { UiPreviewState } from "../../components/ui/UiPrimitives";
import { demoBranches, demoCountries } from "../../data/demo/business";
import { demoPlayers } from "../../data/demo/players";
import { demoPrograms } from "../../data/demo/programs";
import { demoSports } from "../../data/demo/sports";
import { demoTrainingGroups } from "../../data/demo/trainingGroups";
import { getSport } from "../../data/demo/selectors";
import { getSportPreviewMedia } from "../../data/media";

export function AdminSportsPage() {
  const [query, setQuery] = useState("");
  const { data, loading, error } = useSports({ page: 1, pageSize: 50 });
  const sports = (data?.items ?? []).filter((sport) =>
    `${sport.name.en} ${sport.name.ar}`.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <div className="admin-page">
      <PageHeader
        icon={Trophy}
        eyebrow={bi("Sports Management Center", "مركز إدارة الرياضات")}
        title={bi("Sports", "الرياضات")}
        description={bi(
          "Manage sport identity, media, programs, groups and linked athlete reach from one preview cockpit.",
          "أدر هوية الرياضة والوسائط والبرامج والمجموعات وانتشار الرياضيين من مركز معاينة واحد."
        )}
        actions={<PreviewNotice />}
      />
      <EnterpriseToolbar
        query={query}
        onQueryChange={setQuery}
        queryLabel={bi("Search sports", "البحث عن الرياضات")}
        resultCount={bi(`${sports.length} sports`, `${sports.length} رياضات`)}
      />
      {loading && (
        <div className="enterprise-panel">
          <UiPreviewState
            title={bi("Loading sports", "جارٍ تحميل الرياضات")}
            description={bi("Preparing the organization preview.", "جارٍ تجهيز معاينة المؤسسة.")}
          />
        </div>
      )}
      {error && (
        <div className="enterprise-panel">
          <UiPreviewState
            title={bi("Sports unavailable", "تعذر عرض الرياضات")}
            description={bi("The preview gateway returned an error.", "أعاد مصدر المعاينة خطأً.")}
          />
        </div>
      )}{" "}
      {!loading && !error && (
        <section className="enterprise-grid-3">
          {sports.map((sport) => {
            const groups = demoTrainingGroups.filter((group) => group.sportId === sport.id);
            const players = demoPlayers.filter((player) => player.sportId === sport.id);
            const coaches = new Set(groups.flatMap((group) => group.coachIds));
            const media = getSportPreviewMedia(sport.id);
            return (
              <article className="enterprise-panel organization-card" key={sport.id}>
                {media && (
                  <img
                    className="organization-card-media"
                    src={media.url}
                    alt={`${media.altEn} | ${media.altAr}`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                <div className="organization-card-head">
                  <span className="portal-card-icon">
                    <Trophy size={18} />
                  </span>
                  <EnterpriseStatus label={bi("Active", "نشط")} tone="active" />
                </div>
                <h2>
                  <BilingualText value={sport.name} />
                </h2>
                <p>
                  <BilingualText value={sport.description} />
                </p>
                <div className="organization-stat-grid">
                  <span>
                    <UsersRound size={13} />
                    <BilingualText value={bi("Players", "اللاعبون")} />
                    <strong>{players.length}</strong>
                  </span>
                  <span>
                    <ShieldCheck size={13} />
                    <BilingualText value={bi("Coaches", "المدربون")} />
                    <strong>{coaches.size}</strong>
                  </span>
                  <span>
                    <FolderCog size={13} />
                    <BilingualText value={bi("Programs", "البرامج")} />
                    <strong>{sport.programIds.length}</strong>
                  </span>
                  <span>
                    <BarChart3 size={13} />
                    <BilingualText value={bi("Metrics", "المؤشرات")} />
                    <strong>5</strong>
                  </span>
                </div>
                <Link className="admin-link-button" to={`/admin/sports/${sport.id}`}>
                  <BilingualText value={bi("Open sport cockpit", "فتح مركز الرياضة")} />
                  <ArrowRight size={14} />
                </Link>
              </article>
            );
          })}
        </section>
      )}
      {!loading && !error && !sports.length && (
        <EnterpriseEmpty
          title={bi("No sports match", "لا تطابق أي رياضات")}
          description={bi("Try a different search term.", "جرب مصطلح بحث آخر.")}
        />
      )}
    </div>
  );
}

export function AdminBranchesPage() {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("all");
  const { data, loading, error } = useBranches({ page: 1, pageSize: 50 });
  const branches = (data?.items ?? []).filter(
    (branch) =>
      (country === "all" || branch.countryId === country) &&
      `${branch.name.en} ${branch.name.ar} ${branch.id}`.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <div className="admin-page">
      <PageHeader
        icon={Building2}
        eyebrow={bi("Branch Management", "إدارة الفروع")}
        title={bi("Branches", "الفروع")}
        description={bi(
          "A multi-country branch cockpit for sports, programs, rosters, coaches and readiness.",
          "مركز فروع متعدد الدول للرياضات والبرامج والقوائم والمدربين والجاهزية."
        )}
        actions={<PreviewNotice />}
      />
      <EnterpriseToolbar
        query={query}
        onQueryChange={setQuery}
        queryLabel={bi("Search branches or IDs", "البحث عن الفروع أو المعرفات")}
        filters={
          <EnterpriseSelect
            label={bi("Country", "الدولة")}
            value={country}
            onChange={setCountry}
            options={[
              { value: "all", label: bi("All countries", "كل الدول") },
              ...demoCountries.map((item) => ({ value: item.id, label: item.name })),
            ]}
          />
        }
        resultCount={bi(`${branches.length} branches`, `${branches.length} فروع`)}
      />
      {loading && (
        <div className="enterprise-panel">
          <UiPreviewState
            title={bi("Loading branches", "جارٍ تحميل الفروع")}
            description={bi("Preparing the branch preview.", "جارٍ تجهيز معاينة الفروع.")}
          />
        </div>
      )}
      {error && (
        <div className="enterprise-panel">
          <UiPreviewState
            title={bi("Branches unavailable", "تعذر عرض الفروع")}
            description={bi("The preview gateway returned an error.", "أعاد مصدر المعاينة خطأً.")}
          />
        </div>
      )}
      {!loading && !error && (
        <section className="enterprise-grid-2">
          {branches.map((branch) => {
            const readiness = Math.round(
              (branch.sportCount / Math.max(demoSports.length, 1)) * 30 +
                (branch.programCount / 4) * 25 +
                (branch.groupCount / 4) * 25 +
                (branch.playerCount / 8) * 20
            );
            const countryName =
              demoCountries.find((item) => item.id === branch.countryId)?.name ??
              bi(branch.countryId, branch.countryId);
            return (
              <article className="enterprise-panel organization-card" key={branch.id}>
                <div className="organization-card-head">
                  <span className="portal-card-icon">
                    <Building2 size={18} />
                  </span>
                  <EnterpriseStatus label={bi("Active", "نشط")} tone="active" />
                </div>
                <h2>
                  <BilingualText value={branch.name} />
                </h2>
                <p className="organization-subline">
                  <Globe2 size={13} />
                  <BilingualText value={countryName} />
                </p>
                <div className="organization-stat-grid">
                  <span>
                    <Trophy size={13} />
                    <BilingualText value={bi("Sports", "الرياضات")} />
                    <strong>{branch.sportCount}</strong>
                  </span>
                  <span>
                    <UsersRound size={13} />
                    <BilingualText value={bi("Players", "اللاعبون")} />
                    <strong>{branch.playerCount}</strong>
                  </span>
                  <span>
                    <ShieldCheck size={13} />
                    <BilingualText value={bi("Coaches", "المدربون")} />
                    <strong>{branch.coachCount}</strong>
                  </span>
                  <span>
                    <FolderCog size={13} />
                    <BilingualText value={bi("Programs", "البرامج")} />
                    <strong>{branch.programCount}</strong>
                  </span>
                </div>
                <EnterpriseProgress
                  value={readiness}
                  label={bi("Readiness signal", "مؤشر الجاهزية")}
                />
                <Link className="admin-link-button" to={`/admin/branches/${branch.id}`}>
                  <BilingualText value={bi("Open branch cockpit", "فتح مركز تحكم الفرع")} />
                  <ArrowRight size={14} />
                </Link>
              </article>
            );
          })}
        </section>
      )}
      {!loading && !error && !branches.length && (
        <EnterpriseEmpty
          title={bi("No branches match", "لا تطابق أي فروع")}
          description={bi(
            "Reset the country filter or search term.",
            "أعد ضبط فلتر الدولة أو مصطلح البحث."
          )}
        />
      )}
    </div>
  );
}

export function AdminCountriesPage() {
  const [query, setQuery] = useState("");
  const { data, loading, error } = useCountries({ page: 1, pageSize: 50 });
  const countries = (data?.items ?? []).filter((country) =>
    `${country.name.en} ${country.name.ar} ${country.code}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );
  return (
    <div className="admin-page">
      <PageHeader
        icon={Flag}
        eyebrow={bi("Organization Hierarchy", "التسلسل التنظيمي")}
        title={bi("Countries", "الدول")}
        description={bi(
          "Review country-level coverage across preview branches, sports and players.",
          "راجع التغطية على مستوى الدول عبر الفروع والرياضات واللاعبين التجريبيين."
        )}
        actions={<PreviewNotice />}
      />
      <EnterpriseToolbar
        query={query}
        onQueryChange={setQuery}
        queryLabel={bi("Search countries or codes", "البحث عن الدول أو الرموز")}
        resultCount={bi(`${countries.length} countries`, `${countries.length} دول`)}
      />
      {loading && (
        <div className="enterprise-panel">
          <UiPreviewState
            title={bi("Loading countries", "جارٍ تحميل الدول")}
            description={bi(
              "Preparing the organization hierarchy.",
              "جارٍ تجهيز التسلسل التنظيمي."
            )}
          />
        </div>
      )}
      {error && (
        <div className="enterprise-panel">
          <UiPreviewState
            title={bi("Countries unavailable", "تعذر عرض الدول")}
            description={bi("The preview gateway returned an error.", "أعاد مصدر المعاينة خطأً.")}
          />
        </div>
      )}
      {!loading && !error && (
        <section className="enterprise-grid-2">
          {countries.map((country) => {
            const branches = demoBranches.filter((branch) => branch.countryId === country.id);
            const players = new Set(branches.flatMap((branch) => branch.playerIds));
            const sports = new Set(branches.flatMap((branch) => branch.sportIds));
            return (
              <article className="enterprise-panel organization-card" key={country.id}>
                <div className="organization-card-head">
                  <span className="portal-card-icon">
                    <Flag size={18} />
                  </span>
                  <EnterpriseStatus label={bi("Active", "نشط")} tone="active" />
                </div>
                <h2>
                  <BilingualText value={country.name} />
                </h2>
                <p className="organization-subline">
                  <Globe2 size={13} />
                  <span>{country.code}</span>
                </p>
                <div className="organization-stat-grid">
                  <span>
                    <Building2 size={13} />
                    <BilingualText value={bi("Branches", "الفروع")} />
                    <strong>{branches.length}</strong>
                  </span>
                  <span>
                    <UsersRound size={13} />
                    <BilingualText value={bi("Players", "اللاعبون")} />
                    <strong>{players.size}</strong>
                  </span>
                  <span>
                    <Trophy size={13} />
                    <BilingualText value={bi("Sports", "الرياضات")} />
                    <strong>{sports.size}</strong>
                  </span>
                  <span>
                    <Gamepad2 size={13} />
                    <BilingualText value={bi("Programs", "البرامج")} />
                    <strong>{new Set(branches.flatMap((branch) => branch.programIds)).size}</strong>
                  </span>
                </div>
                <Link className="admin-link-button" to={`/admin/countries/${country.id}`}>
                  <BilingualText value={bi("Open country cockpit", "فتح مركز الدولة")} />
                  <ArrowRight size={14} />
                </Link>
              </article>
            );
          })}
        </section>
      )}
      {!loading && !error && !countries.length && (
        <EnterpriseEmpty
          title={bi("No countries match", "لا تطابق أي دول")}
          description={bi("Try a different search term.", "جرب مصطلح بحث آخر.")}
        />
      )}
    </div>
  );
}

export function AdminProgramsPage() {
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("all");
  const { data, loading, error } = usePrograms({ page: 1, pageSize: 50 });
  const programs = (data?.items ?? []).filter(
    (program) =>
      (sport === "all" || program.sportId === sport) &&
      `${program.name.en} ${program.name.ar}`.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <div className="admin-page">
      <PageHeader
        icon={FolderCog}
        eyebrow={bi("Program Management", "إدارة البرامج")}
        title={bi("Programs", "البرامج")}
        description={bi(
          "Connect sports, groups, levels and athlete development through a clear preview catalogue.",
          "اربط الرياضات والمجموعات والمستويات وتطور الرياضيين عبر كتالوج معاينة واضح."
        )}
        actions={<PreviewNotice />}
      />
      <EnterpriseToolbar
        query={query}
        onQueryChange={setQuery}
        queryLabel={bi("Search programs", "البحث عن البرامج")}
        filters={
          <EnterpriseSelect
            label={bi("Sport", "الرياضة")}
            value={sport}
            onChange={setSport}
            options={[
              { value: "all", label: bi("All sports", "كل الرياضات") },
              ...demoSports.map((item) => ({ value: item.id, label: item.name })),
            ]}
          />
        }
        resultCount={bi(`${programs.length} programs`, `${programs.length} برامج`)}
      />
      {loading && (
        <div className="enterprise-panel">
          <UiPreviewState
            title={bi("Loading programs", "جارٍ تحميل البرامج")}
            description={bi("Preparing the program catalogue.", "جارٍ تجهيز كتالوج البرامج.")}
          />
        </div>
      )}
      {error && (
        <div className="enterprise-panel">
          <UiPreviewState
            title={bi("Programs unavailable", "تعذر عرض البرامج")}
            description={bi("The preview gateway returned an error.", "أعاد مصدر المعاينة خطأً.")}
          />
        </div>
      )}
      {!loading && !error && (
        <section className="enterprise-grid-3">
          {programs.map((program) => {
            const groups = demoTrainingGroups.filter((group) =>
              group.programIds.includes(program.id)
            );
            const players = demoPlayers.filter((player) =>
              groups.some((group) => group.id === player.groupId)
            );
            const source = demoPrograms.find((item) => item.id === program.id);
            return (
              <article className="enterprise-panel organization-card" key={program.id}>
                <div className="organization-card-head">
                  <span className="portal-card-icon">
                    <FolderCog size={18} />
                  </span>
                  <EnterpriseStatus label={bi("Active", "نشط")} tone="active" />
                </div>
                <h2>
                  <BilingualText value={program.name} />
                </h2>
                <p>
                  <BilingualText value={program.description} />
                </p>
                <div className="program-pill-list">
                  {(source?.pillars ?? program.ageGroups).map((pillar) => (
                    <span key={pillar.en}>
                      <BilingualText value={pillar} />
                    </span>
                  ))}
                </div>
                <div className="organization-stat-grid">
                  <span>
                    <Trophy size={13} />
                    <BilingualText value={bi("Sport", "الرياضة")} />
                    <strong>{getSport(program.sportId)?.name.en ?? program.sportId}</strong>
                  </span>
                  <span>
                    <UsersRound size={13} />
                    <BilingualText value={bi("Groups", "المجموعات")} />
                    <strong>{groups.length}</strong>
                  </span>
                  <span>
                    <UsersRound size={13} />
                    <BilingualText value={bi("Players", "اللاعبون")} />
                    <strong>{players.length}</strong>
                  </span>
                  <span>
                    <BarChart3 size={13} />
                    <BilingualText value={bi("Level", "المستوى")} />
                    <strong>{program.level.en}</strong>
                  </span>
                </div>
                <Link className="admin-link-button" to={`/admin/programs/${program.id}`}>
                  <BilingualText value={bi("Open program cockpit", "فتح مركز البرنامج")} />
                  <ArrowRight size={14} />
                </Link>
              </article>
            );
          })}
        </section>
      )}
      {!loading && !error && !programs.length && (
        <EnterpriseEmpty
          title={bi("No programs match", "لا تطابق أي برامج")}
          description={bi("Try another sport or search term.", "جرب رياضة أو مصطلح بحث آخر.")}
        />
      )}
    </div>
  );
}
