// Stable hue (0-359) from a string. Drives the generated poster gradients,
// the ambient glow behind the swipe deck, and avatar colors, so the same film
// or person always gets the same color.
export function hueFor(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) % 360;
  }
  return h;
}
