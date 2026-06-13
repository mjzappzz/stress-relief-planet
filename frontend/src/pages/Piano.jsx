import { useState, useEffect, useCallback, useRef } from "react";
import useStore from "../store";

export function Piano() {
  const [activeKeys, setActiveKeys] = useState({});
  const [octave, setOctave] = useState(4);
  const [volume, setVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef(null);
  const oscillatorsRef = useRef({});

  // Note frequencies for C major scale across multiple octaves
  const notes = [
    { note: "C", freq: 261.63, type: "white", key: "a" },
    { note: "C#", freq: 277.18, type: "black", key: "w" },
    { note: "D", freq: 293.66, type: "white", key: "s" },
    { note: "D#", freq: 311.13, type: "black", key: "e" },
    { note: "E", freq: 329.63, type: "white", key: "d" },
    { note: "F", freq: 349.23, type: "white", key: "f" },
    { note: "F#", freq: 369.99, type: "black", key: "t" },
    { note: "G", freq: 392.00, type: "white", key: "g" },
    { note: "G#", freq: 415.30, type: "black", key: "y" },
    { note: "A", freq: 440.00, type: "white", key: "h" },
    { note: "A#", freq: 466.16, type: "black", key: "u" },
    { note: "B", freq: 493.88, type: "white", key: "j" },
    { note: "C2", freq: 523.25, type: "white", key: "k" },
    { note: "C#2", freq: 554.37, type: "black", key: "o" },
    { note: "D2", freq: 587.33, type: "white", key: "l" },
  ];

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playNote = useCallback((freq, noteName) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Stop previous oscillator for this note
    if (oscillatorsRef.current[noteName]) {
      try { oscillatorsRef.current[noteName].stop(); } catch (e) {}
      try { oscillatorsRef.current[noteName].disconnect(); } catch (e) {}
    }

    const osc = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, audioContextRef.current.currentTime);
    
    gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContextRef.current.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 2);

    osc.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    osc.start();
    oscillatorsRef.current[noteName] = osc;

    // Cleanup
    setTimeout(() => {
      try { osc.stop(); } catch (e) {}
      try { osc.disconnect(); } catch (e) {}
      if (oscillatorsRef.current[noteName] === osc) {
        delete oscillatorsRef.current[noteName];
      }
    }, 2000);
  }, [volume]);

  const handleKeyDown = useCallback((e) => {
    if (e.repeat) return;
    
    const note = notes.find(n => n.key === e.key.toLowerCase());
    if (note) {
      setActiveKeys(prev => ({ ...prev, [note.note]: true }));
      
      // Adjust frequency based on octave
      const freq = note.freq * Math.pow(2, octave - 4);
      playNote(freq, note.note);
    }
  }, [octave, playNote]);

  const handleKeyUp = useCallback((e) => {
    const note = notes.find(n => n.key === e.key.toLowerCase());
    if (note) {
      setActiveKeys(prev => ({ ...prev, [note.note]: false }));
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            钢琴弹奏 <span className="text-amber-500">Piano</span>
          </h1>
          <p className="text-lg text-slate-600">
            随意弹奏，让音乐带走烦恼
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
          <div className="bg-white px-6 py-3 rounded-xl shadow-md">
            <span className="text-slate-600 mr-3">音量:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-32"
            />
          </div>
          
          <div className="bg-white px-6 py-3 rounded-xl shadow-md">
            <span className="text-slate-600 mr-3">八度:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOctave(o => Math.max(2, o - 1))}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold"
              >
                -
              </button>
              <span className="font-bold w-8 text-center">{octave}</span>
              <button
                onClick={() => setOctave(o => Math.min(6, o + 1))}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold"
              >
                +
              </button>
            </div>
          </div>

          <div className="bg-white px-6 py-3 rounded-xl shadow-md">
            <span className="text-slate-600 mr-3">使用方式:</span>
            <span className="text-slate-800 font-semibold">键盘或点击弹奏</span>
          </div>
        </div>

        {/* Piano */}
        <div className="bg-gradient-to-b from-amber-100 to-amber-200 p-6 rounded-2xl shadow-2xl overflow-x-auto">
          <div className="flex justify-center min-w-[600px]">
            {notes.map((note, index) => {
              const isActive = activeKeys[note.note];
              
              if (note.type === "white") {
                return (
                  <div
                    key={note.note}
                    onClick={() => {
                      const freq = note.freq * Math.pow(2, octave - 4);
                      playNote(freq, note.note);
                      setActiveKeys(prev => ({ ...prev, [note.note]: true }));
                      setTimeout(() => {
                        setActiveKeys(prev => ({ ...prev, [note.note]: false }));
                      }, 200);
                    }}
                    onMouseDown={() => {
                      const freq = note.freq * Math.pow(2, octave - 4);
                      playNote(freq, note.note);
                      setActiveKeys(prev => ({ ...prev, [note.note]: true }));
                    }}
                    onMouseUp={() => {
                      setActiveKeys(prev => ({ ...prev, [note.note]: false }));
                    }}
                    onMouseLeave={() => {
                      setActiveKeys(prev => ({ ...prev, [note.note]: false }));
                    }}
                    className={`
                      relative w-14 h-48 md:w-16 md:h-64 rounded-b-lg mx-0.5
                      flex items-end justify-center pb-4 cursor-pointer transition-all duration-100
                      ${isActive 
                        ? "bg-amber-300 shadow-inner transform scale-[0.99] translate-y-1" 
                        : "bg-white shadow-lg hover:bg-amber-50 active:scale-95"
                      }
                    `}
                  >
                    <span className={`text-sm font-bold ${isActive ? "text-amber-700" : "text-slate-400"}`}>
                      {note.key.toUpperCase()}
                    </span>
                  </div>
                );
              }
              return null;
            })}
          </div>

          {/* Black keys overlay */}
          <div className="flex justify-center relative mt-[-5.5rem] md:mt-[-7.25rem] pointer-events-none">
            {notes.map((note, index) => {
              if (note.type === "black") {
                const isActive = activeKeys[note.note];
                return (
                  <div
                    key={note.note}
                    onClick={() => {
                      const freq = note.freq * Math.pow(2, octave - 4);
                      playNote(freq, note.note);
                      setActiveKeys(prev => ({ ...prev, [note.note]: true }));
                      setTimeout(() => {
                        setActiveKeys(prev => ({ ...prev, [note.note]: false }));
                      }, 200);
                    }}
                    onMouseDown={() => {
                      const freq = note.freq * Math.pow(2, octave - 4);
                      playNote(freq, note.note);
                      setActiveKeys(prev => ({ ...prev, [note.note]: true }));
                    }}
                    onMouseUp={() => {
                      setActiveKeys(prev => ({ ...prev, [note.note]: false }));
                    }}
                    onMouseLeave={() => {
                      setActiveKeys(prev => ({ ...prev, [note.note]: false }));
                    }}
                    className={`
                      absolute w-8 h-28 md:w-10 md:h-40 rounded-b-lg pointer-events-auto
                      cursor-pointer transition-all duration-100
                      ${isActive 
                        ? "bg-slate-800 shadow-inner transform scale-[0.99] translate-y-1" 
                        : "bg-slate-900 shadow-xl hover:bg-black active:scale-95"
                      }
                      z-10
                    `}
                    // Position each black key between white keys
                    style={{ left: "calc(2.5rem + 3.5rem * " + notes.slice(0, index).filter(n => n.type === "white").length + ")" }}
                  >
                    <span className={`absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-bold pointer-events-none`}>
                      {note.key.toUpperCase()}
                    </span>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-10 grid md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-bold text-slate-800 mb-3 text-lg">键盘映射</h3>
            <div className="flex flex-wrap gap-2">
              {notes.filter(n => n.type === "white").map(n => (
                <div key={n.note} className="w-10 h-10 bg-white rounded shadow flex items-center justify-center font-bold text-slate-700 border border-slate-200">
                  {n.key.toUpperCase()}
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-500 mt-3">
              使用键盘上的 A-L 键弹奏白键
            </p>
          </div>
          
          <div className="card">
            <h3 className="font-bold text-slate-800 mb-3 text-lg">黑键操作</h3>
            <div className="flex flex-wrap gap-2">
              {notes.filter(n => n.type === "black").map(n => (
                <div key={n.note} className="w-10 h-10 bg-slate-800 rounded shadow flex items-center justify-center font-bold text-white">
                  {n.key.toUpperCase()}
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-500 mt-3">
              使用 W-E-T-Y-U-O 键弹奏黑键
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
