import { useState, useCallback } from 'react';
import { runPipeline } from '../pipeline/conversionPipeline';

/**
 * Status enum for conversion lifecycle.
 * @typedef {'idle' | 'converting' | 'done' | 'error'} ConversionStatus
 */

/**
 * Hook for managing the Word → HTML conversion pipeline.
 *
 * Calls the conversion pipeline and manages result state.
 * No direct service imports — only communicates through the pipeline.
 *
 * @returns {{
 *   html: string,
 *   status: ConversionStatus,
 *   error: string,
 *   messages: Array<{ type: string, message: string }>,
 *   convert: (file: File) => Promise<void>,
 *   reset: () => void,
 * }}
 */
export function useConversion() {
  const [html, setHtml] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);

  const convert = useCallback(async (file) => {
    if (!file) return;

    setStatus('converting');
    setError('');
    setMessages([]);
    setHtml('');

    const result = await runPipeline(file);

    if (result.success) {
      setHtml(result.html);
      setMessages(result.messages);
      setStatus('done');
    } else {
      setError(result.error);
      setStatus('error');
    }
  }, []);

  const reset = useCallback(() => {
    setHtml('');
    setStatus('idle');
    setError('');
    setMessages([]);
  }, []);

  return {
    html,
    setHtml,
    status,
    error,
    messages,
    convert,
    reset,
  };
}
