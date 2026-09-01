import React from 'react';
import { Logo } from '../brand/Logo';
import { Phone, Mail, MapPin, Shield, ExternalLink, Sparkles, MessageCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  const canonicalWhatsAppUrl = "https://wa.me/971503281920?text=Hello%20Eng.%20Sadek%20Elgazar%2C%20I%20would%20like%20to%20start%20a%20new%20project%20with%20KNOuX.%20%7C%20%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D9%85.%20%D8%B5%D8%A7%D8%AF%D9%82%20%D8%A7%D9%84%D8%AC%D8%B2%D8%A7%D8%B1%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%A7%D9%84%D8%A8%D8%AF%D8%A1%20%D9%81%D9%8A%20%D9%85%D8%B4%D8%B1%D9%88%D8%B9%20%D8%AC%D8%AF%D9%8A%D8%AF%20%D9%85%D8%B9%20KNOuX.";

  return (
    <footer className="bg-[#050508] border-t border-amber-500/20 text-zinc-400 text-sm mt-16 relative overflow-hidden">
      {/* Background Subtle Gold Shimmer */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Philosophy */}
          <div className="space-y-4">
            <Logo size="md" />
            <p className="text-xs text-zinc-400 leading-relaxed">
              International athletic development ecosystem. Building future Olympic champions through scientific methodologies, biomechanics, and discipline across UAE and Egypt.
            </p>
            <p className="text-xs font-arabic text-amber-300/80 leading-relaxed" dir="rtl">
              المنظومة الرياضية الرائدة لإعداد وصناعة أبطال المستقبل الأولمبي في دولة الإمارات العربية المتحدة ومصر وفق أعلى المعايير العلمية الدولية.
            </p>
          </div>

          {/* Col 2: Dynamic Campuses & Locations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Olympic Campuses • الفروع والمجمعات</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="p-2 rounded bg-zinc-900/60 border border-zinc-800">
                <div className="font-semibold text-zinc-200">Abu Dhabi Hub (Al Falah & Khalifa)</div>
                <div className="font-arabic text-[11px] text-zinc-400">أبوظبي (الفلاح • مدينة خليفة) - الإمارات</div>
              </li>
              <li className="p-2 rounded bg-zinc-900/60 border border-zinc-800">
                <div className="font-semibold text-zinc-200">Cairo Olympic City (New Capital)</div>
                <div className="font-arabic text-[11px] text-zinc-400">مدينة مصر الأولمبية - العاصمة الإدارية</div>
              </li>
              <li className="p-2 rounded bg-zinc-900/60 border border-zinc-800">
                <div className="font-semibold text-zinc-200">Sheikh Zayed & New Cairo Zones</div>
                <div className="font-arabic text-[11px] text-zinc-400">الشيخ زايد والتجمع الخامس</div>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Direct Hotlines */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>Official Hotlines • التواصل المباشر</span>
            </h4>
            <div className="space-y-2 text-xs">
              <a
                href={canonicalWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40 transition"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-bold">WhatsApp Direct Line</div>
                    <div className="text-[10px] font-arabic">الخط المباشر واتساب</div>
                  </div>
                </div>
                <span className="font-mono text-xs">+971 50 328 1920</span>
              </a>

              <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-zinc-300">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold">Official Inquiries:</span>
                </div>
                <span className="font-mono text-xs text-amber-200">admissions@unitedolympicsports.store</span>
              </div>
            </div>
          </div>

          {/* Col 4: Olympic Accreditations & Standards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Accreditation • الاعتمادات الدولية</span>
            </h4>
            <div className="p-3 rounded-xl bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/30 text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-200 font-semibold">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Certified Olympic Standard Curriculum</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Standardized youth pathways in Swimming, Football, Basketball, Tennis, Karate & Gymnastics.
              </p>
              <div className="font-arabic text-[11px] text-amber-300/80" dir="rtl">
                معتمد رسمياً وفق المعايير الأولمبية العالمية لتطوير الرياضيين الصاعدين.
              </div>
            </div>
          </div>
        </div>

        {/* Mandatory Canonical Author & Engineering Attribution Bar */}
        <div className="pt-8 border-t border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
              <span>© 2026 United Olympics Sports • يونايتد أوليمبيكس سبورت. All rights reserved.</span>
            </div>
            <div className="text-[11px] text-zinc-500 font-arabic">
              من الطفولة نصنع الأبطال • From Childhood, We Build Champions
            </div>
          </div>

          {/* Special Author & Engineering Stamp */}
          <a
            id="developer-whatsapp-credit"
            href={canonicalWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-3 rounded-2xl bg-gradient-to-r from-zinc-900 via-amber-950/30 to-zinc-900 border border-amber-500/40 hover:border-amber-400 transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.15)] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] flex flex-col sm:flex-row items-center gap-3 cursor-pointer"
          >
            <div className="flex flex-col items-start text-xs">
              <div className="flex items-center gap-1.5 text-amber-200">
                <span className="text-zinc-400">Crafted by</span>
                <span className="font-extrabold text-amber-400 tracking-wider">KNOuX</span>
                <span className="text-zinc-500">•</span>
                <span className="font-bold text-amber-300">Eng. Sadek Elgazar</span>
              </div>
              <div className="font-arabic text-[11px] text-amber-300/80 mt-0.5" dir="rtl">
                صُمم وطُوّر بواسطة KNOuX • م. صادق الجزار
              </div>
            </div>

            <div className="h-6 w-px bg-amber-500/40 hidden sm:block" />

            <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-black flex items-center gap-1.5 group-hover:scale-105 transition-transform shadow">
              <MessageCircle className="w-3.5 h-3.5 fill-black" />
              <span>Start a New Project | ابدأ مشروعًا جديدًا</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </div>
          </a>
        </div>
      </div>
    </footer>
  );
};
