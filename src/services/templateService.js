import { wrapInCpbankTemplate } from '../templates/cpbankTemplate';
import { wrapInDocument } from '../utils/htmlUtils';

export const TEMPLATE_OPTIONS = [
  {
    id: 'generic',
    label: 'Generic',
    description: 'Clean neutral layout for general HTML export.',
  },
  {
    id: 'cpbank',
    label: 'CPBank',
    description: 'Branded banking layout with CPBank header and legal styling.',
  },
];

export const DEFAULT_TEMPLATE_ID = 'generic';

const PREVIEW_SAMPLE_BODY = `
  <h1 class="title">Template Preview</h1>
  <p>This is a preview mode so you can compare template UI before applying it.</p>
  <p>Hover or focus a template option in the sidebar, then click to confirm your selection.</p>
`;

function normalizeTemplateId(templateId) {
  if (!templateId) return DEFAULT_TEMPLATE_ID;
  return TEMPLATE_OPTIONS.some((template) => template.id === templateId)
    ? templateId
    : DEFAULT_TEMPLATE_ID;
}

export function renderTemplateDocument(templateId, bodyHtml, title = 'Converted Document', useSampleWhenEmpty = false) {
  const safeTemplateId = normalizeTemplateId(templateId);
  const normalizedBody = bodyHtml?.trim() || (useSampleWhenEmpty ? PREVIEW_SAMPLE_BODY : '');

  if (safeTemplateId === 'generic') {
    return wrapInDocument(normalizedBody, title);
  }

  return wrapInCpbankTemplate(normalizedBody, title);
}
