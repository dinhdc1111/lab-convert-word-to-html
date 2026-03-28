import { useRef } from 'react';
import { FileText, Upload } from 'lucide-react';
import OptionToggle from '../common/OptionToggle';

export default function Sidebar({
  options,
  toggleOption,
  exportFormat,
  setExportFormat,
  file,
  fileName,
  handleFileSelect,
}) {
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const onUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <aside className="w-72 border-r border-slate-200 bg-[#f2f4f6] flex flex-col shrink-0 overflow-y-auto">
      <div className="p-6 space-y-8">
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-6">Conversion Options</h2>
          <div className="space-y-6">
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

        <section className="pt-6 border-t border-slate-300/50">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Export Format</h3>
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

      <div className="mt-auto p-6 bg-slate-200/30 border-t border-slate-300/50">
        {file ? (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="text-blue-600 w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">{fileName}</p>
              <p className="text-[10px] text-slate-500">Word Document</p>
            </div>
          </div>
        ) : (
          <div className="mb-4">
             <p className="text-xs text-slate-500 text-center">No document selected</p>
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
          className="w-full py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Upload className="w-3.5 h-3.5" />
          {file ? 'Change Document' : 'Upload Document'}
        </button>
      </div>
    </aside>
  );
}
