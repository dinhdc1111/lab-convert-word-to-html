import { useState, useCallback, useMemo } from 'react';
import { useFileUpload } from '../hooks/useFileUpload';
import { useConversion } from '../hooks/useConversion';
import { downloadAsHtml, copyToClipboard } from '../services/exportService';
import {
  TEMPLATE_OPTIONS,
  DEFAULT_TEMPLATE_ID,
  renderTemplateDocument,
} from '../services/templateService';

import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Toolbar from '../components/editor/Toolbar';
import DocumentPreview from '../components/editor/DocumentPreview';
import HtmlOutput from '../components/editor/HtmlOutput';

export default function ConverterContainer() {
  const [viewMode, setViewMode] = useState("split");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [exportFormat, setExportFormat] = useState("XHTML");
  const [selectedTemplateId, setSelectedTemplateId] = useState(DEFAULT_TEMPLATE_ID);
  const [previewTemplateId, setPreviewTemplateId] = useState(null);
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
    convert,
  } = useConversion();

  const exportTitle = fileName ? fileName.replace(/\.docx$/i, '') : 'converted';
  const effectivePreviewTemplateId = previewTemplateId || selectedTemplateId;

  const previewDocumentHtml = useMemo(() => {
    return renderTemplateDocument(
      effectivePreviewTemplateId,
      html,
      exportTitle,
      true,
    );
  }, [effectivePreviewTemplateId, html, exportTitle]);

  const handleConvert = useCallback(() => {
    if (file) convert(file);
  }, [file, convert]);

  const handleDownload = useCallback(() => {
    if (!html) return;
    downloadAsHtml(html, exportTitle, selectedTemplateId);
  }, [html, exportTitle, selectedTemplateId]);

  const handleCopy = useCallback(() => {
    if (!html) return;
    copyToClipboard(html, selectedTemplateId, exportTitle);
  }, [html, selectedTemplateId, exportTitle]);

  return (
    <div className="flex flex-col h-screen bg-[#f7f9fb] text-[#191c1e] font-sans overflow-hidden">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          options={options}
          toggleOption={toggleOption}
          exportFormat={exportFormat}
          setExportFormat={setExportFormat}
          templateId={selectedTemplateId}
          setTemplateId={setSelectedTemplateId}
          previewTemplateId={previewTemplateId}
          templateOptions={TEMPLATE_OPTIONS}
          onTemplatePreview={setPreviewTemplateId}
          clearTemplatePreview={() => setPreviewTemplateId(null)}
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
                  <DocumentPreview
                    previewDocumentHtml={previewDocumentHtml}
                    status={status}
                  />
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
