import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { formatCurrency, handleImageError } from "../../lib/utils";
import { api } from "../../services/api";

export function CharityDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [charity, setCharity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/charities/${slug}`)
      .then((res) => {
        setCharity(res.data.charity);
      })
      .catch(() => {
        // Fallback demo data
        setCharity({
          name: "HeartGuard Foundation",
          slug: "heartguard-foundation",
          tagline: "Pioneering cardiovascular research and emergency AED care equipment.",
          description: "HeartGuard delivers state-of-the-art automated external defibrillators (AEDs) to sports facilities across the nation while funding clinical prevention.",
          category: "Medical & Health",
          heroImageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80",
          totalRaised: 48250,
          events: [
            {
              title: "Annual Invitational Charity Golf Classic",
              date: "October 15, 2026",
              location: "Pebble Point Links, CA",
              goal: 25000,
              description: "18-hole scramble tournament with pros, banquet, and auction.",
            },
          ],
        });
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="text-center py-24 text-slate-400">Loading charity profile...</div>;
  }

  if (!charity) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Charity Not Found</h2>
        <Link to="/charities">
          <Button size="sm">Back to Directory</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <Link
        to="/charities"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Charity Directory
      </Link>

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-white/[0.1] h-72 md:h-96">
        <img
          src={charity.heroImageUrl}
          alt={charity.name}
          loading="lazy"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          onError={handleImageError}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070A12] via-[#070A12]/40 to-transparent" />
        
        <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="slate" size="sm">{charity.category}</Badge>
              {charity.isSpotlight && (
                <Badge variant="gold" size="sm">
                  <Sparkles className="w-3 h-3 fill-[#FFB020]" />
                  Spotlight Partner
                </Badge>
              )}
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              {charity.name}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl">
              {charity.tagline}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to={`/donate?charity=${charity._id}`}>
              <Button variant="secondary" size="md">Direct Donation</Button>
            </Link>
            <Link to={`/signup?charity=${charity._id}`}>
              <Button size="md">Select as My Charity</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <Card className="p-8 space-y-6">
            <h2 className="text-2xl font-bold text-white">About the Mission</h2>
            <p className="text-slate-300 text-base leading-relaxed">
              {charity.description}
            </p>
          </Card>

          {charity.events?.length > 0 && (
            <Card className="p-8 space-y-6 border-[#00F5A0]/20">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="emerald" size="sm" className="mb-2">Official Event</Badge>
                  <h2 className="text-2xl font-bold text-white">
                    {charity.events[0].title}
                  </h2>
                </div>
                <span className="font-mono font-bold text-lg text-[#00F5A0]">
                  {formatCurrency(charity.events[0].goal)} Target
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#070A12] border border-white/[0.08] text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-4 h-4 text-[#00F5A0]" />
                  <span>Date: {charity.events[0].date}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-[#00F5A0]" />
                  <span>Location: {charity.events[0].location}</span>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Impact Snapshot</h3>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-xs text-slate-400 block mb-1">Total Funds Directed</span>
              <span className="text-2xl font-extrabold font-mono text-[#00F5A0]">
                {formatCurrency(charity.totalRaised)}
              </span>
            </div>
            <Link to={`/signup?charity=${charity._id}`} className="block">
              <Button size="lg" className="w-full">Choose This Charity</Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
