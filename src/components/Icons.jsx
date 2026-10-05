export const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" /><circle cx="12" cy="10" r="2.6" /></svg>
);
export const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg>
);
export const Slice = ({ className }) => (<svg className={className} viewBox="0 0 100 100" aria-hidden="true"><use href="#slice" /></svg>);
export const Sprites = () => (
  <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true"><defs>
    <symbol id="slice" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="48" fill="currentColor" /><circle cx="50" cy="50" r="42" fill="#FFF6DF" /><circle cx="50" cy="50" r="38" fill="currentColor" opacity=".8" />
      <path d="M50 50V14M50 50L75.5 24.5M50 50H86M50 50L75.5 75.5M50 50V86M50 50L24.5 75.5M50 50H14M50 50L24.5 24.5" stroke="#FFF6DF" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="50" cy="50" r="4" fill="#FFF6DF" />
    </symbol>
  </defs></svg>
);
