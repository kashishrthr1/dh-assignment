import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { FadeIn } from "../../components/motion/FadeIn";
import {
  Heart,
  Plus,
  Star,
  Edit,
  Globe,
  DollarSign,
  Calendar,
} from "lucide-react";

interface CharityItem {
  _id: string;
  name: string;
  slug: string;
  category: string;
  shortDescription: string;
  websiteUrl?: string;
  totalRaised: number;
  isSpotlight: boolean;
  golfDays?: any[];
}

export function AdminCharitiesPage() {
  const [charities, setCharities] = useState<CharityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New / Edit Charity Form
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("community");
  const [shortDescription, setShortDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isSpotlight, setIsSpotlight] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchCharities = async () => {
    try {
      const res = await api.get("/charities");
      setCharities(res.data.charities || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharities();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setCategory("community");
    setShortDescription("");
    setWebsiteUrl("");
    setIsSpotlight(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (c: CharityItem) => {
    setEditingId(c._id);
    setName(c.name);
    setSlug(c.slug);
    setCategory(c.category);
    setShortDescription(c.shortDescription);
    setWebsiteUrl(c.websiteUrl || "");
    setIsSpotlight(c.isSpotlight || false);
    setModalOpen(true);
  };

  const handleToggleSpotlight = async (c: CharityItem) => {
    try {
      await api.put(`/charities/${c._id}`, { isSpotlight: !c.isSpotlight });
      setMessage({ type: "success", text: `Updated spotlight status for ${c.name}.` });
      fetchCharities();
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update spotlight." });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const payload = {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      category,
      shortDescription,
      websiteUrl,
      isSpotlight,
    };

    try {
      if (editingId) {
        await api.put(`/charities/${editingId}`, payload);
        setMessage({ type: "success", text: "Charity updated successfully." });
      } else {
        await api.post("/charities", payload);
        setMessage({ type: "success", text: "New charity partner created." });
      }
      setModalOpen(false);
      fetchCharities();
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.message || "Operation failed." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">
              Charity Partners & Spotlights
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Onboard verified charity partners, adjust featured spotlight status, and inspect total contributions.
            </p>
          </div>

          <Button variant="primary" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-2" /> Add Partner Charity
          </Button>
        </div>
      </FadeIn>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm border ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Charities List */}
      <FadeIn delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {charities.map((c) => (
            <Card key={c._id} className="p-6 bg-[#0d131a] border-[#1a2330] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <Badge variant={c.isSpotlight ? "gold" : "muted"}>
                    {c.isSpotlight ? "Featured Spotlight" : c.category}
                  </Badge>

                  <button
                    onClick={() => handleToggleSpotlight(c)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      c.isSpotlight
                        ? "text-amber-400 hover:text-slate-400"
                        : "text-slate-500 hover:text-amber-400"
                    }`}
                    title="Toggle spotlight"
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-white font-display mb-1">{c.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-3 mb-4">{c.shortDescription}</p>
              </div>

              <div className="pt-4 border-t border-[#1a2330] space-y-3">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Funds Generated:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    £{c.totalRaised?.toLocaleString() || "0"}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-mono">{c.golfDays?.length || 0} golf days scheduled</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(c)}
                  >
                    <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </FadeIn>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d131a] border border-[#1a2330] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold font-display text-white">
              {editingId ? "Edit Partner Charity" : "Add New Partner Charity"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Charity Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Prostate Cancer UK"
                  className="w-full px-4 py-2.5 bg-[#151e29] border border-[#1f2c3d] rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="prostate-cancer-uk"
                    className="w-full px-4 py-2.5 bg-[#151e29] border border-[#1f2c3d] rounded-xl text-white font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#151e29] border border-[#1f2c3d] rounded-xl text-white"
                  >
                    <option value="health">Health & Medical</option>
                    <option value="youth_sports">Youth & Sports</option>
                    <option value="environment">Environment & Wildlife</option>
                    <option value="community">Community Welfare</option>
                    <option value="veterans">Veterans Support</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Short Mission Statement
                </label>
                <textarea
                  required
                  rows={3}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Summary of their charitable impact..."
                  className="w-full px-4 py-2.5 bg-[#151e29] border border-[#1f2c3d] rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 bg-[#151e29] border border-[#1f2c3d] rounded-xl text-white font-mono text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="spotlight"
                  checked={isSpotlight}
                  onChange={(e) => setIsSpotlight(e.target.checked)}
                  className="accent-amber-400 w-4 h-4 rounded"
                />
                <label htmlFor="spotlight" className="text-slate-300 text-xs cursor-pointer">
                  Feature as Spotlight Partner on Public Landing Page
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1a2330]">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={submitting}>
                  {editingId ? "Save Changes" : "Create Charity"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
