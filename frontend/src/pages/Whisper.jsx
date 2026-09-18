import { useEffect, useRef, useState } from "react";
import { WhisperField } from "../components/WhisperField";
import "../styles/whisper.css";

export function Whisper() {
  const [layout, setLayout] = useState("arc");
  const [size, setSize] = useState(100);
  const [phase, setPhase] = useState("idle");
  const [draft, setDraft] = useState("");
  const [pulse, setPulse] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const entry = useRef(null);
  const receipt = useRef(null);
  const timer = useRef();
  const releasing = useRef(false);
  const surface = useRef(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    media.addEventListener("change", update);
    return () => { media.removeEventListener("change", update); clearTimeout(timer.current); };
  }, []);

  useEffect(() => {
    if (phase === "writing") entry.current?.focus();
    if (phase === "done") receipt.current?.focus();
  }, [phase]);

  useEffect(() => {
    const element = surface.current;
    const zoom = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      if (!(event.target instanceof Element) || event.target.closest(".whisper-controls, .whisper-appearance, button, input, textarea")) return;
      event.preventDefault();
      setSize((current) => Math.max(20, Math.min(160, current * Math.exp(-event.deltaY * 0.0015))));
    };
    element?.addEventListener("wheel", zoom, { passive: false });
    return () => element?.removeEventListener("wheel", zoom);
  }, []);

  function release() {
    if (!draft.trim() || releasing.current) return;
    releasing.current = true;
    setPhase("releasing");
    setPulse((value) => value + 1);
    timer.current = setTimeout(() => { setPhase("done"); releasing.current = false; }, reducedMotion ? 0 : 1500);
  }

  return (
    <main ref={surface} className={`whisper-page whisper-${phase}`}>
      <WhisperField pulse={pulse} reducedMotion={reducedMotion} layout={layout} quiet={phase === "writing" || phase === "releasing"} />
      <div className="whisper-brand">留在这里</div>
      <div className="whisper-content">
        {phase === "idle" && <section className="whisper-welcome">
          <p className="whisper-kicker">夜深了，慢慢说。</p>
          <h1>有什么想留在这里？</h1>
          <p>一个愿望，一点心事，或一句还没说出口的话。</p>
          <button className="whisper-primary" type="button" onClick={() => setPhase("writing")}>{draft ? "继续写" : "写下来"} <span>↗</span></button>
        </section>}
        {(phase === "writing" || phase === "releasing") && <form className="whisper-form" aria-label="写下一点心事" onSubmit={(event) => { event.preventDefault(); release(); }}>
          <label htmlFor="whisper-entry">想留在这里的话</label>
          <textarea ref={entry} id="whisper-entry" value={draft} maxLength={1000} readOnly={phase === "releasing"} placeholder="不用组织好语言，慢慢写。" onChange={(event) => setDraft(event.target.value)} />
          <div className="whisper-meta"><span>不必有答案。</span><span>{draft.length} / 1000</span></div>
          <div className="whisper-actions"><button className="whisper-quiet" type="button" onClick={() => setPhase("idle")} disabled={phase === "releasing"}>先不写了</button><button className="whisper-primary" type="submit" disabled={!draft.trim() || phase === "releasing"}>{phase === "releasing" ? "轻轻放下…" : "放在这里"} <span>↗</span></button></div>
        </form>}
        {phase === "done" && <section className="whisper-receipt"><span>✧</span><h1 ref={receipt} tabIndex="-1">先放在这里。</h1><p>这一刻，不用急着做些什么。</p><button className="whisper-quiet" type="button" onClick={() => setPhase("writing")}>改一改刚才的话</button></section>}
        <p className="whisper-privacy">仅在当前页面暂留，不上传；刷新或关闭后不保留。</p>
      </div>
      <div className="whisper-controls"><div className="whisper-layout-switch" role="group" aria-label="光点分布"><button type="button" aria-pressed={layout === "stars"} onClick={() => setLayout("stars")}>满天星</button><button type="button" aria-pressed={layout === "arc"} onClick={() => setLayout("arc")}>弧形</button></div><span>背景上滚轮缩放 · {Math.round(size)}%</span></div>
      <details className="whisper-appearance"><summary>外观</summary><div><label>分布范围 <output>{Math.round(size)}%</output></label><input type="range" min="20" max="160" value={Math.round(size)} onChange={(event) => setSize(Number(event.target.value))} /><button type="button" onClick={() => { setSize(100); setLayout("arc"); }}>恢复默认</button></div></details>
    </main>
  );
}
