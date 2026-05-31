export type IconSpec = { rounded: boolean; glyphPct: number };

const GLYPH =
  '<path fill="#ffffff" fill-rule="evenodd" d="M50 14L86 44L86 86L14 86L14 44Z M58 40A8 8 0 1 1 42 40A8 8 0 1 1 58 40Z M44 86L44 66Q44 60 50 60Q56 60 56 66L56 86Z"/>';

export const composeIcon = ({ rounded, glyphPct }: IconSpec): string => {
  const sizePx = (512 * glyphPct) / 100;
  const scale = sizePx / 100;
  const offset = (512 - sizePx) / 2;
  const corners = rounded ? ' rx="114" ry="114"' : "";
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">',
    '<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">',
    '<stop offset="0" stop-color="#1e293b"/><stop offset="1" stop-color="#0f172a"/>',
    "</linearGradient></defs>",
    `<rect width="512" height="512"${corners} fill="url(#bg)"/>`,
    `<g transform="translate(${offset} ${offset}) scale(${scale})">${GLYPH}</g>`,
    "</svg>",
  ].join("");
};

export type IcoImage = { size: number; data: Buffer };

export const encodeIco = (images: readonly IcoImage[]): Buffer => {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const directory = Buffer.alloc(16 * images.length);
  let offset = header.length + directory.length;
  const bodies: Buffer[] = [];
  images.forEach((image, index) => {
    const at = index * 16;
    const dimension = image.size >= 256 ? 0 : image.size;
    directory.writeUInt8(dimension, at);
    directory.writeUInt8(dimension, at + 1);
    directory.writeUInt16LE(1, at + 4);
    directory.writeUInt16LE(32, at + 6);
    directory.writeUInt32LE(image.data.length, at + 8);
    directory.writeUInt32LE(offset, at + 12);
    offset += image.data.length;
    bodies.push(image.data);
  });
  return Buffer.concat([header, directory, ...bodies]);
};
