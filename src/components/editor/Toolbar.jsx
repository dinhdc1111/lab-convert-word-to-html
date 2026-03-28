import { Code, Eye, Wand2, Copy, Download } from 'lucide-react';

export default function Toolbar({
  activeTab,
  setActiveTab,
  onConvert,
  onCopy,
  onDownload,
  status
}) {
  const isConverting = status === 'converting';

  return (
    <div className="h-14 px-6 border-b border-slate-200 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-6 h-full">
        <button 
          onClick={() => setActiveTab("editor")}
          className={`h-full px-2 flex items-center gap-2 text-sm font-semibold transition-all border-b-2 ${
            activeTab === "editor" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Code className="w-4 h-4" />
          Code Output
        </button>
        <button 
          onClick={() => setActiveTab("preview")}
          className={`h-full px-2 flex items-center gap-2 text-sm font-semibold transition-all border-b-2 ${
            activeTab === "preview" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Eye className="w-4 h-4" />
          Live Preview
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={onConvert}
          disabled={isConverting}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
            isConverting ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'
          }`}
        >
          <Wand2 className={`w-3.5 h-3.5 ${isConverting ? 'animate-spin' : ''}`} />
          {isConverting ? 'Cleaning...' : 'Clean HTML'}
        </button>
        <div className="w-px h-4 bg-slate-200 mx-2" />
        <button 
          onClick={onCopy}
          className="px-4 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-2"
        >
          <Copy className="w-3.5 h-3.5" />
          Copy
        </button>
        <button 
          onClick={onDownload}
          className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2"
        >
          <Download className="w-3.5 h-3.5" />
          Download .html
        </button>
      </div>
    </div>
  );
}
