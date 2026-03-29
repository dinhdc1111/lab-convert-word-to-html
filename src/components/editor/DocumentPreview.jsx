import { ZoomIn, ZoomOut } from 'lucide-react';
import { motion } from 'motion/react';

export default function DocumentPreview({ html, status }) {
  return (
    <div className="flex-1 min-w-0 flex flex-col border-r border-slate-200 bg-slate-50/50">
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

        {html ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto bg-white shadow-xl shadow-slate-200/50 p-16 min-h-full border border-slate-200 rounded-sm prose prose-slate"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <div className="max-w-2xl mx-auto bg-white shadow-xl shadow-slate-200/50 p-16 min-h-[500px] border border-slate-200 rounded-sm flex items-center justify-center flex-col text-slate-400 gap-4">
             <p>No document to preview.</p>
             <p className="text-sm">Upload a .docx file and click "Clean HTML" to see results.</p>
          </div>
        )}
      </div>
    </div>
  );
}
