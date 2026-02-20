export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden">
      {/* Main Hero */}
      <div
        className="relative py-12 md:py-20 text-white overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #7b1111 0%, #b71c1c 30%, #c62828 55%, #e65100 80%, #f57f17 100%)",
        }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-400 opacity-10 rounded-full -translate-y-1/3 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-orange-300 opacity-10 rounded-full translate-y-1/3 -translate-x-1/3"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-5 gap-8 items-center">
            <div className="md:col-span-3 space-y-5">
              <div className="inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400/40 rounded-full px-4 py-2 text-sm font-hind shimmer">
                🛕 কলম হিন্দু ধর্মসভা — ধর্ম, পূজা ও সংস্কৃতি
              </div>
              <h2 className="font-bengali text-4xl md:text-5xl font-black leading-tight">
                <span className="text-yellow-300">মায়ের আশীর্বাদে</span>
                <br />
                <span className="text-white">সকলের মঙ্গল হোক</span>
              </h2>
              <p className="font-hind text-base md:text-lg text-orange-100 leading-relaxed max-w-xl">
                দুর্গাপূজা, শ্যামাপূজা, সরস্বতী পূজা — সব পূজার মন্ত্র, বিধি, গান ও ছবি এক জায়গায়।
                কলম হিন্দু ধর্মসভার আনুষ্ঠানিক ওয়েবসাইটে স্বাগতম!
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="#mahatmya" className="bg-yellow-400 hover:bg-yellow-300 text-red-900 font-bold px-5 py-2.5 rounded-full font-hind shadow-lg hover:-translate-y-0.5 transition-all text-sm">
                  🪔 দুর্গাপূজা
                </a>
                <a href="#shyama" className="bg-white/20 hover:bg-white/30 text-white font-bold px-5 py-2.5 rounded-full font-hind border border-white/40 text-sm">
                  🌑 শ্যামাপূজা
                </a>
                <a href="#saraswati" className="bg-white/20 hover:bg-white/30 text-white font-bold px-5 py-2.5 rounded-full font-hind border border-white/40 text-sm">
                  🎵 সরস্বতী পূজা
                </a>
                <a href="#gallery" className="bg-white/20 hover:bg-white/30 text-white font-bold px-5 py-2.5 rounded-full font-hind border border-white/40 text-sm">
                  📷 ফটো গ্যালারি
                </a>
              </div>
            </div>

            {/* Right Cards */}
            <div className="md:col-span-2 flex justify-center">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { emoji: "🙏", title: "দুর্গাপূজা", sub: "শারদীয় উৎসব", color: "from-red-600/80 to-orange-600/80" },
                  { emoji: "🌑", title: "শ্যামাপূজা", sub: "কালীপূজা", color: "from-indigo-700/80 to-purple-700/80" },
                  { emoji: "🎵", title: "সরস্বতী পূজা", sub: "বিদ্যার দেবী", color: "from-yellow-600/80 to-orange-500/80" },
                  { emoji: "📷", title: "ফটো গ্যালারি", sub: "প্রতি বছরের ছবি", color: "from-pink-600/80 to-red-600/80" },
                ].map((card) => (
                  <div
                    key={card.title}
                    className={`bg-gradient-to-br ${card.color} backdrop-blur rounded-2xl p-4 text-center border border-white/20 float-anim cursor-pointer hover:scale-105 transition-transform`}
                  >
                    <div className="text-4xl mb-2">{card.emoji}</div>
                    <p className="font-bengali text-sm font-bold text-white leading-tight">{card.title}</p>
                    <p className="font-hind text-xs text-white/70 mt-0.5">{card.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60H1440V30C1200 0 960 60 720 30C480 0 240 60 0 30V60Z" fill="#fdf6ec" />
          </svg>
        </div>
      </div>

      {/* Quick Links Bar */}
      <div className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { emoji: "🪔", title: "দুর্গাপূজা", sub: "মন্ত্র ও মাহাত্ম্য", href: "#mahatmya" },
            { emoji: "🌑", title: "শ্যামাপূজা", sub: "কালীপূজার বিধান", href: "#shyama" },
            { emoji: "🎵", title: "সরস্বতী পূজা", sub: "বিদ্যার আরাধনা", href: "#saraswati" },
            { emoji: "📷", title: "ফটো গ্যালারি", sub: "২০১৮–২০২৫ সালের ছবি", href: "#gallery" },
          ].map((item) => (
            <a
              key={item.title}
              href={item.href}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 transition-all border border-transparent hover:border-orange-200 group"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-xl shrink-0 group-hover:bg-orange-200 transition-colors">
                {item.emoji}
              </div>
              <div>
                <p className="font-hind font-bold text-sm text-gray-800">{item.title}</p>
                <p className="font-hind text-xs text-gray-500">{item.sub}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
