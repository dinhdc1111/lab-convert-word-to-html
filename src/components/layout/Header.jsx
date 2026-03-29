import { CircleHelp, FileText } from 'lucide-react';

export default function Header({ onStartGuide }) {
  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0 z-50">
      <div className="flex items-center gap-8">
        <div id="tour-header-brand" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <FileText className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">DocToHTML</span>
        </div>
      </div>

      <button
        id="tour-help-button"
        type="button"
        onClick={onStartGuide}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800"
      >
        <CircleHelp className="w-4 h-4" />
        Guide
      </button>
    </header>
  );
}
