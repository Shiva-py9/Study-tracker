import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Calculator, Plus, Trash2, RefreshCw, TrendingUp, Target, Save, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CGPAPredictor() {
  const { userSettings, updateSettings } = useApp();
  const [pastSgpas, setPastSgpas] = useState<number[]>(userSettings.cgpaData?.pastSgpas || []);
  const [targetCgpa, setTargetCgpa] = useState<number>(userSettings.cgpaData?.targetCgpa || 8.5);
  const [totalSemesters, setTotalSemesters] = useState<number>(userSettings.cgpaData?.totalSemesters || 8);
  const [isEditing, setIsEditing] = useState(pastSgpas.length === 0);
  const [results, setResults] = useState<{ currentCgpa: string; requiredSgpa: string } | null>(null);

  useEffect(() => {
    if (userSettings.cgpaData) {
      setPastSgpas(userSettings.cgpaData.pastSgpas);
      setTargetCgpa(userSettings.cgpaData.targetCgpa);
      setTotalSemesters(userSettings.cgpaData.totalSemesters);
    }
  }, [userSettings.cgpaData]);

  const calculateResults = () => {
    const completedSemesters = pastSgpas.length;
    if (completedSemesters === 0) {
      toast.error('Please add at least one semester SGPA');
      return;
    }

    const sumSgpa = pastSgpas.reduce((a, b) => a + b, 0);
    const currentCgpa = sumSgpa / completedSemesters;
    const remainingSemesters = totalSemesters - completedSemesters;

    if (remainingSemesters <= 0) {
      setResults({
        currentCgpa: currentCgpa.toFixed(2),
        requiredSgpa: 'N/A'
      });
      setIsEditing(false);
      return;
    }

    const requiredSgpa = (targetCgpa * totalSemesters - sumSgpa) / remainingSemesters;
    
    setResults({
      currentCgpa: currentCgpa.toFixed(2),
      requiredSgpa: requiredSgpa.toFixed(2)
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      await updateSettings({
        cgpaData: {
          pastSgpas,
          targetCgpa,
          totalSemesters
        }
      });
      calculateResults();
      toast.success('CGPA data saved');
    } catch (err) {
      toast.error('Failed to save data');
    }
  };

  const addSemester = () => {
    if (pastSgpas.length >= totalSemesters) {
      toast.error('Cannot add more semesters than total');
      return;
    }
    setPastSgpas([...pastSgpas, 0]);
  };

  const updateSgpa = (index: number, value: string) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0 || num > 10) return;
    const newSgpas = [...pastSgpas];
    newSgpas[index] = num;
    setPastSgpas(newSgpas);
  };

  const removeSemester = (index: number) => {
    setPastSgpas(pastSgpas.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all CGPA data?')) {
      setPastSgpas([]);
      setTargetCgpa(8.5);
      setTotalSemesters(8);
      setResults(null);
      setIsEditing(true);
    }
  };

  const progressPercentage = results ? Math.min(100, (parseFloat(results.currentCgpa) / targetCgpa) * 100) : 0;

  return (
    <div className="space-y-8 pb-12 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bebas tracking-wider text-white">CGPA PREDICTOR</h2>
          <p className="text-gray-500 mt-1">Strategize your academic path. Predict your future scores.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 font-bold rounded-xl transition-all border border-white/10"
          >
            <RefreshCw className="w-4 h-4" />
            RESET
          </button>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20"
            >
              <Edit2 className="w-4 h-4" />
              EDIT VALUES
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/20"
            >
              <Calculator className="w-4 h-4" />
              PREDICT REQUIRED SGPA
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="editing"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white/5 border border-white/10 rounded-[40px] p-8 space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Target CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={targetCgpa}
                    onChange={e => setTargetCgpa(parseFloat(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Total Semesters</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={totalSemesters}
                    onChange={e => setTotalSemesters(parseInt(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Semester SGPAs</label>
                  <button
                    onClick={addSemester}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors border border-red-500/10"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {pastSgpas.map((sgpa, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-xs font-bold text-gray-500 border border-white/5">
                        S{index + 1}
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={sgpa}
                        onChange={e => updateSgpa(index, e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-red-500 transition-colors"
                        placeholder="SGPA"
                      />
                      <button
                        onClick={() => removeSemester(index)}
                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {pastSgpas.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm italic border-2 border-dashed border-white/5 rounded-3xl">
                      No semesters added. Click + to begin.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Current Status Card */}
              <div className="bg-white/5 border border-white/10 rounded-[40px] p-8">
                <h3 className="text-xl font-bebas tracking-widest text-white mb-8 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  CURRENT ACADEMIC STATUS
                </h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Current CGPA</div>
                    <div className="text-5xl font-bebas text-white tracking-wider">{results?.currentCgpa}</div>
                  </div>
                  <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Target CGPA</div>
                    <div className="text-5xl font-bebas text-red-500 tracking-wider">{targetCgpa.toFixed(2)}</div>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="flex justify-between items-end mb-3">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Progress to Target</div>
                    <div className="text-sm font-bold text-white">{Math.round(progressPercentage)}%</div>
                  </div>
                  <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 p-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Prediction Card */}
              <div className="bg-red-500/10 border border-red-500/20 rounded-[40px] p-8">
                <h3 className="text-xl font-bebas tracking-widest text-red-500 mb-6 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  THE PREDICTION
                </h3>
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm leading-relaxed">
                    To reach your target of <span className="text-white font-bold">{targetCgpa}</span>, you need to maintain an average SGPA of:
                  </p>
                  <div className="text-6xl font-bebas text-white tracking-tighter">
                    {results?.requiredSgpa}
                  </div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                    Across the remaining {totalSemesters - pastSgpas.length} semesters
                  </p>
                  
                  {parseFloat(results?.requiredSgpa || '0') > 10 && (
                    <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl">
                      <p className="text-xs text-red-400 font-bold uppercase tracking-wider">
                        ⚠️ Warning: Target might be mathematically impossible (Required SGPA &gt; 10)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info/Visual Section */}
        <div className="space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-[40px] p-8">
            <h3 className="text-xl font-bebas tracking-widest text-white mb-6">SEMESTER BREAKDOWN</h3>
            <div className="space-y-4">
              {pastSgpas.map((sgpa, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="text-[10px] font-bold text-gray-500 w-8">S{i + 1}</div>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${sgpa * 10}%` }}
                      className="h-full bg-blue-500/50"
                    />
                  </div>
                  <div className="text-xs font-bold text-white w-8 text-right">{sgpa.toFixed(2)}</div>
                </div>
              ))}
              {pastSgpas.length === 0 && (
                <div className="text-center py-12 text-gray-600 text-sm uppercase tracking-widest font-bebas">
                  Awaiting Data Input
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 rounded-[40px] p-8">
            <h3 className="text-xl font-bebas tracking-widest text-white mb-4">HOW IT WORKS</h3>
            <ul className="space-y-3 text-xs text-gray-400 leading-relaxed">
              <li className="flex gap-2">
                <span className="text-blue-500 font-bold">01.</span>
                Calculates your current CGPA based on completed semesters.
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500 font-bold">02.</span>
                Determines the total grade points needed to hit your target.
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500 font-bold">03.</span>
                Distributes the remaining points across your future semesters.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
