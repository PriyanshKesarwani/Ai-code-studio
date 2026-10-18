const Svg = ({ children, size = 14, ...rest }) => (
  <svg viewBox="0 0 16 16" width={size} height={size} fill="none" stroke="currentColor"
       strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
    {children}
  </svg>
);

export const ExpandIcon = (p) => <Svg {...p}><path d="M6 2H2v4M10 2h4v4M6 14H2v-4M10 14h4v-4" /></Svg>;
export const CollapseIcon = (p) => <Svg {...p}><path d="M2 6h4V2M14 6h-4V2M2 10h4v4M14 10h-4v4" /></Svg>;
export const PlayIcon = (p) => <Svg {...p}><path d="M4 2.5v11l9-5.5z" fill="currentColor" /></Svg>;
export const StopIcon = (p) => <Svg {...p}><rect x="3.5" y="3.5" width="9" height="9" rx="1.5" fill="currentColor" /></Svg>;
export const SendIcon = (p) => <Svg {...p}><path d="M2 8l12-5-4.5 11-2-4.5z" /></Svg>;
export const CheckIcon = (p) => <Svg {...p}><path d="M3 8.5l3.5 3.5L13 4.5" /></Svg>;
export const CopyIcon = (p) => (
  <Svg {...p}>
    <rect x="5" y="5" width="9" height="9" rx="1.5" />
    <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" />
  </Svg>
);
export const RefreshIcon = (p) => <Svg {...p}><path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2.5v3h-3" /></Svg>;
export const CloseIcon = (p) => <Svg {...p}><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" /></Svg>;
