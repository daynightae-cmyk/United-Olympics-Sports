import { Bell, Globe, LogOut, Monitor, RotateCcw, Settings, ShieldCheck, Type, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParents } from '../../../admin/data/adminHooks';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { clearParentSession, readParentSession, startParentPreview } from '../../../portals/parent/parentData';
import { useUiSettings } from '../../../ui/theme/useUiSettings';

const PREF_KEY='uos:parent-portal:preferences:v1';
type Prefs={schedule:boolean;messages:boolean;billing:boolean};
const defaults:Prefs={schedule:true,messages:true,billing:true};
function loadPrefs():Prefs{if(typeof window==='undefined')return defaults;try{const value=JSON.parse(localStorage.getItem(PREF_KEY)??'{}') as Partial<Prefs>;return{schedule:typeof value.schedule==='boolean'?value.schedule:true,messages:typeof value.messages==='boolean'?value.messages:true,billing:typeof value.billing==='boolean'?value.billing:true}}catch{return defaults}}

export function ParentPortalSettingsPage(){
  const session=readParentSession();
  const navigate=useNavigate();
  const {data:parentResult,loading:parentsLoading}=useParents({page:1,pageSize:500});
  const parents=parentResult.items.filter(parent=>parent.status==='active');
  const {appearance,bilingualOrder,density,motion,fontScale,setAppearance,setSetting,resetSettings}=useUiSettings();
  const [prefs,setPrefs]=useState<Prefs>(()=>loadPrefs());
  const [familyId,setFamilyId]=useState(session?.parentId??'');

  useEffect(()=>{
    if(!parents.length)return;
    if(!parents.some(parent=>parent.id===familyId))setFamilyId(parents[0].id);
  },[familyId,parents]);

  const savePrefs=(next:Prefs)=>{setPrefs(next);try{localStorage.setItem(PREF_KEY,JSON.stringify(next))}catch{/* local preference storage may be unavailable */}};
  const setLanguage=(lang:'en'|'ar')=>{setSetting('bilingualOrder',lang==='ar'?'ar-first':'en-first');document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr'};
  const switchFamily=()=>{if(!familyId)return;startParentPreview(familyId);navigate('/parent',{replace:true})};
  const reset=()=>{resetSettings();savePrefs(defaults)};
  const logout=()=>{clearParentSession();navigate('/parent/login',{replace:true})};

  return <div className="parent-page"><section className="parent-hero"><div className="parent-hero-row"><div><span className="parent-kicker"><Settings size={18}/><BilingualText value={bi('Family Portal Preferences','تفضيلات بوابة الأسرة')}/></span><h1><BilingualText value={bi('Settings','الإعدادات')}/></h1><p><BilingualText value={bi('Display and local signal preferences are stored on this browser. They do not configure server-side delivery or account security.','يتم حفظ تفضيلات العرض والإشارات المحلية في هذا المتصفح. ولا تقوم بتهيئة إرسال الخادم أو أمان الحساب.')}/></p></div><span className="parent-scope"><ShieldCheck size={12}/><BilingualText value={bi('Device-local settings','إعدادات محلية للجهاز')}/></span></div></section>

    <div className="parent-grid-2">
      <Card icon={<Globe size={16}/>} title={bi('Language & direction','اللغة واتجاه العرض')}><div className="parent-grid-2"><Choice active={bilingualOrder==='en-first'} onClick={()=>setLanguage('en')} label="English · الإنجليزية"/><Choice active={bilingualOrder==='ar-first'} onClick={()=>setLanguage('ar')} label="العربية · Arabic"/></div></Card>
      <Card icon={<Monitor size={16}/>} title={bi('Appearance','المظهر')}><div className="parent-grid-3">{(['system','dark','light'] as const).map(value=><Choice key={value} active={appearance===value} onClick={()=>setAppearance(value)} label={value==='system'?'System · النظام':value==='dark'?'Dark · داكن':'Light · فاتح'}/>)}</div></Card>
      <Card icon={<Type size={16}/>} title={bi('Reading experience','تجربة القراءة')}><div className="parent-field-grid"><SelectField label={bi('Density','الكثافة')} value={density} onChange={value=>setSetting('density',value as typeof density)} options={[["comfortable",'Comfortable · مريح'],['compact','Compact · مضغوط']]}/><SelectField label={bi('Motion','الحركة')} value={motion} onChange={value=>setSetting('motion',value as typeof motion)} options={[["system",'System · النظام'],['reduced','Reduced · مخففة']]}/><SelectField label={bi('Text size','حجم النص')} value={fontScale} onChange={value=>setSetting('fontScale',value as typeof fontScale)} options={[["default",'Default · افتراضي'],['large','Large · كبير']]}/></div></Card>
      <Card icon={<Bell size={16}/>} title={bi('Local signal preferences','تفضيلات الإشارات المحلية')}><div className="parent-list"><Toggle checked={prefs.schedule} onChange={value=>savePrefs({...prefs,schedule:value})} label={bi('Schedule record signals','إشارات سجلات الجدول')}/><Toggle checked={prefs.messages} onChange={value=>savePrefs({...prefs,messages:value})} label={bi('Provider message signals','إشارات رسائل موفر البيانات')}/><Toggle checked={prefs.billing} onChange={value=>savePrefs({...prefs,billing:value})} label={bi('Billing record signals','إشارات سجلات الدفع')}/></div><div className="parent-truth" style={{marginTop:12}}><Bell size={13}/><BilingualText value={bi('These toggles do not claim push, SMS or email delivery.','هذه المفاتيح لا تعني وجود إرسال Push أو SMS أو بريد إلكتروني.')}/></div></Card>
      <Card icon={<UsersRound size={16}/>} title={bi('Preview family','أسرة المعاينة')}><label className="parent-form-field"><span><BilingualText value={bi('Active provider family','سجل الأسرة النشط لدى الموفر')}/></span><select disabled={parentsLoading||!parents.length} value={familyId} onChange={event=>setFamilyId(event.target.value)}>{parents.map(parent=><option key={parent.id} value={parent.id}>{parent.nameEn} · {parent.nameAr}</option>)}</select></label>{!parentsLoading&&!parents.length?<div className="parent-truth" style={{marginTop:12}}><UsersRound size={13}/><BilingualText value={bi('No active Parent provider records are available.','لا توجد سجلات أولياء أمور نشطة لدى موفر البيانات.')}/></div>:<button type="button" className="parent-primary-action" disabled={!familyId} style={{marginTop:12}} onClick={switchFamily}><BilingualText value={bi('Switch preview family','تبديل أسرة المعاينة')}/></button>}</Card>
      <Card icon={<ShieldCheck size={16}/>} title={bi('Session controls','إدارة الجلسة')}><p style={{fontSize:11,color:'#94a3b8',lineHeight:1.8}}><BilingualText value={bi('Production password, MFA and recovery controls are unavailable until authentication is connected.','إعدادات كلمة المرور وMFA والاسترداد للإنتاج غير متاحة حتى يتم ربط المصادقة.')}/></p><div className="parent-actions"><button type="button" className="parent-secondary-action" onClick={reset}><RotateCcw size={14}/><BilingualText value={bi('Reset local preferences','إعادة ضبط التفضيلات المحلية')}/></button><button type="button" className="parent-secondary-action" onClick={logout} style={{color:'#fca5a5',borderColor:'rgba(239,68,68,.22)'}}><LogOut size={14}/><BilingualText value={bi('Sign out','تسجيل الخروج')}/></button></div></Card>
    </div>
  </div>;
}
function Card({icon,title,children}:{icon:React.ReactNode;title:{en:string;ar:string};children:React.ReactNode}){return <section className="parent-panel"><div className="parent-panel-head"><div><span className="parent-kicker">{icon}<BilingualText value={title}/></span></div></div><div style={{marginTop:14}}>{children}</div></section>}
function Choice({active,onClick,label}:{active:boolean;onClick:()=>void;label:string}){return <button type="button" onClick={onClick} className={active?'parent-primary-action':'parent-secondary-action'} aria-pressed={active}>{label}</button>}
function Toggle({checked,onChange,label}:{checked:boolean;onChange:(value:boolean)=>void;label:{en:string;ar:string}}){return <label className="parent-list-row" style={{cursor:'pointer'}}><strong><BilingualText value={label}/></strong><input type="checkbox" checked={checked} onChange={event=>onChange(event.target.checked)} style={{width:17,height:17,accentColor:'#d4af37'}}/></label>}
function SelectField({label,value,onChange,options}:{label:{en:string;ar:string};value:string;onChange:(value:string)=>void;options:Array<[string,string]>}){return <label className="parent-form-field"><span><BilingualText value={label}/></span><select value={value} onChange={event=>onChange(event.target.value)}>{options.map(([id,text])=><option value={id} key={id}>{text}</option>)}</select></label>}
