import { CreditCard, Languages, Mail, Phone, ShieldCheck, TrendingUp, UserRound, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { EnterpriseEmpty, EnterpriseKpi, EnterpriseProgress, EnterpriseStatus, EnterpriseTable, PreviewNotice } from '../../../components/enterprise/EnterpriseUI';
import { PortalPreviewCard, PortalSection } from '../../../components/portal/PortalUI';
import { useParentPortalGatewayData } from '../../../portals/parent/useParentPortalGatewayData';

const subscriptionTone = (status: string): 'active' | 'warning' | 'danger' | 'neutral' =>
  status === 'active' ? 'active' : status === 'pending' ? 'warning' : status === 'expired' ? 'danger' : 'neutral';

const paymentTone = (status: string): 'active' | 'warning' | 'danger' | 'neutral' =>
  status === 'completed' ? 'active' : status === 'pending' ? 'warning' : status === 'failed' ? 'danger' : 'neutral';

const subscriptionLabel = (status: string) => bi(
  status,
  status === 'active' ? 'نشط' : status === 'pending' ? 'قيد الانتظار' : status === 'expired' ? 'منتهٍ' : 'ملغي',
);

const paymentLabel = (status: string) => bi(
  status,
  status === 'completed' ? 'مكتمل' : status === 'pending' ? 'قيد الانتظار' : status === 'failed' ? 'فشل' : 'مسترد',
);

function FamilyUnavailable({ loading, error }: { loading: boolean; error: Error | null }) {
  if (loading) return <div className="enterprise-empty" role="status"><BilingualText value={bi('Loading family records…', 'جارٍ تحميل سجلات الأسرة…')} /></div>;
  if (error) return <div className="enterprise-empty" role="alert"><BilingualText value={bi('Family data provider is unavailable.', 'موفر بيانات الأسرة غير متاح.')} /></div>;
  return <EnterpriseEmpty title={bi('Family profile unavailable', 'ملف الأسرة غير متاح')} description={bi('The current Parent session no longer points to an active provider record. Sign in again from the Parent login page.', 'جلسة ولي الأمر الحالية لم تعد تشير إلى سجل متاح لدى موفر البيانات. سجّل الدخول مجددًا من صفحة دخول ولي الأمر.')} />;
}

export function ParentPortalPerformancePage() {
  const { parent, children, sports, loading, error } = useParentPortalGatewayData();
  if (!parent) return <FamilyUnavailable loading={loading} error={error} />;

  const measured = children.filter((child) => child.performanceScore !== null);
  const average = measured.length
    ? Math.round(measured.reduce((sum, child) => sum + (child.performanceScore ?? 0), 0) / measured.length)
    : null;

  return <div className="admin-page">
    <PageHeader
      icon={TrendingUp}
      eyebrow={bi('Parent Portal · Performance', 'بوابة ولي الأمر · الأداء')}
      title={bi('Children Performance', 'أداء الأبناء')}
      description={bi('Provider-backed performance and attendance summaries for the athletes linked to this family session.', 'ملخصات أداء وحضور مدفوعة بموفر البيانات للاعبين المرتبطين بجلسة الأسرة الحالية.')}
      actions={<PreviewNotice />}
    />

    <section className="enterprise-kpi-grid">
      <EnterpriseKpi icon={TrendingUp} tone="green" label={bi('Family average', 'متوسط الأسرة')} value={average === null ? '—' : `${average}/100`} detail={average === null ? bi('No measured scores', 'لا توجد درجات مقاسة') : bi('Current provider scores', 'درجات موفر البيانات الحالية')} />
      <EnterpriseKpi icon={UserRound} label={bi('Linked children', 'الأبناء المرتبطون')} value={children.length} detail={bi('Current family relationship', 'علاقة الأسرة الحالية')} />
      <EnterpriseKpi icon={ShieldCheck} tone="blue" label={bi('Measured profiles', 'الملفات المقاسة')} value={measured.length} detail={bi('Performance score available', 'درجة الأداء متاحة')} />
    </section>

    <PortalSection title={bi('Child development summaries', 'ملخصات تطور الأبناء')} description={bi('These values come from the shared provider view model. Detailed metric history remains unavailable until that contract is connected.', 'تأتي هذه القيم من نموذج العرض المشترك لموفر البيانات. يظل سجل المؤشرات التفصيلي غير متاح حتى يتم ربط هذا العقد.') }>
      {children.length ? <div className="portal-card-grid">{children.map((child) => {
        const sport = sports.find((item) => item.id === child.sportId);
        return <article className="portal-card" key={child.id}>
          <div className="child-card-head">
            <span className="portal-card-icon"><UserRound size={16} /></span>
            <div><h3>{child.nameEn}</h3><small lang="ar" dir="rtl">{child.nameAr}</small></div>
            <EnterpriseStatus label={child.status} tone="info" />
          </div>
          <p><BilingualText value={sport?.name ?? bi(child.sportId, child.sportId)} /></p>
          <div style={{ marginTop: 13 }}>
            {child.performanceScore === null
              ? <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 11 }}><BilingualText value={bi('Performance not measured yet', 'لم يتم قياس الأداء بعد')} /></p>
              : <EnterpriseProgress value={child.performanceScore} label={bi('Performance score', 'درجة الأداء')} color="green" />}
          </div>
          <p style={{ marginTop: 10 }}><BilingualText value={bi(`Attendance ${child.attendanceRate}%`, `الحضور ${child.attendanceRate}%`)} /></p>
          <Link className="admin-link-button" to={`/parent/children/${child.id}`}><BilingualText value={bi('Open child profile', 'فتح ملف الابن')} /></Link>
        </article>;
      })}</div> : <EnterpriseEmpty title={bi('No linked children', 'لا يوجد أبناء مرتبطون')} description={bi('Link an athlete to this parent profile from Admin first.', 'اربط لاعبًا بملف ولي الأمر من الإدارة أولًا.')} />}
    </PortalSection>
  </div>;
}

export function ParentPortalSubscriptionsPage() {
  const { parent, children, familySubscriptions, programs, branches, loading, error } = useParentPortalGatewayData();
  if (!parent) return <FamilyUnavailable loading={loading} error={error} />;
  const childName = (id: string) => {
    const child = children.find((item) => item.id === id);
    return child ? { en: child.nameEn, ar: child.nameAr } : bi(id, id);
  };

  return <div className="admin-page">
    <PageHeader icon={ShieldCheck} eyebrow={bi('Parent Portal · Subscriptions', 'بوابة ولي الأمر · الاشتراكات')} title={bi('Subscriptions', 'الاشتراكات')} description={bi('Membership records synchronized with the same provider used by Admin.', 'سجلات العضويات متزامنة مع نفس موفر البيانات المستخدم في الإدارة.')} actions={<PreviewNotice />} />
    <section className="enterprise-kpi-grid">
      <EnterpriseKpi icon={ShieldCheck} tone="green" label={bi('Active', 'نشط')} value={familySubscriptions.filter((item) => item.status === 'active').length} detail={bi('Current family plans', 'خطط الأسرة الحالية')} />
      <EnterpriseKpi icon={WalletCards} label={bi('Total records', 'إجمالي السجلات')} value={familySubscriptions.length} detail={bi('Linked athlete subscriptions', 'اشتراكات اللاعبين المرتبطين')} />
      <EnterpriseKpi icon={UserRound} tone="blue" label={bi('Covered children', 'الأبناء المشمولون')} value={new Set(familySubscriptions.map((item) => item.playerId)).size} detail={bi('Unique linked athletes', 'لاعبون مرتبطون فريدون')} />
    </section>

    <PortalSection title={bi('Family membership ledger', 'دفتر عضويات الأسرة')} description={bi('Read-only Parent view of provider records. Renewal and charging are not executed here.', 'عرض ولي أمر للقراءة فقط لسجلات موفر البيانات. لا يتم التجديد أو الخصم من هنا.') }>
      {familySubscriptions.length ? <EnterpriseTable caption={bi('Parent subscriptions', 'اشتراكات ولي الأمر')}><thead><tr>{[bi('Child', 'الطفل'), bi('Plan', 'الخطة'), bi('Program', 'البرنامج'), bi('Branch', 'الفرع'), bi('Start', 'البداية'), bi('End', 'النهاية'), bi('Amount', 'المبلغ'), bi('Status', 'الحالة')].map((label) => <th key={label.en}><BilingualText value={label} /></th>)}</tr></thead><tbody>{familySubscriptions.map((subscription) => <tr key={subscription.id}>
        <td><BilingualText value={childName(subscription.playerId)} /></td>
        <td><BilingualText value={subscription.plan} /></td>
        <td><BilingualText value={programs.find((item) => item.id === subscription.programId)?.name ?? bi(subscription.programId, subscription.programId)} /></td>
        <td><BilingualText value={branches.find((item) => item.id === subscription.branchId)?.name ?? bi(subscription.branchId, subscription.branchId)} /></td>
        <td>{subscription.startDate}</td><td>{subscription.endDate ?? '—'}</td>
        <td><strong>{subscription.amount} {subscription.currency}</strong></td>
        <td><EnterpriseStatus label={subscriptionLabel(subscription.status)} tone={subscriptionTone(subscription.status)} /></td>
      </tr>)}</tbody></EnterpriseTable> : <EnterpriseEmpty title={bi('No subscriptions', 'لا توجد اشتراكات')} description={bi('No provider subscription is linked to this family’s athletes.', 'لا يوجد اشتراك لدى موفر البيانات مرتبط بلاعبي هذه الأسرة.')} />}
    </PortalSection>
    <PortalPreviewCard title={bi('Billing boundary', 'حدود الفوترة')} description={bi('This screen does not renew plans, charge cards or contact a payment processor.', 'هذه الشاشة لا تجدد الخطط ولا تخصم من البطاقات ولا تتصل بمعالج دفع.')} />
  </div>;
}

export function ParentPortalPaymentsPage() {
  const { parent, children, familyPayments, loading, error } = useParentPortalGatewayData();
  if (!parent) return <FamilyUnavailable loading={loading} error={error} />;
  const childName = (id: string) => {
    const child = children.find((item) => item.id === id);
    return child ? { en: child.nameEn, ar: child.nameAr } : bi(id, id);
  };
  const visibleTotal = familyPayments.reduce((sum, payment) => sum + payment.amount, 0);

  return <div className="admin-page">
    <PageHeader icon={CreditCard} eyebrow={bi('Parent Portal · Payments', 'بوابة ولي الأمر · المدفوعات')} title={bi('Payments & References', 'المدفوعات والمراجع')} description={bi('Provider-backed family payment records without live settlement or invoice-delivery claims.', 'سجلات مدفوعات الأسرة من موفر البيانات دون ادعاء تسوية حية أو تسليم فواتير.')} actions={<PreviewNotice />} />
    <section className="enterprise-kpi-grid">
      <EnterpriseKpi icon={CreditCard} label={bi('Visible total', 'الإجمالي الظاهر')} value={`${visibleTotal.toFixed(2)} AED`} detail={bi('Provider ledger values', 'قيم دفتر موفر البيانات')} />
      <EnterpriseKpi icon={ShieldCheck} tone="green" label={bi('Completed', 'مكتمل')} value={familyPayments.filter((item) => item.status === 'completed').length} detail={bi('Recorded state', 'الحالة المسجلة')} />
      <EnterpriseKpi icon={WalletCards} tone="blue" label={bi('Payment records', 'سجلات الدفع')} value={familyPayments.length} detail={bi('Linked family records', 'سجلات الأسرة المرتبطة')} />
    </section>

    <PortalSection title={bi('Family payment ledger', 'دفتر مدفوعات الأسرة')} description={bi('These rows mirror the current provider records. No payment action is available in Parent Portal.', 'تعكس هذه الصفوف سجلات موفر البيانات الحالية. لا يتوفر إجراء دفع داخل بوابة ولي الأمر.') }>
      {familyPayments.length ? <EnterpriseTable caption={bi('Parent payment records', 'سجلات مدفوعات ولي الأمر')}><thead><tr>{[bi('Reference', 'المرجع'), bi('Child', 'الطفل'), bi('Amount', 'المبلغ'), bi('Method', 'الطريقة'), bi('Recorded at', 'وقت التسجيل'), bi('Status', 'الحالة')].map((label) => <th key={label.en}><BilingualText value={label} /></th>)}</tr></thead><tbody>{familyPayments.map((payment) => <tr key={payment.id}>
        <td><strong>{payment.reference ?? payment.id}</strong></td>
        <td><BilingualText value={childName(payment.playerId)} /></td>
        <td><strong>{payment.amount} {payment.currency}</strong></td>
        <td><BilingualText value={payment.method} /></td>
        <td>{payment.paidAt}</td>
        <td><EnterpriseStatus label={paymentLabel(payment.status)} tone={paymentTone(payment.status)} /></td>
      </tr>)}</tbody></EnterpriseTable> : <EnterpriseEmpty title={bi('No payments', 'لا توجد مدفوعات')} description={bi('No provider payment record is linked to this family’s athletes.', 'لا يوجد سجل دفع لدى موفر البيانات مرتبط بلاعبي هذه الأسرة.')} />}
    </PortalSection>
    <PortalPreviewCard title={bi('Payment boundary', 'حدود الدفع')} description={bi('Viewing a recorded payment does not charge, refund or contact any payment processor.', 'عرض دفعة مسجلة لا ينفذ خصمًا أو استردادًا ولا يتصل بأي معالج دفع.')} />
  </div>;
}

export function ParentPortalProfilePage() {
  const { parent, children, loading, error } = useParentPortalGatewayData();
  if (!parent) return <FamilyUnavailable loading={loading} error={error} />;

  return <div className="admin-page">
    <PageHeader icon={UserRound} eyebrow={bi('Parent Portal · Profile', 'بوابة ولي الأمر · الملف')} title={bi('Family Profile', 'ملف الأسرة')} description={bi('The current parent identity and contact fields as stored by the shared provider.', 'هوية ولي الأمر وحقول التواصل الحالية كما يخزنها موفر البيانات المشترك.')} actions={<PreviewNotice />} />
    <section className="enterprise-kpi-grid">
      <EnterpriseKpi icon={UserRound} label={bi('Linked children', 'الأبناء المرتبطون')} value={children.length} detail={bi('Current provider relationship', 'علاقة موفر البيانات الحالية')} />
      <EnterpriseKpi icon={Languages} tone="blue" label={bi('Preferred language', 'اللغة المفضلة')} value={parent.preferredLanguage === 'ar' ? 'العربية' : 'English'} detail={bi('Communication preference', 'تفضيل التواصل')} />
      <EnterpriseKpi icon={ShieldCheck} tone="green" label={bi('Profile status', 'حالة الملف')} value={parent.status === 'active' ? 'Active' : 'Inactive'} detail={bi('Provider status', 'حالة موفر البيانات')} />
    </section>

    <PortalSection title={bi('Identity & contact', 'الهوية والتواصل')} description={bi('Read-only Parent view. Profile editing remains an Admin/provider operation until account self-service is connected.', 'عرض ولي أمر للقراءة فقط. يظل تعديل الملف عملية إدارة/موفر بيانات حتى يتم ربط الخدمة الذاتية للحساب.') }>
      <div className="portal-card-grid">
        <article className="portal-card"><span className="portal-card-icon"><UserRound size={18} /></span><h3>{parent.nameEn}</h3><p lang="ar" dir="rtl">{parent.nameAr}</p><small>{parent.id}</small></article>
        <article className="portal-card"><span className="portal-card-icon"><Phone size={18} /></span><h3><BilingualText value={bi('Phone', 'الهاتف')} /></h3><p>{parent.phone?.trim() || '—'}</p></article>
        <article className="portal-card"><span className="portal-card-icon"><Mail size={18} /></span><h3><BilingualText value={bi('Email', 'البريد الإلكتروني')} /></h3><p>{parent.email?.trim() || '—'}</p></article>
      </div>
    </PortalSection>
  </div>;
}
