import { useRef } from 'react';
import { FileText, Upload, ChevronLeft, ChevronRight, Settings, Sliders } from 'lucide-react';
import OptionToggle from '../common/OptionToggle';

export default function Sidebar({
  options,
  toggleOption,
  exportFormat,
  setExportFormat,
  file,
  fileName,
  handleFileSelect,
  isCollapsed,
  setIsCollapsed
}) {
  const fileInputRef = useRef(null);

  const onUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <aside className={`relative flex flex-col shrink-0 bg-[#f2f4f6] border-r border-slate-200 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-72'}`}>
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-blue-600 shadow-sm z-10 transition-transform hover:scale-110"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className={`flex-1 overflow-y-auto custom-scrollbar ${isCollapsed ? 'overflow-x-hidden' : ''}`}>
        <div className={`p-6 space-y-8 ${isCollapsed ? 'flex flex-col items-center px-0' : ''}`}>
          <section className="w-full">
            {!isCollapsed ? (
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-6 px-1">Conversion Options</h2>
            ) : (
              <div className="flex justify-center mb-6">
                <Sliders size={18} className="text-slate-400" />
              </div>
            )}
            
            <div className={`space-y-6 ${isCollapsed ? 'hidden' : ''}`}>
              <OptionToggle 
                label="Remove Empty Tags" 
                description="Strips out <p></p> and empty <span> elements automatically."
                checked={options.removeEmpty}
                onChange={() => toggleOption("removeEmpty")}
              />
              <OptionToggle 
                label="Convert Images to Base64" 
                description="Embeds images directly into the HTML string for portability."
                checked={options.base64}
                onChange={() => toggleOption("base64")}
              />
              <OptionToggle 
                label="Minify Output" 
                description="Removes all whitespace and comments for production use."
                checked={options.minify}
                onChange={() => toggleOption("minify")}
              />
            </div>
          </section>

          <section className={`pt-6 border-t border-slate-300/50 w-full ${isCollapsed ? 'hidden' : ''}`}>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 px-1">Export Format</h3>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/50 rounded-xl">
              {(["HTML5", "XHTML"]).map((format) => (
                <button
                  key={format}
                  onClick={() => setExportFormat(format)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    exportFormat === format 
                      ? "bg-blue-600 text-white shadow-sm" 
                      : "text-slate-600 hover:bg-slate-300/50"
                  }`}
                >
                  {format}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className={`mt-auto p-4 bg-slate-200/30 border-t border-slate-300/50 flex flex-col items-center gap-4`}>
        {file && !isCollapsed && (
          <div className="flex items-center gap-3 w-full animate-in fade-in slide-in-from-left-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <FileText className="text-blue-600 w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">{fileName}</p>
              <p className="text-[10px] text-slate-500">Word Document</p>
            </div>
          </div>
        )}

        {isCollapsed && file && (
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 tooltip-trigger">
            <FileText size={20} />
          </div>
        )}
        
        <input 
          type="file" 
          accept=".docx"
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
        />
        <button 
          onClick={onUploadClick}
          className={`flex items-center justify-center rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-all active:scale-95 shadow-sm ${
            isCollapsed ? 'w-10 h-10 p-0' : 'w-full py-2.5 px-4 gap-2 text-xs'
          }`}
          title={isCollapsed ? "Upload Document" : ""}
        >
          <Upload size={16} />
          {!isCollapsed && (file ? 'Change Document' : 'Upload Document')}
        </button>
      </div>
    </aside>
  );
}
