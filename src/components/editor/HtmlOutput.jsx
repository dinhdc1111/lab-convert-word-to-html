import CodeBlock from "./CodeBlock";

export default function HtmlOutput({ html, onHtmlChange }) {
  const lineCount = html ? html.split('\n').length : 0;

  return (
    <div id="tour-code-output" className="flex-1 min-w-0 flex flex-col bg-[#0f172a]">
      <div className="px-6 py-3 bg-slate-900 border-b border-white/5 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Generated HTML Output</span>
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-slate-500 font-mono">{lineCount.toLocaleString()} Lines</span>
        </div>
      </div>
      <div className="flex-1 overflow-hidden text-sm custom-scrollbar selection:bg-blue-500/30">
        <CodeBlock html={html} onChange={onHtmlChange} />
      </div>
    </div>
  );
}
