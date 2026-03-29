import { ZoomIn, ZoomOut } from 'lucide-react';

export default function DocumentPreview({ previewDocumentHtml, status }) {
  return (
    <div id="tour-document-preview" className="flex-1 min-w-0 flex flex-col border-r border-slate-200 bg-slate-50/50">
      <div className="px-6 py-3 border-b border-slate-200 flex items-center justify-between bg-white/50">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Document Preview</span>
        <div className="flex items-center gap-3 text-slate-400">
          <ZoomIn className="w-4 h-4 cursor-pointer hover:text-slate-600" />
          <ZoomOut className="w-4 h-4 cursor-pointer hover:text-slate-600" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
        {status === 'converting' ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
            <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
        ) : null}

        <div className="max-w-4xl mx-auto bg-white shadow-xl shadow-slate-200/50 min-h-[560px] border border-slate-200 rounded-sm overflow-hidden relative">
          <iframe
            title="Templated document preview"
            srcDoc={previewDocumentHtml}
            className="w-full h-[68vh] min-h-[560px] bg-white"
          />
        </div>
      </div>
    </div>
  );
}
