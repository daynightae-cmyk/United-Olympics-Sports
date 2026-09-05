import { useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FileText,
  IdCard,
  MessageSquareText,
  Target,
  UsersRound,
} from "lucide-react";
import { BilingualText, bi } from "../../components/bilingual/BilingualText";
import {
  MetricRing,
  PreviewAvatar,
  PreviewBadge,
  ProductPreviewHeader,
} from "../../components/owner-demo/OwnerDemoVisuals";
import SafeBrandLogo from "../../components/ui/SafeBrandLogo";
import { demoPlayers } from "../../data/demo/players";
import {
  getGroup,
  getLatestPlayerMetrics,
  getPlayer,
  getPlayerOverall,
  getSport,
} from "../../data/demo/selectors";
import { demoTrainingGroups } from "../../data/demo/trainingGroups";
import type { AttendanceStatus, Player } from "../../domain/contracts";
import "../../styles/owner-demo.css";

const attendanceLabel: Record<AttendanceStatus, { en: string; ar: string }> = {
  present: bi("Present", "حاضر"),
  absent: bi("Absent", "غائب"),
  late: bi("Late", "متأخر"),
  excused: bi("Excused", "بعذر"),
};

function PlayerMiniHeader({ player }: { player: Player }) {
  const sport = getSport(player.sportId);
  const group = getGroup(player.groupId);
  return (
    <div className="od-athlete-lockup">
      <PreviewAvatar id={player.id} large />
      <div>
        <PreviewBadge label={bi("Preview Identity", "هوية تجريبية")} />
        <h2>
          <span>{player.nameEn}</span>
          <span lang="ar" dir="rtl">
            {player.nameAr}
          </span>
        </h2>
        <p>
          <BilingualText value={sport?.name ?? bi("Sport Preview", "معاينة الرياضة")} /> ·{" "}
          <BilingualText value={group?.name ?? bi("Training Group", "مجموعة التدريب")} />
        </p>
      </div>
    </div>
  );
}

function MetricBars({ player }: { player: Player }) {
  const metrics = getLatestPlayerMetrics(player.id).slice(0, 3);
  return (
    <div className="od-metric-bars">
      {metrics.map((item) => (
        <div key={item.definition.id}>
          <div>
            <BilingualText value={item.definition.name} />
            <strong>{item.current?.value ?? "—"}</strong>
          </div>
          <span>
            <i style={{ width: `${item.current?.value ?? 0}%` }} />
          </span>
        </div>
      ))}
    </div>
  );
}

function AttendanceStrip({ player }: { player: Player }) {
  return (
    <div className="od-attendance-strip">
      {player.attendanceRecords.map((record) => (
        <div key={record.id} className={record.status}>
          <span>{record.date.slice(5)}</span>
          <BilingualText value={attendanceLabel[record.status]} />
        </div>
      ))}
    </div>
  );
}

export function PlayerPreviewPage() {
  const player = getPlayer("player-demo-001") ?? demoPlayers.find((item) => item.id === "player-demo-001");
  if (!player) return null;
  const overall = getPlayerOverall(player.id);
  const feedback = player.coachFeedback.at(-1);
  return (
    <div className="od-product-shell od-player-product">
      <ProductPreviewHeader product={bi("Player App", "تطبيق اللاعب")} />
      <main className="od-product-main">
        <section className="od-player-owner-demo">
          <div className="od-phone-frame">
            <div className="od-phone-top">
              <SafeBrandLogo className="od-phone-logo" />
              <PreviewBadge label={bi("Athlete Preview", "معاينة اللاعب")} />
            </div>
            <PlayerMiniHeader player={player} />
            <MetricRing value={overall} label={bi("Overall Development", "التطور العام")} />
            <div className="od-phone-quick">
              <span>
                <IdCard />
                <BilingualText value={bi("My ID", "هويتي")} />
              </span>
              <span>
                <Activity />
                <BilingualText value={bi("Performance", "الأداء")} />
              </span>
            </div>
          </div>
          <div className="od-player-dashboard-copy">
            <span className="od-kicker">
              <BilingualText value={bi("Athlete Dashboard", "لوحة اللاعب")} />
            </span>
            <h1>
              <BilingualText
                value={bi("Your progress, in one focused view", "تقدمك في واجهة واحدة واضحة")}
              />
            </h1>
            <p>
              <BilingualText
                value={bi(
                  "A premium athlete-app prototype built from shared anonymized preview data.",
                  "نموذج احترافي لتطبيق اللاعب مبني على بيانات تجريبية مجهولة مشتركة."
                )}
              />
            </p>
            <div className="od-player-grid">
              <article>
                <small>
                  <BilingualText value={bi("Sport Performance", "أداء الرياضة")} />
                </small>
                <MetricBars player={player} />
              </article>
              <article>
                <small>
                  <BilingualText value={bi("Attendance", "الحضور")} />
                </small>
                <strong>
                  {player.attendanceSummary?.attended ?? 0}/
                  {player.attendanceSummary?.scheduled ?? 0}
                </strong>
                <AttendanceStrip player={player} />
              </article>
              <article className="wide">
                <MessageSquareText />
                <small>
                  <BilingualText value={bi("Latest Coach Feedback", "آخر تقييم للمدرب")} />
                </small>
                <p>
                  <BilingualText
                    value={
                      feedback?.summary ??
                      bi("Preview feedback will appear here.", "سيظهر التقييم التجريبي هنا.")
                    }
                  />
                </p>
              </article>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

const parentPreviewChildren = ["player-demo-001", "player-demo-003"];
export function ParentPreviewPage() {
  const [selectedId, setSelectedId] = useState(parentPreviewChildren[0]);
  const player = getPlayer(selectedId) ?? demoPlayers.find((item) => item.id === selectedId);
  if (!player) return null;
  const sport = getSport(player.sportId);
  const overall = getPlayerOverall(player.id);
  const feedback = player.coachFeedback.at(-1);
  return (
    <div className="od-product-shell od-parent-product">
      <ProductPreviewHeader product={bi("Parent Portal", "بوابة ولي الأمر")} />
      <main className="od-product-main">
        <section className="od-parent-hero">
          <div>
            <PreviewBadge />
            <span className="od-kicker">
              <BilingualText value={bi("Family Overview", "نظرة العائلة")} />
            </span>
            <h1>
              <BilingualText
                value={bi("Your Child's Journey, Clearly Visible", "رحلة ابنك أمامك بوضوح")}
              />
            </h1>
            <p>
              <BilingualText
                value={bi(
                  "Progress, attendance, training context and communication in one calm family-focused experience.",
                  "التقدم والحضور وسياق التدريب والتواصل في تجربة هادئة وواضحة للأسرة."
                )}
              />
            </p>
          </div>
          <div className="od-parent-highlight">
            <PlayerMiniHeader player={player} />
            <MetricRing value={overall} label={bi("Progress", "التقدم")} />
          </div>
        </section>
        <section className="od-child-switcher">
          <small>
            <BilingualText value={bi("Children", "الأبناء")} />
          </small>
          <div>
            {parentPreviewChildren.map((id, index) => {
              const child = getPlayer(id);
              if (!child) return null;
              return (
                <button
                  key={id}
                  type="button"
                  className={selectedId === id ? "active" : ""}
                  onClick={() => setSelectedId(id)}
                >
                  <PreviewAvatar id={id} />
                  <BilingualText
                    value={bi(
                      `Player Preview ${index === 0 ? "A" : "B"}`,
                      `لاعب تجريبي ${index === 0 ? "أ" : "ب"}`
                    )}
                  />
                  <span>
                    <BilingualText
                      value={getSport(child.sportId)?.name ?? bi("Sport", "الرياضة")}
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </section>
        <section className="od-parent-grid">
          <article className="od-parent-progress">
            <div className="od-card-title">
              <Target />
              <BilingualText value={bi("Progress", "التقدم")} />
            </div>
            <MetricBars player={player} />
          </article>
          <article>
            <div className="od-card-title">
              <CheckCircle2 />
              <BilingualText value={bi("Attendance", "الحضور")} />
            </div>
            <strong>
              {player.attendanceSummary?.attended ?? 0}/{player.attendanceSummary?.scheduled ?? 0}
            </strong>
            <AttendanceStrip player={player} />
          </article>
          <article>
            <div className="od-card-title">
              <CalendarDays />
              <BilingualText value={bi("Training Schedule Preview", "معاينة جدول التدريب")} />
            </div>
            <div className="od-schedule-preview">
              <span>
                <BilingualText value={bi("Training Block A", "كتلة تدريب أ")} />
              </span>
              <span>
                <BilingualText value={bi("Training Block B", "كتلة تدريب ب")} />
              </span>
            </div>
          </article>
          <article>
            <div className="od-card-title">
              <MessageSquareText />
              <BilingualText value={bi("Coach Feedback", "تقييم المدرب")} />
            </div>
            <p>
              <BilingualText
                value={
                  feedback?.summary ?? bi("Training feedback preview", "معاينة ملاحظات التدريب")
                }
              />
            </p>
          </article>
          <article>
            <div className="od-card-title">
              <CreditCard />
              <BilingualText value={bi("Payments & Invoices", "المدفوعات والفواتير")} />
            </div>
            <div className="od-invoice-shell">
              <span>
                <BilingualText value={bi("Invoice Preview", "معاينة الفاتورة")} />
              </span>
              <strong>—</strong>
              <small>
                <BilingualText value={bi("Status Preview", "معاينة الحالة")} />
              </small>
            </div>
          </article>
          <article>
            <div className="od-card-title">
              <FileText />
              <BilingualText value={bi("Documents", "المستندات")} />
            </div>
            <div className="od-doc-shell">
              <span>
                <BilingualText value={bi("Player Document", "مستند اللاعب")} />
              </span>
              <span>—</span>
            </div>
          </article>
        </section>
        <section className="od-parent-message">
          <MessageSquareText />
          <div>
            <small>
              <BilingualText value={bi("Coach Update", "تحديث المدرب")} />
            </small>
            <h3>
              <BilingualText value={bi("Training Feedback", "ملاحظات التدريب")} />
            </h3>
            <p>
              <BilingualText
                value={bi(
                  `Shared preview data for ${sport?.name.en ?? "sport"} demonstrates the intended family view.`,
                  `توضح البيانات التجريبية المشتركة لرياضة ${sport?.name.ar ?? "الرياضة"} شكل تجربة الأسرة المقصودة.`
                )}
              />
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export function CoachPreviewPage() {
  const group =
    demoTrainingGroups.find((item) => item.id === "football-demo-u12") ?? demoTrainingGroups[0];
  const roster = useMemo(
    () =>
      group.playerIds
        .map((id) => getPlayer(id))
        .filter((player): player is Player => Boolean(player)),
    [group]
  );
  return (
    <div className="od-product-shell od-coach-product">
      <ProductPreviewHeader product={bi("Coach Portal", "بوابة المدرب")} />
      <main className="od-product-main">
        <section className="od-coach-dashboard-hero">
          <div>
            <PreviewBadge />
            <span className="od-kicker">
              <BilingualText value={bi("Today", "اليوم")} />
            </span>
            <h1>
              <BilingualText
                value={bi(
                  "Sessions, players and evaluation at a glance",
                  "الحصص واللاعبون والتقييم في لمحة واحدة"
                )}
              />
            </h1>
            <p>
              <BilingualText
                value={bi(
                  "A tablet-friendly workflow prototype built around groups, attendance and sport-aware evaluation.",
                  "نموذج سير عمل مناسب للأجهزة اللوحية مبني حول المجموعات والحضور والتقييم الخاص بالرياضة."
                )}
              />
            </p>
          </div>
          <div className="od-coach-today">
            <UsersRound />
            <BilingualText value={group.name} />
            <strong>{roster.length}</strong>
            <small>
              <BilingualText value={bi("Preview Players", "لاعبون تجريبيون")} />
            </small>
          </div>
        </section>
        <section className="od-coach-workspace">
          <div className="od-session-timeline">
            <div className="od-card-title">
              <CalendarDays />
              <BilingualText value={bi("Session Timeline", "الخط الزمني للحصص")} />
            </div>
            {[
              bi("Training Block A", "كتلة تدريب أ"),
              bi("Training Block B", "كتلة تدريب ب"),
              bi("Review Block", "كتلة المراجعة"),
            ].map((item, index) => (
              <div key={item.en}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <BilingualText value={item} />
                <i />
              </div>
            ))}
          </div>
          <div className="od-roster">
            <div className="od-card-title">
              <UsersRound />
              <BilingualText value={bi("Player Roster", "قائمة اللاعبين")} />
            </div>
            {roster.map((player) => (
              <article key={player.id}>
                <PreviewAvatar id={player.id} />
                <div>
                  <strong>{player.nameEn}</strong>
                  <span lang="ar" dir="rtl">
                    {player.nameAr}
                  </span>
                  <BilingualText value={player.level} />
                </div>
                <span className="od-roster-status">
                  <BilingualText
                    value={attendanceLabel[player.attendanceRecords.at(-1)?.status ?? "present"]}
                  />
                </span>
              </article>
            ))}
          </div>
        </section>
        <section className="od-coach-actions">
          <article>
            <ClipboardCheck />
            <h3>
              <BilingualText value={bi("Attendance", "الحضور")} />
            </h3>
            <p>
              <BilingualText
                value={bi(
                  "Preview the group attendance workflow before any backend is connected.",
                  "معاينة سير عمل حضور المجموعة قبل ربط أي خادم."
                )}
              />
            </p>
            <button type="button">
              <BilingualText value={bi("Preview Attendance", "معاينة الحضور")} />
            </button>
          </article>
          <article>
            <Activity />
            <h3>
              <BilingualText value={bi("Performance Evaluation", "تقييم الأداء")} />
            </h3>
            <p>
              <BilingualText
                value={bi(
                  "Metric · Current Assessment · Coach Note",
                  "المؤشر · التقييم الحالي · ملاحظة المدرب"
                )}
              />
            </p>
            <button type="button">
              <BilingualText value={bi("Preview Evaluation", "معاينة التقييم")} />
            </button>
          </article>
          <article>
            <MessageSquareText />
            <h3>
              <BilingualText value={bi("Feedback", "الملاحظات")} />
            </h3>
            <p>
              <BilingualText
                value={bi(
                  "Structured strengths and focus areas for the player record.",
                  "نقاط قوة ومجالات تركيز منظمة لسجل اللاعب."
                )}
              />
            </p>
            <button type="button">
              <BilingualText value={bi("Preview Feedback", "معاينة الملاحظات")} />
            </button>
          </article>
        </section>
        <div className="od-coach-program-strip">
          <Target />
          <BilingualText value={bi("Programs", "البرامج")} />
          <span>
            <BilingualText
              value={bi(
                "Training context preview only — no changes are saved.",
                "معاينة لسياق التدريب فقط — لا يتم حفظ أي تغييرات."
              )}
            />
          </span>
          <ArrowRight />
        </div>
      </main>
    </div>
  );
}
