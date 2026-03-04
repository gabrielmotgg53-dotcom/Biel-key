"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, Key, Plus, Activity, RefreshCw, Trash2, CheckCircle2, Copy } from "lucide-react";

interface KeyData {
  id: string;
  keyString: string;
  tier: "Lifetime" | "Monthly" | "Weekly" | "Daily" | "Custom";
  createdAt: number;
  status: "Unused" | "Active" | "Expired" | "Revoked";
  expiresInHours?: number | null;
  activatedAt?: number | null;
  expiresAt?: number | null;
  customValue?: number;
  usedBy?: string | null;
}

export default function Dashboard() {
  const router = useRouter();
  const [keys, setKeys] = useState<KeyData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTier, setSelectedTier] = useState<KeyData["tier"]>("Daily");
  const [customNum, setCustomNum] = useState<number>(1);
  const [amount, setAmount] = useState<number>(1);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/generate");
      const data = await res.json();
      setKeys(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleLogout = () => {
    document.cookie = "bielmenu_auth=; Max-Age=0; path=/";
    router.push("/login");
  };

  const handleCreateKey = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: selectedTier,
          amount: amount,
          customValue: selectedTier === "Custom" ? customNum : undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.keys) {
        setKeys((prev) => [...data.keys, ...prev]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateRandomKey = (tier: string) => {
    // Legacy frontend generator removed; keys are generated entirely in backend.
  };

  const revokeKey = async (id: string) => {
    try {
      const res = await fetch("/api/generate", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "revoke" }),
      });
      const data = await res.json();
      if (data.success) {
        setKeys(keys.map(k => k.id === id ? data.key : k));
      }
    } catch (e) {
      console.error("Failed to revoke key", e);
    }
  };

  const copyKey = (keyString: string) => {
    navigator.clipboard.writeText(keyString);
  };

  const deleteKey = async (id: string) => {
    // Delete is still simulated since it's an extreme action, revoke is better
    setKeys(keys.filter(k => k.id !== id));
  };

  const activeKeysCount = keys.filter(k => k.status === "Active").length;
  const todayKeysCount = keys.filter(k =>
    new Date(k.createdAt).toDateString() === new Date().toDateString()
  ).length;

  if (loadingInitial) {
    return <div className="min-h-screen flex items-center justify-center bg-biel-bg"><RefreshCw className="animate-spin text-biel-blue" size={32} /></div>;
  }

  return (
    <div className="min-h-screen bg-biel-bg text-gray-100 flex flex-col font-sans">
      <nav className="glass sticky top-0 z-50 w-full px-6 py-4 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-4">
          <Image src="/BielMenu.png" alt="Logo" width={120} height={40} className="h-10 w-auto drop-shadow-[0_0_8px_rgba(40,130,255,0.8)]" />
          <h1 className="text-xl font-bold tracking-tight text-white hidden sm:block">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">Welcome, <span className="text-white font-medium">Fabri129</span></span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg transition-colors border border-red-500/20"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-biel-surface border border-biel-border p-5 rounded-xl shadow-lg relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 bg-biel-blue/10 p-4 rounded-full group-hover:bg-biel-blue/20 transition-colors">
                <Activity size={48} className="text-biel-blue/20" />
              </div>
              <p className="text-gray-400 text-sm font-medium mb-1">Keys Today</p>
              <h3 className="text-3xl font-bold text-white">{todayKeysCount}</h3>
            </div>
            <div className="bg-biel-surface border border-biel-border p-5 rounded-xl shadow-lg relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 bg-[#00ff88]/10 p-4 rounded-full group-hover:bg-[#00ff88]/20 transition-colors">
                <CheckCircle2 size={48} className="text-[#00ff88]/20" />
              </div>
              <p className="text-gray-400 text-sm font-medium mb-1">Active Keys</p>
              <h3 className="text-3xl font-bold text-white">{activeKeysCount}</h3>
            </div>
          </div>

          <div className="bg-biel-surface border border-biel-border p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-biel-blue/20 p-2 rounded-lg">
                <Plus size={20} className="text-biel-blue" />
              </div>
              <h2 className="text-lg font-bold text-white">Generate Key</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Key Tier</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["Lifetime", "Monthly", "Weekly", "Daily", "Custom"] as const).map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setSelectedTier(tier)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedTier === tier
                        ? "bg-biel-blue text-white shadow-[0_0_10px_rgba(40,130,255,0.4)]"
                        : "bg-[#1a1a1a] text-gray-400 hover:text-white border border-transparent hover:border-[#333]"
                        } ${tier === "Custom" ? "col-span-2" : ""}`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              {selectedTier === "Custom" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm text-gray-400 mb-2">Custom Value (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    value={customNum}
                    onChange={(e) => setCustomNum(parseInt(e.target.value) || 1)}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-white outline-none focus:border-biel-blue"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-2">Quantidade de Keys</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-white outline-none focus:border-biel-blue"
                />
              </div>

              <button
                onClick={handleCreateKey}
                disabled={isGenerating}
                className="w-full mt-4 bg-white text-black hover:bg-gray-200 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed border-none"
              >
                {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : <Key size={18} />}
                {isGenerating ? "Generating Server Key..." : "Deploy New Key"}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-biel-surface border border-biel-border rounded-xl shadow-lg flex flex-col overflow-hidden">
          <div className="p-6 border-b border-biel-border flex justify-between items-center bg-[#151515]">
            <h2 className="text-lg font-bold text-white">Cloud Keys</h2>
            <span className="text-xs font-semibold bg-[#222] text-gray-400 px-3 py-1 rounded-full border border-[#333]">
              {keys.length} Total
            </span>
          </div>

          <div className="flex-1 overflow-auto p-2">
            {keys.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 py-12">
                <Key size={48} className="mb-4 opacity-20" />
                <p>No keys generated yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {keys.map((key) => (
                  <div key={key.id} className="p-4 backdrop-blur-md bg-white/5 border border-white/10 rounded-xl relative overflow-hidden flex flex-col sm:flex-row gap-4 sm:items-center justify-between group hover:bg-white/10 transition-all shadow-lg">
                    {/* Linha indicadora lateral */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${key.status === "Active" ? "bg-[#00ff88]" :
                      key.status === "Unused" ? "bg-biel-blue" :
                        key.status === "Expired" ? "bg-orange-500" : "bg-red-500"
                      }`} />

                    <div className="flex-1 min-w-0 pl-2">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${key.status === "Active" ? "bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20" :
                          key.status === "Unused" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                            key.status === "Expired" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                              "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}>
                          {key.status}
                        </span>
                        <span className="text-xs bg-[#222] text-gray-300 px-2 py-0.5 rounded border border-[#333]">
                          {key.tier} {key.customValue ? `(${key.customValue}h)` : ""}
                        </span>
                        {key.status === "Active" && key.usedBy && (
                          <div className="flex items-center gap-1.5 bg-[#151515] px-2 py-0.5 rounded-full border border-biel-blue/30 ml-2">
                            <div className="w-4 h-4 rounded-full bg-biel-blue flex items-center justify-center text-[8px] font-bold text-white shadow-[0_0_5px_rgba(40,130,255,0.6)]">
                              {key.usedBy.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs text-gray-200 font-medium truncate max-w-[100px]">{key.usedBy}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-sm text-biel-blue font-mono bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 select-all">
                          {key.keyString}
                        </code>
                        <button
                          onClick={() => copyKey(key.keyString)}
                          className="p-1.5 bg-[#222] hover:bg-biel-blue hover:text-white text-gray-400 rounded-md transition-colors"
                          title="Copiar Key"
                        >
                          <Copy size={14} />
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs">
                        <span className="text-gray-400 font-medium">
                          <strong className="text-gray-300">Criada:</strong> {new Date(key.createdAt).toLocaleString()}
                        </span>

                        <span className="text-gray-400 font-medium flex-1">
                          <strong className="text-gray-300">Expira:</strong> {" "}
                          {key.status === 'Active' && key.expiresAt ? (
                            <span className="text-orange-400 font-medium">
                              {new Date(key.expiresAt).toLocaleString()}
                            </span>
                          ) : key.status === 'Active' && !key.expiresAt ? (
                            <span className="text-[#00ff88] font-medium">
                              Lifetime (Infinito)
                            </span>
                          ) : key.status === 'Unused' && key.expiresInHours ? (
                            <span className="text-gray-400">
                              {
                                key.expiresInHours === 24 ? "1 Dia" :
                                  key.expiresInHours === 168 ? "1 Semana" :
                                    key.expiresInHours === 720 ? "1 Mês" :
                                      `${key.expiresInHours}h`
                              } após ativação
                            </span>
                          ) : key.status === 'Unused' && !key.expiresInHours ? (
                            <span className="text-gray-400">Lifetime (Infinito)</span>
                          ) : (
                            <span className="text-red-400">Expirada / Revogada</span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      {key.status === "Active" && (
                        <button
                          onClick={() => revokeKey(key.id)}
                          className="px-3 py-2 rounded-lg bg-[#222] text-orange-400 hover:bg-orange-500/20 border border-orange-500/20 transition-colors flex items-center gap-2 text-sm font-semibold"
                        >
                          <LogOut size={16} /> Revogar
                        </button>
                      )}

                      <button
                        onClick={() => deleteKey(key.id)}
                        className="px-3 py-2 rounded-lg bg-[#222] text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors flex items-center gap-2 text-sm font-semibold"
                      >
                        <Trash2 size={16} /> Apagar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
