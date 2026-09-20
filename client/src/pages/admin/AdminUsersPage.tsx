import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { FadeIn } from "../../components/motion/FadeIn";
import {
  Users,
  Search,
  Shield,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle,
  FileSpreadsheet,
} from "lucide-react";

interface UserItem {
  _id: string;
  email: string;
  fullName: string;
  role: "subscriber" | "admin";
  subscriptionStatus: "active" | "inactive" | "past_due" | "canceled";
  subscriptionTier?: "monthly" | "yearly";
  charityPercentage: number;
  createdAt: string;
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [userScores, setUserScores] = useState<any[]>([]);
  const [loadingScores, setLoadingScores] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Edit score state
  const [editingScore, setEditingScore] = useState<any | null>(null);
  const [correctedValue, setCorrectedValue] = useState<number>(36);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInspectScores = async (user: UserItem) => {
    setSelectedUser(user);
    setLoadingScores(true);
    try {
      const res = await api.get(`/scores?userId=${user._id}`);
      setUserScores(res.data.scores || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingScores(false);
    }
  };

  const handleUpdateScore = async () => {
    if (!editingScore) return;
    try {
      await api.put(`/scores/${editingScore._id}/admin`, {
        stablefordScore: correctedValue,
      });
      setMessage({ type: "success", text: "Score successfully audited and updated." });
      setEditingScore(null);
      if (selectedUser) {
        handleInspectScores(selectedUser);
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to update score." });
    }
  };

  const handleToggleStatus = async (user: UserItem) => {
    const nextStatus = user.subscriptionStatus === "active" ? "inactive" : "active";
    try {
      await api.put(`/admin/users/${user._id}`, {
        subscriptionStatus: nextStatus,
      });
      setMessage({ type: "success", text: `Updated ${user.fullName} status to ${nextStatus}.` });
      fetchUsers();
    } catch (err: any) {
      setMessage({ type: "error", text: "Failed to update user." });
    }
  };

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">
              Subscriber Directory & Score Audit
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Search subscribers, manage subscription states, and audit logged Stableford scores.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#0d131a] border border-[#1a2330] rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>
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

      {/* Users Table */}
      <FadeIn delay={0.1}>
        <Card className="p-6 bg-[#0d131a] border-[#1a2330]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#1a2330] text-xs text-slate-400 uppercase">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Subscription</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4">Charity %</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a2330]">
                {filtered.map((u) => (
                  <tr key={u._id} className="hover:bg-[#151e29]/40">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{u.fullName}</div>
                      <div className="text-xs text-slate-400 font-mono">{u.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={u.role === "admin" ? "amber" : "muted"}>
                        {u.role.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={u.subscriptionStatus === "active" ? "emerald" : "rose"}>
                        {u.subscriptionStatus.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 capitalize text-slate-300">
                      {u.subscriptionTier || "Monthly"}
                    </td>
                    <td className="py-3 px-4 font-mono text-rose-400 font-semibold">
                      {u.charityPercentage || 20}%
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs font-mono">
                      {new Date(u.createdAt).toLocaleDateString("en-GB")}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInspectScores(u)}
                      >
                        Audit Scores
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(u)}
                      >
                        Toggle Status
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </FadeIn>

      {/* Score Audit Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d131a] border border-[#1a2330] rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#1a2330] pb-3">
              <div>
                <h3 className="text-lg font-bold text-white font-display">
                  Scorecard Audit: {selectedUser.fullName}
                </h3>
                <p className="text-xs text-slate-400 font-mono">{selectedUser.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </Button>
            </div>

            {loadingScores ? (
              <div className="py-8 text-center text-slate-400">Loading rounds...</div>
            ) : userScores.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm">
                No scores recorded by this subscriber.
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {userScores.map((s, idx) => (
                  <div
                    key={s._id}
                    className="p-3.5 rounded-xl bg-[#151e29] border border-[#1f2c3d] flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold font-mono text-white">
                          {s.stablefordScore} pts
                        </span>
                        {idx < 5 && <Badge variant="emerald">Active Ticket</Badge>}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Played: {new Date(s.date).toLocaleDateString("en-GB")} • {s.courseName || "No course specified"}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingScore(s);
                        setCorrectedValue(s.stablefordScore);
                      }}
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" /> Correct
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Score Submodal */}
      {editingScore && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0d131a] border border-amber-500/40 rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h4 className="font-bold text-white text-base">Administrative Score Override</h4>
            <p className="text-xs text-slate-400">
              Update the verified score for round on {new Date(editingScore.date).toLocaleDateString("en-GB")}.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                Corrected Stableford Score (1 - 45)
              </label>
              <input
                type="number"
                min={1}
                max={45}
                value={correctedValue}
                onChange={(e) => setCorrectedValue(Number(e.target.value))}
                className="w-full px-4 py-2 bg-[#151e29] border border-[#1f2c3d] rounded-xl text-white font-mono font-bold text-xl text-center"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingScore(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleUpdateScore}
              >
                Save Correction
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
