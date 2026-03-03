// File: Components/Colors.js
// Theme palette — inspired by the Pawtime Interactive logo (orange · gold · blue)
const COLORS = {
  // Backgrounds
  background: '#090400',       // Very dark orange-black (app bg)
  card: '#1C0900',             // Dark orange-brown card
  cardBorder: '#3D1A00',       // Subtle warm border
  cardAlt: '#140600',          // Alt card shade

  // Text
  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.65)',
  textMuted: 'rgba(255,255,255,0.35)',

  // Accents (match logo)
  accent1: '#FFD700',          // Gold — primary highlight
  accent2: '#1976D2',          // Blue — secondary (logo banner)
  accent3: '#FF8C00',          // Bright orange — warm accent

  // Semantic
  warning: '#FF4444',
  success: '#4CAF50',

  // Overlays
  overlay: 'rgba(0,0,0,0.78)',
  overlayLight: 'rgba(0,0,0,0.45)',

  white: '#FFFFFF',

  // Gradient endpoints (used in headers)
  gradientStart: '#7D3200',    // Dark amber-orange
  gradientEnd: '#090400',

  // Tab bar
  tabBg: '#060300',
};

export default COLORS;
