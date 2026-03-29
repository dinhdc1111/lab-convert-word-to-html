import { Code, Eye, Wand2, Copy, Download, LayoutGrid } from 'lucide-react';

export default function Toolbar({
  viewMode,
  setViewMode,
  onConvert,
  onCopy,
  onDownload,
  status,
  hasConvertedData,
}) {
  const isConverting = status === 'converting';

  const tabs = [
    { id: 'split', label: 'Split View', icon: LayoutGrid },
    { id: 'preview', label: 'Preview', icon: Eye },
    { id: 'code', label: 'Editor', icon: Code },
  ];

  return (
    <div className="h-14 px-6 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
      <div className="flex items-center gap-2 h-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = viewMode === tab.id;
          return (
            <button
              id={tab.id === 'preview' ? 'tour-preview-tab' : undefined}
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
          id="tour-convert-button"
          onClick={onConvert}
          disabled={isConverting}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
            isConverting ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'
          }`}
        >
          <Wand2 className={`w-3.5 h-3.5 ${isConverting ? 'animate-spin' : ''}`} />
          {isConverting ? 'Converting...' : 'Convert'}
        </button>
        <div className="w-px h-4 bg-slate-200 mx-2" />
        <button
          id="tour-copy-button"
          onClick={onCopy}
          disabled={!hasConvertedData}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
            hasConvertedData
              ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Copy className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Copy</span>
        </button>
        <button 
          id="tour-download-button"
          onClick={onDownload}
          disabled={!hasConvertedData}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${
            hasConvertedData
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Download</span>
        </button>
      </div>
    </div>
  );
}
