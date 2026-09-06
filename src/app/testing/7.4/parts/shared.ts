export type PreviewDevice = 'desktop' | 'mobile';

export const backLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 14px',
  background: '#121826',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '10px',
  fontSize: '0.8rem',
  fontWeight: 700,
  color: '#cbd5e1',
  textDecoration: 'none',
} as const;

export const sandboxLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 12px',
  background: '#121826',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  fontSize: '0.75rem',
  fontWeight: 700,
  color: '#cbd5e1',
  textDecoration: 'none',
} as const;

export const sectionHeadingStyle = {
  fontSize: '1.5rem',
  fontWeight: 800,
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  margin: 0,
} as const;
