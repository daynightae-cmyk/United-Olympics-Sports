import {
  Activity,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  FileBarChart,
  FileText,
  Flag,
  LayoutGrid,
  MapPin,
  Megaphone,
  ShieldCheck,
  Sparkles,
  Trophy,
  UsersRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "../../components/admin/AdminUI";
import { BilingualText, bi } from "../../components/bilingual/BilingualText";
import {
  EnterpriseEmpty,
  EnterpriseKpi,
  EnterprisePanel,
  EnterpriseProgress,
  EnterpriseSelect,
  EnterpriseSparkline,
  EnterpriseStatus,
  EnterpriseTable,
  EnterpriseToolbar,
  ExportMenu,
  PreviewNotice,
  RowMenu,
} from "../../components/enterprise/EnterpriseUI";
import { UiButton } from "../../components/ui/UiPrimitives";
import { demoPlayers } from "../../data/demo/players";
import { demoSessions } from "../../data/demo/sessions";
import { demoSports } from "../../data/demo/sports";
import { demoTrainingGroups } from "../../data/demo/trainingGroups";
import { getLatestPlayerMetrics, getPlayerOverall, getSport } from "../../data/demo/selectors";
import { sportMediaAssets } from "../../data/media";

const statusLabel = (status: string) =>
  ({
    present: bi("Present", "حاضر"),
    absent: bi("Absent", "غائب"),
    late: bi("Late", "متأخر"),
    excused: bi("Excused", "معذور"),
    completed: bi("Completed", "مكتمل"),
    pending: bi("Pending", "قيد الانتظار"),
    failed: bi("Failed", "فشل"),
    published: bi("Published", "منشور"),
    draft: bi("Draft", "مسودة"),
  })[status] ?? bi(status, status);

const toneFor = (status: string): "active" | "warning" | "danger" | "info" | "neutral" =>
  status === "present" || status === "completed" || status === "published"
    ? "active"
    : status === "late" || status === "pending" || status === "draft"
      ? "warning"
      : status === "absent" || status === "failed"
        ? "danger"
        : "neutral";

export function AdminAttendancePage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [marks, setMarks] = useState<Record<string, string>>({});
  const records = useMemo(
    () =>
      demoPlayers.flatMap((player) =>
        player.attendanceRecords.map((record) => ({ ...record, player }))
      ),
    []
  );
  const visible = records.filter((record) => {
    const currentStatus = marks[record.id] ?? record.status;
    return (
      `${record.player.nameEn} ${record.player.nameAr} ${record.player.id}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (status === "all" || currentStatus === status)
    );
  });
  const counts = records.reduce<Record<string, number>>((result, record) => {
    const current = marks[record.id] ?? record.status;
    result[current] = (result[current] ?? 0) + 1;
    return result;
  }, {});
  const mark = (id: string, next: string) => setMarks((current) => ({ ...current, [id]: next }));
  return (
    <div className="admin-page">
      <PageHeader
        icon={CheckCircle2}
        eyebrow={bi("Training Operations", "العمليات التدريبية")}
        title={bi("Attendance Command", "مركز قيادة الحضور")}
        description={bi(
          "Session-based attendance control derived from the isolated preview roster.",
          "تحكم بالحضور حسب الجلسة مشتق من قائمة المعاينة المعزولة."
        )}
        actions={<PreviewNotice />}
      />
      <section className="enterprise-kpi-grid">
        <EnterpriseKpi
          label={bi("Present", "حاضر")}
          value={counts.present ?? 0}
          detail={bi("Current preview marks", "العلامات التجريبية الحالية")}
          icon={CheckCircle2}
          tone="green"
        />
        <EnterpriseKpi
          label={bi("Absent", "غائب")}
          value={counts.absent ?? 0}
          detail={bi("Needs review", "يحتاج إلى مراجعة")}
          icon={UsersRound}
          tone="orange"
        />
        <EnterpriseKpi
          label={bi("Late", "متأخر")}
          value={counts.late ?? 0}
          detail={bi("Arrival follow-up", "متابعة الوصول")}
          icon={CalendarDays}
          tone="blue"
        />
        <EnterpriseKpi
          label={bi("Attendance rate", "معدل الحضور")}
          value={`${Math.round((((counts.present ?? 0) + (counts.late ?? 0) + (counts.excused ?? 0)) / Math.max(records.length, 1)) * 100)}%`}
          detail={bi(`${records.length} preview records`, `${records.length} سجلًا تجريبيًا`)}
          icon={Activity}
        />
      </section>
      <PreviewNotice />
      <EnterpriseToolbar
        query={query}
        onQueryChange={setQuery}
        queryLabel={bi("Search players or IDs", "البحث عن اللاعبين أو المعرفات")}
        filters={
          <>
            <EnterpriseSelect
              label={bi("Status", "الحالة")}
              value={status}
              onChange={setStatus}
              options={[
                { value: "all", label: bi("All statuses", "كل الحالات") },
                ...(["present", "absent", "late", "excused"] as const).map((value) => ({
                  value,
                  label: statusLabel(value),
                })),
              ]}
            />
            <EnterpriseSelect
              label={bi("Session", "الجلسة")}
              value="all"
              onChange={() => {}}
              options={[
                { value: "all", label: bi("All sessions", "كل الجلسات") },
                ...demoSessions.map((session) => ({
                  value: session.id,
                  label: bi(session.id, session.id),
                })),
              ]}
            />
          </>
        }
        resultCount={bi(`${visible.length} visible records`, `${visible.length} سجل ظاهر`)}
        actions={
          <UiButton variant="outline" type="button" onClick={() => setMarks({})}>
            <BilingualText value={bi("Clear local marks", "مسح العلامات المحلية")} />
          </UiButton>
        }
      />
      <EnterpriseTable caption={bi("Attendance command table", "جدول قيادة الحضور")}>
        <thead>
          <tr>
            {[
              bi("Player", "اللاعب"),
              bi("Sport", "الرياضة"),
              bi("Date", "التاريخ"),
              bi("Status", "الحالة"),
              bi("Preview action", "إجراء المعاينة"),
            ].map((label) => (
              <th key={label.en}>
                <BilingualText value={label} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.map((record) => {
            const current = marks[record.id] ?? record.status;
            return (
              <tr key={record.id}>
                <td>
                  <strong>
                    <BilingualText value={{ en: record.player.nameEn, ar: record.player.nameAr }} />
                  </strong>
                  <small>{record.player.id}</small>
                </td>
                <td>
                  <BilingualText
                    value={
                      getSport(record.player.sportId)?.name ??
                      bi(record.player.sportId, record.player.sportId)
                    }
                  />
                </td>
                <td>{record.date}</td>
                <td>
                  <EnterpriseStatus label={statusLabel(current)} tone={toneFor(current)} />
                </td>
                <td>
                  <RowMenu
                    actions={(["present", "absent", "late", "excused"] as const).map((next) => ({
                      label: bi(`Mark ${next}`, `تحديد ${statusLabel(next).ar}`),
                      onClick: () => mark(record.id, next),
                    }))}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </EnterpriseTable>
      {!visible.length && (
        <EnterpriseEmpty
          title={bi("No attendance records match", "لا تطابق سجلات الحضور")}
          description={bi(
            "Reset the search or status filter to see the preview roster.",
            "أعد ضبط البحث أو فلتر الحالة لعرض قائمة المعاينة."
          )}
          action={
            <UiButton
              type="button"
              variant="outline"
              onClick={() => {
                setQuery("");
                setStatus("all");
              }}
            >
              <BilingualText value={bi("Reset filters", "إعادة ضبط الفلاتر")} />
            </UiButton>
          }
        />
      )}
    </div>
  );
}

export function AdminPerformancePage() {
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("all");
  const visible = demoPlayers.filter(
    (player) =>
      (sport === "all" || player.sportId === sport) &&
      `${player.nameEn} ${player.nameAr}`.toLowerCase().includes(query.toLowerCase())
  );
  const average = Math.round(
    visible.reduce((sum, player) => sum + getPlayerOverall(player.id), 0) /
      Math.max(visible.length, 1)
  );
  return (
    <div className="admin-page">
      <PageHeader
        icon={BarChart3}
        eyebrow={bi("Training Operations", "العمليات التدريبية")}
        title={bi("Performance Workspace", "مساحة الأداء")}
        description={bi(
          "Sport-aware skill records, trends and coaching context from preview evaluations.",
          "سجلات مهارات واتجاهات وسياق تدريبي خاص بالرياضة من تقييمات المعاينة."
        )}
        actions={<PreviewNotice />}
      />
      <section className="enterprise-kpi-grid">
        <EnterpriseKpi
          label={bi("Athletes in view", "الرياضيون في العرض")}
          value={visible.length}
          icon={UsersRound}
        />
        <EnterpriseKpi
          label={bi("Average score", "متوسط الدرجة")}
          value={average}
          detail={bi("Out of 100", "من 100")}
          icon={Trophy}
          tone="green"
          trend={6}
        />
        <EnterpriseKpi
          label={bi("Evaluation records", "سجلات التقييم")}
          value={visible.reduce((sum, player) => sum + player.performanceHistory.length, 0)}
          icon={FileBarChart}
          tone="blue"
        />
        <EnterpriseKpi
          label={bi("Sports represented", "الرياضات الممثلة")}
          value={new Set(visible.map((player) => player.sportId)).size}
          icon={Flag}
        />
      </section>
      <EnterpriseToolbar
        query={query}
        onQueryChange={setQuery}
        queryLabel={bi("Search athletes", "البحث عن الرياضيين")}
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
        resultCount={bi(`${visible.length} athletes`, `${visible.length} رياضي`)}
        actions={
          <ExportMenu
            filename="performance-preview.csv"
            headers={["Player", "Sport", "Score", "Records"]}
            rows={visible.map((player) => [
              player.nameEn,
              getSport(player.sportId)?.name.en ?? player.sportId,
              getPlayerOverall(player.id),
              player.performanceHistory.length,
            ])}
          />
        }
      />
      <section className="enterprise-grid-2">
        <EnterprisePanel
          title={bi("Performance trend", "اتجاه الأداء")}
          description={bi(
            "Latest sport-aware scores across the preview roster.",
            "أحدث درجات الرياضة عبر قائمة المعاينة."
          )}
        >
          <div style={{ display: "grid", gap: 12 }}>
            {visible.slice(0, 5).map((player) => (
              <div className="enterprise-bar-row" key={player.id}>
                <BilingualText value={{ en: player.nameEn, ar: player.nameAr }} />
                <EnterpriseProgress
                  value={getPlayerOverall(player.id)}
                  label={getSport(player.sportId)?.name}
                  color="gold"
                />
                <strong>{getPlayerOverall(player.id)}</strong>
              </div>
            ))}
          </div>
        </EnterprisePanel>
        <EnterprisePanel
          title={bi("Skill pulse", "نبض المهارات")}
          description={bi(
            "A compact view of recent records, not a live ranking.",
            "عرض مختصر للسجلات الحديثة وليس ترتيبًا مباشرًا."
          )}
        >
          <div className="enterprise-list">
            {visible.slice(0, 4).map((player) => (
              <div className="enterprise-list-item" key={player.id}>
                <div>
                  <strong>
                    <BilingualText value={{ en: player.nameEn, ar: player.nameAr }} />
                  </strong>
                  <small>
                    <BilingualText
                      value={getSport(player.sportId)?.name ?? bi("Sport", "الرياضة")}
                    />
                  </small>
                </div>
                <EnterpriseSparkline
                  values={getLatestPlayerMetrics(player.id).map((item) => item.current?.value ?? 0)}
                  color="green"
                />
              </div>
            ))}
          </div>
        </EnterprisePanel>
      </section>
      <EnterpriseTable caption={bi("Performance roster table", "جدول قائمة الأداء")}>
        <thead>
          <tr>
            {[
              bi("Player", "اللاعب"),
              bi("Sport", "الرياضة"),
              bi("Group", "المجموعة"),
              bi("Overall", "الإجمالي"),
              bi("Skill coverage", "تغطية المهارات"),
              bi("Trend", "الاتجاه"),
            ].map((label) => (
              <th key={label.en}>
                <BilingualText value={label} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.map((player) => {
            const metrics = getLatestPlayerMetrics(player.id);
            const score = getPlayerOverall(player.id);
            return (
              <tr key={player.id}>
                <td>
                  <strong>
                    <BilingualText value={{ en: player.nameEn, ar: player.nameAr }} />
                  </strong>
                  <small>{player.id}</small>
                </td>
                <td>
                  <BilingualText
                    value={getSport(player.sportId)?.name ?? bi(player.sportId, player.sportId)}
                  />
                </td>
                <td>{player.groupId ?? "—"}</td>
                <td>
                  <strong>{score}/100</strong>
                </td>
                <td>
                  <EnterpriseProgress value={Math.min(100, metrics.length * 20)} />
                </td>
                <td>
                  <EnterpriseSparkline
                    values={metrics.map((item) => item.current?.value ?? 0)}
                    color="green"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </EnterpriseTable>
    </div>
  );
}

const reportTypes = [
  {
    id: "organization",
    label: bi("Organization pulse", "نبض المؤسسة"),
    detail: bi("Scope, people and sports coverage", "النطاق وتغطية الأشخاص والرياضات"),
    icon: LayoutGrid,
  },
  {
    id: "attendance",
    label: bi("Attendance review", "مراجعة الحضور"),
    detail: bi("Present, late and absent patterns", "أنماط الحضور والتأخر والغياب"),
    icon: CheckCircle2,
  },
  {
    id: "performance",
    label: bi("Performance brief", "ملخص الأداء"),
    detail: bi("Sport-aware athlete development", "تطوير الرياضيين حسب الرياضة"),
    icon: Trophy,
  },
  {
    id: "finance",
    label: bi("Finance preview", "معاينة المالية"),
    detail: bi("Preview ledger and subscription states", "دفتر المعاينة وحالات الاشتراك"),
    icon: CircleDollarSign,
  },
  {
    id: "programs",
    label: bi("Programs reach", "انتشار البرامج"),
    detail: bi("Programs, groups and capacity context", "البرامج والمجموعات وسياق السعة"),
    icon: Flag,
  },
  {
    id: "activity",
    label: bi("Activity audit", "تدقيق النشاط"),
    detail: bi("Local preview events and changes", "أحداث وتغييرات المعاينة المحلية"),
    icon: Activity,
  },
];

export function AdminReportsPage() {
  const [selected, setSelected] = useState("organization");
  const selectedReport = reportTypes.find((report) => report.id === selected) ?? reportTypes[0];
  const reportRows = demoSports.map((sport) => [
    sport.name.en,
    sport.programIds.length,
    demoTrainingGroups.filter((group) => group.sportId === sport.id).length,
    demoPlayers.filter((player) => player.sportId === sport.id).length,
  ]);
  return (
    <div className="admin-page">
      <PageHeader
        icon={FileBarChart}
        eyebrow={bi("Insights & Governance", "الرؤى والحوكمة")}
        title={bi("Reports Studio", "استوديو التقارير")}
        description={bi(
          "Compose transparent preview reports from current local fixtures, with no claim of live analytics.",
          "أنشئ تقارير معاينة شفافة من البيانات المحلية الحالية دون ادعاء تحليلات مباشرة."
        )}
        actions={
          <ExportMenu
            filename="organization-report-preview.csv"
            headers={["Sport", "Programs", "Groups", "Players"]}
            rows={reportRows}
          />
        }
      />
      <PreviewNotice />
      <section className="portal-card-grid" style={{ marginTop: 14 }}>
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <button
              className={`portal-card report-card ${selected === report.id ? "is-selected" : ""}`}
              type="button"
              key={report.id}
              onClick={() => setSelected(report.id)}
            >
              <span className="portal-card-icon">
                <Icon size={18} />
              </span>
              <h3>
                <BilingualText value={report.label} />
              </h3>
              <p>
                <BilingualText value={report.detail} />
              </p>
            </button>
          );
        })}
      </section>
      <section className="enterprise-grid-2" style={{ marginTop: 14 }}>
        <EnterprisePanel title={selectedReport.label} description={selectedReport.detail}>
          <div className="enterprise-kpi-grid">
            <EnterpriseKpi
              label={bi("Scope records", "سجلات النطاق")}
              value={demoPlayers.length + demoTrainingGroups.length}
              icon={FileText}
            />
            <EnterpriseKpi
              label={bi("Coverage", "التغطية")}
              value="100%"
              icon={ShieldCheck}
              tone="green"
            />
            <EnterpriseKpi
              label={bi("Generated", "تم الإنشاء")}
              value="Local"
              detail={bi("Preview only", "معاينة فقط")}
              icon={Sparkles}
              tone="blue"
            />
            <EnterpriseKpi
              label={bi("Sessions", "الجلسات")}
              value={demoSessions.length}
              icon={CalendarDays}
            />
          </div>
        </EnterprisePanel>
        <EnterprisePanel
          title={bi("Report readiness", "جاهزية التقرير")}
          description={bi(
            "A clear status before a future verified export pipeline.",
            "حالة واضحة قبل مسار تصدير موثق مستقبلي."
          )}
        >
          <EnterpriseProgress
            value={82}
            label={bi("Preview completeness", "اكتمال المعاينة")}
            color="gold"
          />
          <div style={{ marginTop: 18 }}>
            <EnterpriseSparkline values={[38, 48, 44, 62, 58, 76, 82]} />
          </div>
        </EnterprisePanel>
      </section>
      <EnterprisePanel
        title={bi("Preview report table", "جدول التقرير التجريبي")}
        description={bi(
          "Derived from the current sports and roster fixtures.",
          "مشتق من بيانات الرياضات والقائمة الحالية."
        )}
        className="report-table-panel"
      >
        <EnterpriseTable caption={bi("Report preview table", "جدول معاينة التقرير")}>
          <thead>
            <tr>
              {[
                bi("Sport", "الرياضة"),
                bi("Programs", "البرامج"),
                bi("Groups", "المجموعات"),
                bi("Players", "اللاعبون"),
              ].map((label) => (
                <th key={label.en}>
                  <BilingualText value={label} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {demoSports.map((sport) => (
              <tr key={sport.id}>
                <td>
                  <strong>
                    <BilingualText value={sport.name} />
                  </strong>
                </td>
                <td>{sport.programIds.length}</td>
                <td>{demoTrainingGroups.filter((group) => group.sportId === sport.id).length}</td>
                <td>{demoPlayers.filter((player) => player.sportId === sport.id).length}</td>
              </tr>
            ))}
          </tbody>
        </EnterpriseTable>
      </EnterprisePanel>
    </div>
  );
}

export function AdminContentPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [featured, setFeatured] = useState<string[]>([]);
  const visible = sportMediaAssets.filter(
    (asset) =>
      (type === "all" || asset.usage === type) &&
      `${asset.id} ${asset.sportId} ${asset.altEn} ${asset.altAr}`
        .toLowerCase()
        .includes(query.toLowerCase())
  );
  const types = [...new Set(sportMediaAssets.map((asset) => asset.usage))];
  return (
    <div className="admin-page">
      <PageHeader
        icon={FileText}
        eyebrow={bi("Experience & Access", "التجربة والوصول")}
        title={bi("Content & Media", "المحتوى والوسائط")}
        description={bi(
          "Manage the verified sports media and public-site content references used by the preview experience.",
          "إدارة الوسائط الرياضية الموثقة ومراجع محتوى الموقع العام المستخدمة في تجربة المعاينة."
        )}
        actions={
          <UiButton type="button" variant="primary" onClick={() => setFeatured([])}>
            <Megaphone size={15} />
            <BilingualText value={bi("Reset featured", "إعادة المميز")} />
          </UiButton>
        }
      />
      <PreviewNotice />
      <EnterpriseToolbar
        query={query}
        onQueryChange={setQuery}
        queryLabel={bi("Search content or media", "البحث في المحتوى أو الوسائط")}
        filters={
          <EnterpriseSelect
            label={bi("Content type", "نوع المحتوى")}
            value={type}
            onChange={setType}
            options={[
              { value: "all", label: bi("All content", "كل المحتوى") },
              ...types.map((value) => ({ value, label: bi(value, value) })),
            ]}
          />
        }
        resultCount={bi(`${visible.length} assets`, `${visible.length} أصل`)}
      />
      <section className="enterprise-grid-3">
        {visible.map((asset) => (
          <article className="enterprise-panel content-asset-card" key={asset.id}>
            <div className="content-asset-image">
              <img
                src={asset.url}
                alt={`${asset.altEn} | ${asset.altAr}`}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div className="content-asset-copy">
              <div>
                <EnterpriseStatus
                  label={bi(
                    asset.sourceStatus === "verified-user-asset"
                      ? "Verified asset"
                      : "Preview asset",
                    asset.sourceStatus === "verified-user-asset" ? "أصل موثق" : "أصل تجريبي"
                  )}
                  tone="active"
                />
                <span className="asset-type">
                  <BilingualText value={bi(asset.usage, asset.usage)} />
                </span>
              </div>
              <h3>{asset.id}</h3>
              <p>
                <BilingualText value={{ en: asset.altEn, ar: asset.altAr }} />
              </p>
              <UiButton
                type="button"
                variant={featured.includes(asset.id) ? "primary" : "outline"}
                onClick={() =>
                  setFeatured((current) =>
                    current.includes(asset.id)
                      ? current.filter((id) => id !== asset.id)
                      : [...current, asset.id]
                  )
                }
              >
                <Sparkles size={14} />
                <BilingualText
                  value={
                    featured.includes(asset.id)
                      ? bi("Featured locally", "مميز محليًا")
                      : bi("Mark featured", "تحديد كمميز")
                  }
                />
              </UiButton>
            </div>
          </article>
        ))}
      </section>
      {!visible.length && (
        <EnterpriseEmpty
          title={bi("No content matches", "لا يطابق أي محتوى")}
          description={bi("Try another search or content type.", "جرب بحثًا أو نوع محتوى آخر.")}
        />
      )}
    </div>
  );
}
