import { Link } from "react-router-dom";
import { Sparkles, Trophy, Heart, ArrowRight, ShieldCheck, Zap, Users, Calendar } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { AnimatedNumber } from "../../components/motion/AnimatedNumber";
import { FadeIn } from "../../components/motion/FadeIn";
import { handleImageError } from "../../lib/utils";

export function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-[#00F5A0]/10 via-[#00D2FF]/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] bg-[#FFB020]/5 blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <FadeIn delay={0.1}>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs text-slate-300 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-[#00F5A0] animate-pulse" />
                  <span className="font-semibold text-white">Next Monthly Draw:</span>
                  <span className="text-[#00F5A0]">October 31 &bull; Rollover Active</span>
                </div>
              </FadeIn>

              <FadeIn delay={0.2}>
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
                  Play your game. <br />
                  <span className="text-gradient-emerald">Win the pot.</span> <br />
                  <span className="text-gradient-gold">Fund real change.</span>
                </h1>
              </FadeIn>

              <FadeIn delay={0.3}>
                <p className="text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                  Digital Heroes merges athletic performance with a monthly lottery engine and direct social impact. Log your 5 Stableford scores, enter the draw with accumulating jackpots, and direct a minimum 10% of every fee to vetted charities.
                </p>
              </FadeIn>

              <FadeIn delay={0.4}>
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
                  <Link to="/signup" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto text-base px-8 h-14">
                      <span>Start Your Membership</span>
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/how-it-works" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto text-base h-14">
                      <span>How It Works</span>
                    </Button>
                  </Link>
                </div>
              </FadeIn>

              {/* Trust Indicators */}
              <FadeIn delay={0.5}>
                <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#00F5A0]" />
                    <span>Provably Fair Draw Logic</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#FF4D6D]" />
                    <span>10% Min Charity Allocation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[#FFB020]" />
                    <span>Jackpot Rollover Protected</span>
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Right Live Pot Widget Column */}
            <div className="lg:col-span-5">
              <FadeIn delay={0.3}>
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#00F5A0]/20 via-[#FFB020]/20 to-[#00D2FF]/20 rounded-3xl blur-xl" />
                  
                  <Card className="relative bg-[#0D1322]/90 border border-white/[0.12] p-6 sm:p-8 backdrop-blur-2xl">
                    <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                          Current Monthly Pool
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                            $<AnimatedNumber value={38450} />
                          </span>
                        </div>
                      </div>
                      <Badge variant="gold" size="md" className="animate-pulse">
                        <Sparkles className="w-3.5 h-3.5 fill-[#FFB020]" />
                        Rollover Added
                      </Badge>
                    </div>

                    <div className="py-6 space-y-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                        Estimated Tier Payouts
                      </span>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#FFB020]/15 text-[#FFB020] flex items-center justify-center font-bold text-xs">
                            5/5
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">5-Number Jackpot</div>
                            <div className="text-[11px] text-[#FFB020]">40% Pool + $8,200 Rollover</div>
                          </div>
                        </div>
                        <span className="text-base font-bold font-mono text-[#FFB020]">
                          $23,580
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#00F5A0]/15 text-[#00F5A0] flex items-center justify-center font-bold text-xs">
                            4/5
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">4-Number Tier</div>
                            <div className="text-[11px] text-slate-400">35% Pool Allocation</div>
                          </div>
                        </div>
                        <span className="text-base font-bold font-mono text-[#00F5A0]">
                          $8,460
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#00D2FF]/15 text-[#00D2FF] flex items-center justify-center font-bold text-xs">
                            3/5
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">3-Number Tier</div>
                            <div className="text-[11px] text-slate-400">25% Pool Allocation</div>
                          </div>
                        </div>
                        <span className="text-base font-bold font-mono text-[#00D2FF]">
                          $6,410
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Heart className="w-4 h-4 text-[#FF4D6D] fill-[#FF4D6D]" />
                        <span>Raised for charities this cycle:</span>
                      </div>
                      <span className="font-bold text-white font-mono">
                        $<AnimatedNumber value={19225} />
                      </span>
                    </div>
                  </Card>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Live Statistics Strip */}
      <section className="border-y border-white/[0.08] bg-[#0D1322]/50 backdrop-blur-md py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                $<AnimatedNumber value={214500} />
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">
                Total Charity Impact
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#00F5A0] font-mono">
                $<AnimatedNumber value={142900} />
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">
                Prizes Distributed
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                <AnimatedNumber value={3420} />+
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">
                Active Subscribers
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#00D2FF] font-mono">
                100%
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">
                Audited &amp; Verified
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Mechanics */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge variant="cyan" size="md">The Digital Heroes Loop</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            How Your Consistency Creates Change
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            A seamless three-step cycle transforming your score consistency into life-changing charitable support and monthly cash prizes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-8 relative group hover:border-[#00F5A0]/40 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-[#00F5A0]/10 text-[#00F5A0] flex items-center justify-center font-bold text-lg mb-6 border border-[#00F5A0]/20">
              01
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Log Your 5 Scores</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Enter your last 5 Stableford scores (1–45). Our intelligent rolling window automatically updates and rejects duplicate dates.
            </p>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs text-slate-300 flex items-center justify-between">
              <span className="text-slate-400">Rolling limit:</span>
              <span className="font-semibold text-white">Exactly 5 Scores</span>
            </div>
          </Card>

          <Card className="p-8 relative group hover:border-[#FFB020]/40 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-[#FFB020]/10 text-[#FFB020] flex items-center justify-center font-bold text-lg mb-6 border border-[#FFB020]/20">
              02
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Enter Monthly Draws</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Match 5, 4, or 3 distinct numbers to claim your share of the pool. Unclaimed 5-number jackpots roll forward.
            </p>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs text-slate-300 flex items-center justify-between">
              <span className="text-slate-400">Jackpot rollover:</span>
              <span className="font-semibold text-[#FFB020]">100% Preserved</span>
            </div>
          </Card>

          <Card className="p-8 relative group hover:border-[#00D2FF]/40 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-[#00D2FF]/10 text-[#00D2FF] flex items-center justify-center font-bold text-lg mb-6 border border-[#00D2FF]/20">
              03
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Power Your Charity</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Pick your cause from our vetted directory. At least 10% of your membership fee goes directly to them every month.
            </p>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs text-slate-300 flex items-center justify-between">
              <span className="text-slate-400">Mandatory minimum:</span>
              <span className="font-semibold text-[#00F5A0]">10% Direct Impact</span>
            </div>
          </Card>
        </div>
      </section>

      {/* Featured Spotlight Charity */}
      <section className="py-20 bg-gradient-to-b from-[#070A12] via-[#0D1322]/80 to-[#070A12] border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
            <div>
              <Badge variant="emerald" size="md" className="mb-3">Current Spotlight Partner</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                HeartGuard Foundation
              </h2>
              <p className="text-slate-400 text-base max-w-xl mt-2">
                Deploying life-saving automated external defibrillators (AEDs) across sports facilities while funding clinical cardiac prevention.
              </p>
            </div>
            <Link to="/charities">
              <Button variant="outline" size="md">
                Browse All Charities
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#0D1322] border border-white/[0.1] rounded-3xl p-6 sm:p-10">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#00F5A0]/10 text-[#00F5A0] border border-[#00F5A0]/20">
                  Category: Medical &amp; Health
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> 680+ Supporting Subscribers
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white">
                Upcoming: Annual Invitational Charity Golf Classic
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Join our headline golf tournament at Pebble Point Links this October. All proceeds match subscriber funds to outfit 50 regional sports clubs with emergency response medical kits.
              </p>

              <div className="pt-2 flex flex-wrap gap-4">
                <Link to="/signup">
                  <Button size="md">Select as My Charity</Button>
                </Link>
                <Link to="/donate">
                  <Button variant="secondary" size="md">Make One-Off Donation</Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative h-64 lg:h-80 rounded-2xl overflow-hidden border border-white/[0.1]">
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80"
                alt="HeartGuard Foundation Initiative"
                loading="lazy"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                onError={handleImageError}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge variant="gold" size="md">Transparent Pricing</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Simple Membership. Exponential Impact.
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Choose monthly flexibility or commit yearly to save ~17%. Both plans grant full access to monthly draws, the 5-score tracking engine, and direct charity support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="p-8 relative flex flex-col justify-between hover:border-white/20 transition-all">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Monthly Plan</h3>
                  <p className="text-xs text-slate-400">Flexibility to cancel anytime</p>
                </div>
                <Badge variant="slate" size="sm">Monthly</Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-white font-mono">$19</span>
                <span className="text-sm text-slate-400">/ month</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-[#00F5A0]" />
                  <span>Entry into every monthly draw</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-[#00F5A0]" />
                  <span>5-score rolling Stableford tracker</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-[#00F5A0]" />
                  <span>Min 10% ($1.90+/mo) to your chosen charity</span>
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <Link to="/signup?plan=monthly" className="block">
                <Button variant="outline" size="lg" className="w-full">Select Monthly</Button>
              </Link>
            </div>
          </Card>

          <Card className="p-8 relative flex flex-col justify-between border-[#00F5A0]/40 shadow-xl shadow-[#00F5A0]/10" glow="emerald">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Yearly Plan</h3>
                  <p className="text-xs text-[#00F5A0]">Best value &bull; Save ~17%</p>
                </div>
                <Badge variant="emerald" size="sm">17% Discount</Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-white font-mono">$189</span>
                <span className="text-sm text-slate-400">/ year</span>
                <span className="text-xs text-slate-500 font-mono">($15.75/mo eff.)</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-[#00F5A0]" />
                  <span>All 12 monthly draws guaranteed</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-[#00F5A0]" />
                  <span>Full year rolling score audit history</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-[#00F5A0]" />
                  <span>Min $18.90 direct charity contribution</span>
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <Link to="/signup?plan=yearly" className="block">
                <Button size="lg" className="w-full">Get Started Yearly</Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
