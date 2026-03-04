import { QRCodeSVG } from 'qrcode.react'

const BORDER_GREY = '#2D2D2D'
const VOUCHER_ID = 'OUT-BAD-001'

export function Events() {
  return (
    <div className="max-w-[960px] w-full mx-auto flex flex-col gap-8">
      {/* Title Section */}
      <div className="flex flex-col gap-2">
        <span className="text-primary font-bold tracking-widest text-xs uppercase">MATCH CONFIRMED</span>
        <h1 className="text-white text-4xl md:text-5xl font-black tracking-tight">Your Session is Ready</h1>
        <p className="text-slate-400 text-lg">
          Your badminton session has been fully funded by outdoor. See you there!
        </p>
      </div>

      {/* Main grid: Voucher + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Digital Voucher + Venue */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Voucher Card */}
          <div className="bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden shadow-2xl relative" style={{ borderColor: BORDER_GREY }}>
            <div className="h-2 w-full bg-primary" />
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center">
              {/* QR / barcode-style voucher */}
              <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-xl qr-glow shrink-0">
                <div className="w-40 h-40 rounded-lg overflow-hidden flex items-center justify-center bg-white p-2">
                  <QRCodeSVG
                    value={`#${VOUCHER_ID}`}
                    size={152}
                    level="M"
                    includeMargin={false}
                    className="w-full h-full"
                  />
                </div>
                <span className="text-slate-900 font-mono text-sm font-bold">#{VOUCHER_ID}</span>
              </div>
              <div className="flex flex-col gap-4 flex-1 min-w-0">
                <div className="flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined">verified</span>
                  <span className="text-sm font-bold uppercase tracking-widest">Platform Funded Voucher</span>
                </div>
                <h3 className="text-white text-2xl font-bold">Badminton Session</h3>
                <p className="text-slate-400 text-base leading-relaxed">
                  Present this digital voucher at the reception. All court fees are covered under your invitation.
                </p>
                <div className="flex flex-wrap gap-4 mt-2">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-[#0a0a0a] px-6 py-3 rounded-lg font-bold transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined">download</span>
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-primary/10 px-6 md:px-8 py-3 border-t border-white/5 flex flex-wrap justify-between items-center gap-2">
              <span className="text-primary text-xs font-bold uppercase tracking-tighter">Powered by outdoor</span>
              <span className="text-slate-500 text-xs">Valid until session date</span>
            </div>
          </div>

          {/* Venue Location */}
          <div className="bg-[#1A1A1A]/50 border border-white/5 rounded-xl p-6 flex flex-col gap-4" style={{ borderColor: BORDER_GREY }}>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">location_on</span>
              <h4 className="text-white font-bold">Venue Location</h4>
            </div>
            <div className="w-full h-48 rounded-lg bg-slate-800 relative overflow-hidden group">
              <div
                className="absolute inset-0 bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-500"
                style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}
              />
              <div className="absolute bottom-4 left-4 bg-[#1A1A1A]/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 text-xs text-slate-100">
                Select your venue in Matches
              </div>
            </div>
          </div>
        </div>

        {/* Right: Session Details + Help */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-6" style={{ borderColor: BORDER_GREY }}>
            <h3 className="text-white text-lg font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">info</span>
              Session Details
            </h3>
            <div className="space-y-6">
              <div className="flex flex-col gap-1">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Partner Venue</p>
                <p className="text-white text-sm font-semibold">Choose in Matches</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Primary Activity</p>
                <p className="text-white text-sm font-semibold">Badminton</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Date & Time</p>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs text-primary">calendar_today</span>
                  <p className="text-white text-sm font-semibold">Your match date</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs text-primary">schedule</span>
                  <p className="text-white text-sm font-semibold">TBD with partner</p>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Booking Status</p>
                <div className="flex items-center gap-2 text-emerald-500">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <p className="text-sm font-bold uppercase tracking-wide">Confirmed & Funded</p>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/5">
              <div className="bg-primary/5 rounded-lg p-4 flex gap-3 border border-primary/20">
                <span className="material-symbols-outlined text-primary">payments</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-primary">outdoor guarantee:</strong> You won&apos;t be charged for any
                  services included in this session package.
                </p>
              </div>
            </div>
          </div>

          {/* Need help */}
          <div className="bg-[#261a0d]/30 border border-primary/10 rounded-xl p-6">
            <h4 className="text-white text-sm font-bold mb-3">Need help?</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-slate-400 hover:text-primary text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">help_outline</span>
                  Venue entry instructions
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-primary text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">cancel</span>
                  Rescheduling policy
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-primary text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">support_agent</span>
                  Contact concierge
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
