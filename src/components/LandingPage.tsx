'use client'
import { useState } from 'react'
import Link from 'next/link'

const features = [
  {
    icon: '📋',
    title: 'Manajemen Order',
    desc: 'Catat pesanan pelanggan dalam hitungan detik. Lengkap dengan nama, nomor HP, layanan, dan berat cucian.',
  },
  {
    icon: '🔄',
    title: 'Tracking Status Real-time',
    desc: 'Lacak setiap cucian dari Masuk → Proses → Selesai → Diambil. Kasir bisa update status langsung dari aplikasi.',
  },
  {
    icon: '📊',
    title: 'Dashboard Analitik',
    desc: 'Lihat total order dan pendapatan hari ini sekilas. Statistik per status cucian langsung di beranda.',
  },
  {
    icon: '⚙️',
    title: 'Kelola Layanan Fleksibel',
    desc: 'Atur harga per kilogram atau per satuan (sepatu, selimut, bed cover). Aktifkan atau nonaktifkan sewaktu-waktu.',
  },
  {
    icon: '👥',
    title: 'Multi Pengguna',
    desc: 'Role Admin dan Kasir dengan akses terpisah. Admin bisa kelola layanan & pengguna, kasir fokus input order.',
  },
  {
    icon: '🌐',
    title: 'Berbasis Web, Akses Dari Mana Saja',
    desc: 'Tidak perlu install aplikasi. Buka dari HP, tablet, atau komputer — selama ada internet, bisnis tetap jalan.',
  },
]

const steps = [
  { num: '1', title: 'Daftar & Pilih Paket', desc: 'Pilih paket yang sesuai kebutuhan laundry kamu. Proses aktivasi cepat, langsung bisa dipakai.' },
  { num: '2', title: 'Setup Layanan & Harga', desc: 'Masukkan daftar layanan laundry beserta harganya. Admin mengatur, kasir langsung bisa pilih saat input order.' },
  { num: '3', title: 'Mulai Terima Order', desc: 'Kasir input order pelanggan, update status cucian, dan bisnis berjalan lebih rapi dari hari pertama.' },
]

const plans = [
  {
    name: 'Starter',
    price: '149.000',
    period: '/bulan',
    desc: 'Cocok untuk laundry rumahan atau baru buka',
    features: [
      '2 akun kasir',
      'Semua fitur order & tracking',
      'Dashboard analitik harian',
      'Kelola layanan & harga',
      'Support via WhatsApp',
    ],
    cta: 'Mulai Sekarang',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '299.000',
    period: '/bulan',
    desc: 'Untuk laundry yang sudah berkembang',
    features: [
      'Unlimited akun kasir',
      'Semua fitur Starter',
      'Multi outlet (segera hadir)',
      'Laporan pendapatan bulanan',
      'Priority support',
    ],
    cta: 'Pilih Pro',
    highlight: true,
  },
  {
    name: 'Lifetime',
    price: '1.999.000',
    period: '/sekali bayar',
    desc: 'Bayar sekali, pakai selamanya',
    features: [
      'Unlimited akun kasir',
      'Semua fitur Pro',
      'Update fitur gratis selamanya',
      'Onboarding & setup gratis',
      'Dedicated support',
    ],
    cta: 'Beli Lifetime',
    highlight: false,
  },
]

const faqs = [
  {
    q: 'Apakah bisa dicoba dulu sebelum beli?',
    a: 'Hubungi kami via WhatsApp untuk mendapatkan akses demo 7 hari gratis. Tidak perlu kartu kredit.',
  },
  {
    q: 'Data laundry saya aman?',
    a: 'Data disimpan di server Railway dengan database PostgreSQL yang terisolasi. Kami tidak pernah mengakses data bisnis kamu.',
  },
  {
    q: 'Bisa dipakai di HP?',
    a: 'Ya, Z Laundry berbasis web dan responsif. Bisa diakses dari HP, tablet, maupun komputer tanpa install apapun.',
  },
  {
    q: 'Bagaimana cara bayar?',
    a: 'Tersedia transfer bank (BCA, Mandiri, BRI, BNI) dan QRIS. Setelah pembayaran dikonfirmasi, akun langsung aktif.',
  },
  {
    q: 'Apakah ada biaya setup?',
    a: 'Tidak ada biaya setup untuk paket Starter dan Pro. Paket Lifetime sudah termasuk onboarding gratis.',
  },
]

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-base">🧺</div>
            <span className="font-bold text-gray-900">Z Laundry</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#harga" className="text-sm text-gray-600 hover:text-gray-900 hidden sm:block">Harga</a>
            <a href="#faq" className="text-sm text-gray-600 hover:text-gray-900 hidden sm:block">FAQ</a>
            <Link href="/login"
              className="text-sm px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              Masuk
            </Link>
            <a href="https://wa.me/6281234567890?text=Halo,%20saya%20ingin%20tahu%20lebih%20lanjut%20tentang%20Z%20Laundry"
              target="_blank" rel="noopener noreferrer"
              className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Hubungi Kami
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Dipercaya oleh laundry di seluruh Indonesia
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight">
            Aplikasi POS Laundry<br />
            <span className="text-blue-200">Simpel & Profesional</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Catat order, lacak status cucian, dan pantau pendapatan — semua dalam satu aplikasi web yang bisa dipakai dari HP maupun komputer.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#harga"
              className="px-8 py-3.5 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors text-sm">
              Lihat Paket Harga →
            </a>
            <a href="https://wa.me/6281234567890?text=Halo,%20saya%20ingin%20coba%20demo%20Z%20Laundry"
              target="_blank" rel="noopener noreferrer"
              className="px-8 py-3.5 bg-white/10 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors text-sm">
              Coba Demo Gratis
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="relative max-w-4xl mx-auto px-4 pb-12">
          <div className="bg-white/10 border border-white/20 rounded-2xl p-6 grid grid-cols-3 gap-4 text-center">
            {[
              { val: '500+', label: 'Order diproses' },
              { val: '50+', label: 'Laundry aktif' },
              { val: '99.9%', label: 'Uptime server' },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-2xl md:text-3xl font-bold">{s.val}</div>
                <div className="text-blue-200 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fitur */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Semua yang Kamu Butuhkan</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Dirancang khusus untuk kebutuhan kasir laundry sehari-hari. Mudah dipakai, tidak perlu pelatihan panjang.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cara Kerja */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Mulai dalam 3 Langkah</h2>
            <p className="text-gray-500">Tidak perlu setup rumit. Laundry kamu bisa berjalan dalam hitungan menit.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {s.num}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-full w-full h-0.5 bg-gray-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview App */}
      <section className="py-16 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Tampilan Bersih, Mudah Dipakai</h2>
          <p className="text-gray-400 mb-10">Desain minimalis yang nyaman dipakai kasir seharian tanpa pusing.</p>
          <div className="bg-gray-700 rounded-2xl p-4 border border-gray-600 shadow-2xl max-w-3xl mx-auto">
            <div className="flex gap-1.5 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <div className="flex">
                <div className="w-40 bg-white border-r border-gray-200 p-3 hidden sm:block">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-blue-600 rounded-md" />
                    <div className="text-xs font-bold text-gray-800">Z Laundry</div>
                  </div>
                  {['📊 Dashboard', '👕 Order & Status'].map((item, i) => (
                    <div key={i} className={`text-xs px-2 py-1.5 rounded-md mb-1 ${i === 1 ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-500'}`}>{item}</div>
                  ))}
                </div>
                <div className="flex-1 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="text-sm font-semibold text-gray-800">Order & Status Cucian</div>
                      <div className="text-xs text-gray-400">12 order ditampilkan</div>
                    </div>
                    <div className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg">+ Order Baru</div>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {['Semua', 'Masuk', 'Proses', 'Selesai'].map((tab, i) => (
                      <div key={i} className={`text-xs px-2.5 py-1 rounded-md ${i === 0 ? 'bg-blue-600 text-white' : 'text-gray-500 bg-gray-100'}`}>{tab}</div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {[
                      { nama: 'Ibu Wati', layanan: 'Reguler (2 hari)', total: 'Rp 35.000', status: 'Proses', color: 'bg-yellow-100 text-yellow-700' },
                      { nama: 'Pak Rudi', layanan: 'Express (6 jam)', total: 'Rp 75.000', status: 'Masuk', color: 'bg-blue-100 text-blue-700' },
                      { nama: 'Nia Rahayu', layanan: 'Sepatu', total: 'Rp 20.000', status: 'Selesai', color: 'bg-green-100 text-green-700' },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-3 py-2">
                        <div>
                          <div className="text-xs font-medium text-gray-800">{row.nama}</div>
                          <div className="text-xs text-gray-400">{row.layanan}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-medium text-gray-800">{row.total}</div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${row.color}`}>{row.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Harga */}
      <section id="harga" className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Harga Transparan, Tanpa Biaya Tersembunyi</h2>
            <p className="text-gray-500">Pilih paket yang sesuai skala bisnis laundry kamu.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <div key={i} className={`rounded-2xl p-6 border-2 relative ${plan.highlight ? 'border-blue-600 bg-blue-600 text-white shadow-xl shadow-blue-200' : 'border-gray-200 bg-white'}`}>
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1 rounded-full">
                    ⭐ PALING POPULER
                  </div>
                )}
                <div className={`text-sm font-medium mb-1 ${plan.highlight ? 'text-blue-200' : 'text-gray-500'}`}>{plan.name}</div>
                <div className="flex items-end gap-1 mb-1">
                  <span className={`text-sm ${plan.highlight ? 'text-blue-200' : 'text-gray-400'}`}>Rp</span>
                  <span className="text-3xl font-bold">{plan.price}</span>
                </div>
                <div className={`text-sm mb-2 ${plan.highlight ? 'text-blue-200' : 'text-gray-400'}`}>{plan.period}</div>
                <div className={`text-sm mb-6 pb-6 border-b ${plan.highlight ? 'text-blue-100 border-blue-500' : 'text-gray-500 border-gray-100'}`}>
                  {plan.desc}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className={`flex items-start gap-2.5 text-sm ${plan.highlight ? 'text-blue-50' : 'text-gray-600'}`}>
                      <span className={`mt-0.5 flex-shrink-0 ${plan.highlight ? 'text-blue-200' : 'text-blue-600'}`}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href={`https://wa.me/6281234567890?text=Halo,%20saya%20mau%20berlangganan%20Z%20Laundry%20paket%20${plan.name}`}
                  target="_blank" rel="noopener noreferrer"
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${plan.highlight ? 'bg-white text-blue-600 hover:bg-blue-50' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-6">Butuh paket khusus untuk banyak outlet? <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Hubungi kami</a></p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Pertanyaan Umum</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  {faq.q}
                  <span className={`text-gray-400 transition-transform ml-4 flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Siap Rapikan Bisnis Laundry Kamu?</h2>
          <p className="text-blue-100 mb-8">Mulai dengan demo gratis 7 hari. Tidak perlu kartu kredit, tidak ada syarat tersembunyi.</p>
          <a href="https://wa.me/6281234567890?text=Halo,%20saya%20ingin%20coba%20demo%20gratis%20Z%20Laundry"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors text-sm">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.098.546 4.07 1.5 5.784L0 24l6.394-1.678A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.868 9.868 0 01-5.032-1.378l-.36-.214-3.742.981.998-3.648-.235-.374A9.867 9.867 0 012.118 12C2.118 6.55 6.55 2.118 12 2.118c5.451 0 9.882 4.432 9.882 9.882 0 5.451-4.431 9.882-9.882 9.882z"/>
            </svg>
            Chat WhatsApp Sekarang
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm">🧺</div>
            <span className="font-semibold text-white">Z Laundry</span>
            <span className="text-gray-600">·</span>
            <span className="text-sm">POS Laundry Modern</span>
          </div>
          <div className="text-sm text-center">
            © 2026 Z Laundry. Dibuat dengan ❤️ untuk pelaku usaha laundry Indonesia.
          </div>
          <Link href="/login" className="text-sm hover:text-white transition-colors">
            Login Aplikasi →
          </Link>
        </div>
      </footer>
    </div>
  )
}
