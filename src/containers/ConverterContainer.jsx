import { useState, useCallback } from 'react';
import { useFileUpload } from '../hooks/useFileUpload';
import { useConversion } from '../hooks/useConversion';
import { downloadAsHtml, copyToClipboard } from '../services/exportService';

import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Toolbar from '../components/editor/Toolbar';
import DocumentPreview from '../components/editor/DocumentPreview';
import HtmlOutput from '../components/editor/HtmlOutput';

export default function ConverterContainer() {
  const [viewMode, setViewMode] = useState("split");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [exportFormat, setExportFormat] = useState("XHTML");
  const [options, setOptions] = useState({
    removeEmpty: true,
    base64: false,
    minify: false,
  });

  const toggleOption = (key) => setOptions(prev => ({ ...prev, [key]: !prev[key] }));

  const {
    file,
    fileName,
    fileSize,
    handleFileSelect,
  } = useFileUpload();

  const {
    html,
    setHtml,
    status,
    messages,
    convert,
  } = useConversion();

  const handleConvert = useCallback(() => {
    if (file) convert(file);
  }, [file, convert]);

  const handleDownload = useCallback(() => {
    if (!html) return;
    const baseName = fileName ? fileName.replace(/\.docx$/i, '') : 'converted';
    downloadAsHtml(html, baseName);
  }, [html, fileName]);

  const handleCopy = useCallback(() => {
    if (!html) return;
    copyToClipboard(html);
  }, [html]);

  return (
    <div className="flex flex-col h-screen bg-[#f7f9fb] text-[#191c1e] font-sans overflow-hidden">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          options={options}
          toggleOption={toggleOption}
          exportFormat={exportFormat}
          setExportFormat={setExportFormat}
          file={file}
          fileName={fileName}
          fileSize={fileSize}
          handleFileSelect={handleFileSelect}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />

        <main className="flex-1 flex flex-col min-w-0 bg-white">
          <Toolbar 
            viewMode={viewMode}
            setViewMode={setViewMode}
            onConvert={handleConvert}
            onCopy={handleCopy}
            onDownload={handleDownload}
            status={status}
          />

           <div className="flex-1 flex overflow-hidden min-w-0">
             {/* Panels visibility is controlled by viewMode. 'split' shows both. */}
             {(viewMode === 'preview' || viewMode === 'split') && (
              <div className={`flex-1 min-w-0 flex border-r border-slate-200`}>
                  <DocumentPreview html={html} status={status} />
               </div>
             )}
             
             {(viewMode === 'code' || viewMode === 'split') && (
              <div className={`flex-1 min-w-0 flex`}>
                  <HtmlOutput html={html} onHtmlChange={setHtml} />
               </div>
             )}
          </div>
        </main>
      </div>
    </div>
  );
}
