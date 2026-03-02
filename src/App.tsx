import { useState, useEffect, useRef } from 'react';
import { Zap, Copy, Check, History, Settings, Trash2, ChevronRight, Sparkles, Terminal, Info } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";

const SYSTEM_PROMPT = `You are Lumi Finn, a world-class prompt engineer expert in AI architecture. 
When given a task, you will output a high-performance prompt using the following logic:
1. Define a specific Role for the AI.
2. Provide clear, step-by-step Instructions.
3. Define the Output Format.
4. Add Negative Constraints (what to avoid).
5. Use [VARIABLES] in brackets for user data.
STRICT RULES:
- Output ONLY the finished prompt. 
- DO NOT say "Sure" or "Here is your prompt."
- DO NOT explain your reasoning. 
- Use clean Markdown formatting.`;

interface PromptHistory {
  id: string;
  input: string;
  output: string;
  timestamp: number;
}

export default function App() {
  const [showApp, setShowApp] = useState(false);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('Describe your idea to architect a masterpiece prompt.');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<PromptHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [tone, setTone] = useState('Professional');
  const [complexity, setComplexity] = useState('Advanced');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Load history
    const savedHistory = localStorage.getItem('lumi_finn_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }

    // Particle Animation
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 1.2;
        this.speedX = Math.random() * 0.4 - 0.2;
        this.speedY = Math.random() * 0.4 - 0.2;
        this.opacity = Math.random() * 0.5 + 0.1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas!.width) this.x = 0;
        if (this.x < 0) this.x = canvas!.width;
        if (this.y > canvas!.height) this.y = 0;
        if (this.y < 0) this.y = canvas!.height;
      }

      draw() {
        ctx!.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    const initCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      for (let i = 0; i < 150; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    initCanvas();
    animate();
    window.addEventListener('resize', initCanvas);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', initCanvas);
    };
  }, []);

  const handleInit = () => {
    setShowApp(true);
  };

  const handleGenerate = async () => {
    if (!input.trim() || loading) return;

    setLoading(true);
    setOutput('');
    setCopied(false);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Create a professional prompt for: ${input}. Tone: ${tone}. Complexity: ${complexity}.`,
        config: {
          systemInstruction: SYSTEM_PROMPT,
        },
      });

      const result = response.text || "No response generated.";
      setOutput(result);
      
      // Save to history
      const newHistoryItem: PromptHistory = {
        id: Date.now().toString(),
        input: input,
        output: result,
        timestamp: Date.now(),
      };
      const updatedHistory = [newHistoryItem, ...history].slice(0, 20);
      setHistory(updatedHistory);
      localStorage.setItem('lumi_finn_history', JSON.stringify(updatedHistory));

    } catch (error) {
      console.error("Error generating prompt:", error);
      setOutput("Error connecting to Lumi Finn engine. Please verify your connection.");
    } finally {
      setLoading(false);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('lumi_finn_history');
  };

  return (
    <div className="relative min-h-screen overflow-hidden font-sans selection:bg-white/20">
      <div className="atmosphere" />
      <div className="noise" />

      {/* Landing Overlay */}
      <AnimatePresence>
        {!showApp && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
            transition={{ duration: 1.2, ease: [0.7, 0, 0.3, 1] }}
            className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-black"
          >
            <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-40" />
            <div className="relative z-10 text-center px-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="font-serif italic text-white/40 text-sm tracking-[0.4em] mb-4 uppercase"
              >
                The Architect of Intelligence
              </motion.div>
              <div className="font-black text-[clamp(2.5rem,10vw,5rem)] tracking-[0.8em] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 drop-shadow-[0_0_50px_rgba(255,255,255,0.15)] mb-4 animate-tracking-in pl-[0.8em]">
                LUMI FINN
              </div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="text-[10px] tracking-[0.6em] text-white uppercase mb-[60px]"
              >
                PROMPT ARCHITECT v4.0 • ADVANCED ENGINE
              </motion.div>
              <motion.button 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 0.8 }}
                onClick={handleInit}
                className="group relative px-12 py-5 bg-transparent border border-white/10 text-white rounded-full text-[11px] font-bold tracking-[0.5em] uppercase cursor-pointer transition-all duration-500 hover:border-white hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] overflow-hidden"
              >
                <span className="relative z-10">Initialize Engine</span>
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main App Content */}
      <motion.div 
        initial={false}
        animate={{ opacity: showApp ? 1 : 0, scale: showApp ? 1 : 0.98 }}
        transition={{ duration: 1.5, ease: [0.2, 0.8, 0.2, 1] }}
        className="flex flex-col min-h-screen w-full"
      >
        {/* Header */}
        <header className="p-8 flex justify-between items-center border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Terminal size={18} className="text-black" />
            </div>
            <div className="font-black tracking-[0.2em] text-lg text-white uppercase">
              LUMI FINN
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2.5 rounded-xl transition-all ${showHistory ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'}`}
            >
              <History size={20} />
            </button>
            <button className="p-2.5 rounded-xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all">
              <Settings size={20} />
            </button>
          </div>
        </header>

        <div className="flex flex-1 relative">
          {/* Sidebar History */}
          <AnimatePresence>
            {showHistory && (
              <motion.aside 
                initial={{ x: -320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -320, opacity: 0 }}
                className="w-80 border-r border-white/5 bg-black/40 backdrop-blur-2xl p-6 overflow-y-auto hidden lg:block"
              >
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xs font-bold tracking-widest text-white/40 uppercase">History</h3>
                  <button onClick={clearHistory} className="text-white/20 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="space-y-4">
                  {history.length === 0 ? (
                    <div className="text-center py-12 text-white/20 text-xs italic">No history yet</div>
                  ) : (
                    history.map((item) => (
                      <button 
                        key={item.id}
                        onClick={() => setOutput(item.output)}
                        className="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all group"
                      >
                        <div className="text-xs text-white/60 line-clamp-2 mb-2 font-medium">{item.input}</div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-white/20">{new Date(item.timestamp).toLocaleDateString()}</span>
                          <ChevronRight size={12} className="text-white/0 group-hover:text-white/40 transition-all" />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col items-center p-6 lg:p-12 overflow-y-auto pb-64">
            <div className="w-full max-w-4xl space-y-8">
              {/* Output Card */}
              <motion.div 
                layout
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-white/10 to-transparent rounded-[32px] blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                <div className="relative bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 lg:p-12 min-h-[400px] flex flex-col">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold tracking-[0.3em] text-white/30 uppercase">Architect Output</span>
                    </div>
                    {output && output !== 'Describe your idea to architect a masterpiece prompt.' && !loading && (
                      <div className="flex gap-2">
                        <button 
                          onClick={handleCopy}
                          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium text-white transition-all"
                        >
                          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          <span>{copied ? 'Copied' : 'Copy Prompt'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 relative">
                    {loading && <div className="scan-line" />}
                    <div className={`font-mono text-sm lg:text-base leading-relaxed text-white/80 whitespace-pre-wrap transition-opacity duration-500 ${loading ? 'opacity-20' : 'opacity-100'}`}>
                      {output}
                    </div>
                    {loading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                        <div className="w-12 h-12 border-2 border-white/10 border-t-white rounded-full animate-spin" />
                        <span className="text-[10px] font-bold tracking-[0.5em] text-white/40 uppercase">Synthesizing Architecture...</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap gap-6 items-center justify-between">
                    <div className="flex gap-8">
                      <div className="space-y-1">
                        <div className="text-[10px] text-white/20 uppercase font-bold tracking-widest">Tone</div>
                        <div className="text-xs text-white/60 font-medium">{tone}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] text-white/20 uppercase font-bold tracking-widest">Complexity</div>
                        <div className="text-xs text-white/60 font-medium">{complexity}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                      <Sparkles size={12} className="text-white/40" />
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Llama-3 Optimized</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: <Zap size={18} />, title: "Instant Synthesis", desc: "Proprietary logic for immediate high-performance results." },
                  { icon: <Terminal size={18} />, title: "Logic Driven", desc: "Structured instructions following industry best practices." },
                  { icon: <Info size={18} />, title: "Cross Model", desc: "Optimized for Llama, GPT, and Gemini architectures." }
                ].map((item, i) => (
                  <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-3">
                    <div className="text-white/40">{item.icon}</div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">{item.title}</h4>
                    <p className="text-xs text-white/30 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>

        {/* Floating Input Bar */}
        <footer className="fixed bottom-0 left-0 right-0 p-6 lg:p-12 z-[100] pointer-events-none">
          <div className="max-w-4xl mx-auto w-full pointer-events-auto">
            <div className="bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[32px] p-4 lg:p-6 shadow-2xl shadow-black">
              {/* Settings Bar */}
              <div className="flex gap-4 mb-4 px-2 overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                  {['Professional', 'Creative', 'Technical'].map((t) => (
                    <button 
                      key={t}
                      onClick={() => setTone(t)}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${tone === t ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                  {['Standard', 'Advanced'].map((c) => (
                    <button 
                      key={c}
                      onClick={() => setComplexity(c)}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${complexity === c ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <textarea 
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  placeholder="Describe your prompt requirements..."
                  rows={1}
                  className="flex-1 bg-transparent border-none text-white text-sm lg:text-base outline-none resize-none max-h-[120px] font-inherit py-2 px-2 placeholder:text-white/20"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleGenerate();
                    }
                  }}
                />
                <button 
                  onClick={handleGenerate}
                  disabled={loading || !input.trim()}
                  className={`group bg-white text-black p-4 rounded-2xl cursor-pointer flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed`}
                >
                  <Zap strokeWidth={3} size={20} className={loading ? 'animate-pulse' : 'group-hover:rotate-12 transition-transform'} />
                </button>
              </div>
            </div>
          </div>
        </footer>
      </motion.div>
    </div>
  );
}
