import { Code, Eye, Wand2, Copy, Download, LayoutGrid } from 'lucide-react';

export default function Toolbar({
  viewMode,
  setViewMode,
  onConvert,
  onCopy,
  onDownload,
  status
}) {
  const isConverting = status === 'converting';

  const tabs = [
    { id: 'preview', label: 'Live Preview', icon: Eye },
    { id: 'code', label: 'Code Output', icon: Code },
    { id: 'split', label: 'Split View', icon: LayoutGrid },
  ];

  return (
    <div className="h-14 px-6 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
      <div className="flex items-center gap-2 h-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = viewMode === tab.id;
          return (
            <button 
              key={tab.id}
              onClick={() => setViewMode(tab.id)}
              className={`h-full px-4 flex items-center gap-2 text-sm font-semibold transition-all border-b-2 ${
                isActive ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
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
          <span className="hidden md:inline">Copy</span>
        </button>
        <button 
          onClick={onDownload}
          className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Download</span>
        </button>
      </div>
    </div>
  );
}
