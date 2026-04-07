import React, { useState, useEffect } from 'react';
import { settingsService } from '../../services/api';
import { toast } from 'react-hot-toast';
import { Save, RotateCcw, AlertTriangle, ShieldCheck, Info } from 'lucide-react';

const ThresholdSettings = () => {
  const [thresholds, setThresholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedIds, setEditedIds] = useState(new Set());

  const fetchThresholds = async () => {
    setLoading(true);
    try {
      const res = await settingsService.getThresholds();
      setThresholds(res.data);
    } catch (err) {
      toast.error('Failed to load thresholds');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThresholds();
  }, []);

  const handleChange = (id, field, value) => {
    setThresholds(prev => prev.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
    setEditedIds(prev => new Set(prev).add(id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const toUpdate = thresholds.filter(t => editedIds.has(t.id));
      await settingsService.bulkUpdateThresholds(toUpdate);
      toast.success('Thresholds updated successfully');
      setEditedIds(new Set());
    } catch (err) {
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const resetChanges = () => {
    fetchThresholds();
    setEditedIds(new Set());
  };

  if (loading) {
    return <div className="flex items-center justify-center p-12 text-slate-400">Loading configurations...</div>;
  }

  const domains = [...new Set(thresholds.map(t => t.domain))];

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Alert Thresholds</h3>
          <p className="text-sm text-slate-400">Configure sensitivity for automatic alert generation</p>
        </div>
        <div className="flex gap-3">
          {editedIds.size > 0 && (
            <>
              <button 
                onClick={resetChanges}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                <RotateCcw size={16} /> Discard
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {domains.map(domain => (
          <div key={domain} className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="bg-slate-800/50 px-6 py-3 border-b border-slate-800 flex items-center gap-2">
              <span className="uppercase tracking-widest text-[10px] font-bold text-indigo-400">{domain} Intelligence</span>
            </div>
            <div className="divide-y divide-slate-800">
              {thresholds.filter(t => t.domain === domain).map(t => (
                <div key={t.id} className="p-6 hover:bg-slate-800/30 transition-colors group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-200">{t.alert_name}</h4>
                        {t.severity === 'critical' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20 uppercase">Critical</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20 uppercase">Warning</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">{t.description}</p>
                    </div>

                    <div className="flex items-center gap-4 min-w-[200px]">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Trigger Threshold</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={t.threshold_value}
                            onChange={(e) => handleChange(t.id, 'threshold_value', parseFloat(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-indigo-400 font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 font-bold uppercase">{t.unit}</span>
                        </div>
                      </div>
                      <div className="flex items-center self-end pb-1.5 h-10">
                        {editedIds.has(t.id) && <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-glow shadow-indigo-500/50"></div>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex gap-3 text-sm text-slate-400 leading-relaxed">
        <Info size={18} className="text-indigo-400 shrink-0" />
        <p>Changes to thresholds will retroactively update existing alert statuses and influence real-time triggers. Ensure your targets align with industry benchmarks for accurate performance monitoring.</p>
      </div>
    </div>
  );
};

export default ThresholdSettings;
