import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Heart, ExternalLink, Calendar, MapPin, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { formatCurrency, handleImageError } from "../../lib/utils";
import { api } from "../../services/api";

const INITIAL_CHARITIES = [
  {
    _id: "1",
    name: "HeartGuard Foundation",
    slug: "heartguard-foundation",
    tagline: "Pioneering cardiovascular research and emergency cardiac care equipment.",
    category: "Medical & Health",
    heroImageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    isSpotlight: true,
    totalRaised: 48250,
    events: [
      {
        title: "Annual Invitational Charity Golf Classic",
        date: "Oct 15, 2026",
        location: "Pebble Point Links",
        goal: 25000,
      },
    ],
  },
  {
    _id: "2",
    name: "Junior Fairways Initiative",
    slug: "junior-fairways",
    tagline: "Empowering underprivileged youth through mentorship, education, and sport.",
    category: "Youth & Education",
    heroImageUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=800&q=80",
    isSpotlight: false,
    totalRaised: 31800,
    events: [
      {
        title: "NextGen Pro-Am Scramble",
        date: "Nov 04, 2026",
        location: "St. Andrews Valley",
        goal: 15000,
      },
    ],
  },
  {
    _id: "3",
    name: "Green Canopy Alliance",
    slug: "green-canopy",
    tagline: "Reforesting wetlands and revitalizing community ecosystem biodiversity.",
    category: "Environment",
    heroImageUrl: "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80",
    isSpotlight: false,
    totalRaised: 22400,
    events: [
      {
        title: "Earth Day Charity Cup",
        date: "Sep 28, 2026",
        location: "Bayside Country Club",
        goal: 10000,
      },
    ],
  },
  {
    _id: "4",
    name: "Veteran Hope Network",
    slug: "veteran-hope",
    tagline: "Comprehensive mental health, rehabilitation, and peer reintegration for veterans.",
    category: "Veterans & Families",
    heroImageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
    isSpotlight: false,
    totalRaised: 64100,
    events: [
      {
        title: "Honor & Valor Masters Cup",
        date: "Nov 11, 2026",
        location: "National Golf Club",
        goal: 50000,
      },
    ],
  },
];

const CATEGORIES = ["All", "Medical & Health", "Youth & Education", "Environment", "Veterans & Families"];

export function CharitiesPage() {
  const [charities, setCharities] = useState<any[]>(INITIAL_CHARITIES);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    api
      .get("/charities")
      .then((res) => {
        if (res.data?.charities?.length > 0) {
          setCharities(res.data.charities);
        }
      })
      .catch(() => {
        // Fallback to initial seed
      });
  }, []);

  const filteredCharities = charities.filter((charity) => {
    const matchesSearch =
      charity.name.toLowerCase().includes(search.toLowerCase()) ||
      charity.tagline.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || charity.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="emerald" size="md">Vetted Non-Profit Directory</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Choose Your Cause. Fuel Their Mission.
        </h1>
        <p className="text-base text-slate-400">
          Every active Digital Heroes subscription directly powers verified non-profits. Select your charity when signing up, or contribute via one-off donations anytime.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0D1322] border border-white/[0.08]">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search charities or missions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl glass-input placeholder:text-slate-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-[#00F5A0] text-[#070A12] shadow-md shadow-[#00F5A0]/20"
                  : "bg-white/[0.05] text-slate-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredCharities.map((charity) => (
          <Card
            key={charity._id || charity.slug}
            className="overflow-hidden border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                <img
                  src={charity.heroImageUrl}
                  alt={charity.name}
                  loading="lazy"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  onError={handleImageError}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D1322] via-transparent to-transparent" />
                
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <Badge variant="slate" size="sm">{charity.category}</Badge>
                  {charity.isSpotlight && (
                    <Badge variant="gold" size="sm">
                      <Sparkles className="w-3 h-3 fill-[#FFB020]" />
                      Spotlight
                    </Badge>
                  )}
                </div>

                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-[#070A12]/80 backdrop-blur-md border border-white/[0.1] text-xs font-mono font-bold text-[#00F5A0]">
                  {formatCurrency(charity.totalRaised)} Raised
                </div>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-white group-hover:text-[#00F5A0] transition-colors">
                  {charity.name}
                </h3>
                <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">
                  {charity.tagline}
                </p>

                {charity.events?.length > 0 && (
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs space-y-1">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-[#00F5A0]" />
                      <span className="font-semibold text-white">
                        {charity.events[0].title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 pl-5">
                      <MapPin className="w-3 h-3" />
                      <span>{charity.events[0].location} &bull; {charity.events[0].date}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-white/[0.06] mt-4 flex items-center justify-between gap-3">
              <Link
                to={`/charities/${charity.slug}`}
                className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1"
              >
                <span>Read Full Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <div className="flex items-center gap-2">
                <Link to={`/donate?charity=${charity._id}`}>
                  <Button variant="outline" size="sm">Donate Now</Button>
                </Link>
                <Link to={`/signup?charity=${charity._id}`}>
                  <Button size="sm">Select Charity</Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
