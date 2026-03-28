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
  const [activeTab, setActiveTab] = useState("editor");
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
        />

        <main className="flex-1 flex flex-col min-w-0 bg-white">
          <Toolbar 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onConvert={handleConvert}
            onCopy={handleCopy}
            onDownload={handleDownload}
            status={status}
          />

          <div className="flex-1 flex overflow-hidden">
             {/* Panels take 50/50 space on desktop. Tablet/Mobile uses tabs. */}
             <div className={`flex-1 ${activeTab === 'preview' ? 'flex' : 'hidden md:flex'} border-r border-slate-200`}>
                <DocumentPreview html={html} status={status} />
             </div>
             
             <div className={`flex-1 ${activeTab === 'editor' ? 'flex' : 'hidden md:flex'}`}>
                <HtmlOutput html={html} onHtmlChange={setHtml} />
             </div>
          </div>
        </main>
      </div>
    </div>
  );
}
