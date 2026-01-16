/**
 * ColorSwatch
 * 
 * Displays a color swatch with role label and HEX value.
 */

interface ColorSwatchProps {
  role: string;
  color: string;
}

export function ColorSwatch({ role, color }: ColorSwatchProps) {
  // Normalize color to display format
  const displayColor = color.startsWith('#') ? color : `#${color}`;
  
  return (
    <div className="bp-swatch">
      <div 
        className="bp-swatch-color"
        style={{ backgroundColor: displayColor }}
      />
      <span className="bp-swatch-label">{role}</span>
      <span className="bp-swatch-hex">{displayColor.toUpperCase()}</span>
    </div>
  );
}
