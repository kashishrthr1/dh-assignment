import { Link } from "react-router-dom";
import { Sparkles, Heart, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#04060A] text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00F5A0] to-[#00D2FF] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#070A12] stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                DIGITAL<span className="text-[#00F5A0]">HEROES</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              The modern fintech platform transforming athletic consistency into community impact. Log your 5 Stableford scores, enter transparent monthly draws with rollover jackpots, and automatically fund vetted charities.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500 pt-2">
              <ShieldCheck className="w-4 h-4 text-[#00F5A0]" />
              <span>Audited Draw Engine &bull; Verified Charity Allocation &bull; Stripe Secured</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/how-it-works" className="hover:text-[#00F5A0] transition-colors">
                  How the Draw Works
                </Link>
              </li>
              <li>
                <Link to="/charities" className="hover:text-[#00F5A0] transition-colors">
                  Vetted Charities Directory
                </Link>
              </li>
              <li>
                <Link to="/donate" className="hover:text-[#00F5A0] transition-colors">
                  Direct Charity Donation
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-[#00F5A0] transition-colors">
                  Join Membership
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">Social Impact</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every active subscriber contributes a minimum of 10% of their subscription fee directly to their selected charity partner.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#00F5A0]/10 text-[#00F5A0] border border-[#00F5A0]/20">
                <Heart className="w-3.5 h-3.5 fill-[#00F5A0]" />
                100% Direct Passthrough
              </span>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>&copy; {new Date().getFullYear()} Digital Heroes. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Monthly Draw Rollover Enabled</span>
            <span>Non-gambling Skill &amp; Performance Based Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
