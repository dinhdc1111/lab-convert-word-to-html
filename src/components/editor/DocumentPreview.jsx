import { ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';

export default function DocumentPreview({ previewDocumentHtml, status }) {
  const [zoom, setZoom] = useState(1);
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 1.5;
  const ZOOM_STEP = 0.1;

  const handleZoomIn = () => {
    setZoom((z) => Math.min(MAX_ZOOM, Math.round((z + ZOOM_STEP) * 100) / 100));
  };

  const handleZoomOut = () => {
    setZoom((z) => Math.max(MIN_ZOOM, Math.round((z - ZOOM_STEP) * 100) / 100));
  };

  const iframeStyle = {
    transform: `scale(${zoom})`,
    transformOrigin: 'top left',
    width: `${100 / zoom}%`,
    height: `${68 / zoom}vh`,
    background: 'white',
  };
  return (
    <div id="tour-document-preview" className="flex-1 min-w-0 flex flex-col border-r border-slate-200 bg-slate-50/50">
      <div className="px-6 py-3 border-b border-slate-200 flex items-center justify-between bg-white/50">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Document Preview</span>
        <div className="flex items-center gap-3 text-slate-400">
          <button
            type="button"
            aria-label="Zoom in"
            onClick={handleZoomIn}
            disabled={zoom >= MAX_ZOOM}
            className={`p-1 rounded ${zoom >= MAX_ZOOM ? 'opacity-40 cursor-not-allowed' : 'hover:text-slate-600'}`}
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            type="button"
            aria-label="Zoom out"
            onClick={handleZoomOut}
            disabled={zoom <= MIN_ZOOM}
            className={`p-1 rounded ${zoom <= MIN_ZOOM ? 'opacity-40 cursor-not-allowed' : 'hover:text-slate-600'}`}
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="text-[11px] text-slate-500 ml-2">{Math.round(zoom * 100)}%</span>
        </div>
      </div>
      <div className="flex-1 overflow-hidden custom-scrollbar relative">
        {status === 'converting' ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
            <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
        ) : null}

        {/* <div className="max-w-4xl mx-auto bg-white shadow-xl shadow-slate-200/50 min-h-[560px] border border-slate-200 rounded-sm overflow-hidden relative"> */}
          <iframe
            title="Templated document preview"
            srcDoc={previewDocumentHtml}
            className="min-h-[560px] bg-white"
            style={iframeStyle}
          />
        {/* </div> */}
      </div>
    </div>
  );
}
