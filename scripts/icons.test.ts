import { describe, expect, test } from "bun:test";
import { composeIcon, encodeIco } from "./icons.ts";

describe("composeIcon", () => {
  test("rounded variant carries corner radii; maskable variant is full-bleed", () => {
    expect(composeIcon({ rounded: true, glyphPct: 58 })).toContain('rx="114"');
    expect(composeIcon({ rounded: false, glyphPct: 52 })).not.toContain("rx=");
  });

  test("is a 512x512 svg with the house glyph", () => {
    const svg = composeIcon({ rounded: true, glyphPct: 58 });
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain('viewBox="0 0 512 512"');
    expect(svg).toContain("<path");
  });
});

describe("encodeIco", () => {
  const fakePng = (n: number): Buffer => Buffer.alloc(n, 7);

  test("writes a valid ICONDIR header and one entry per image", () => {
    const ico = encodeIco([
      { size: 16, data: fakePng(40) },
      { size: 32, data: fakePng(80) },
      { size: 48, data: fakePng(120) },
    ]);
    expect(ico.readUInt16LE(0)).toBe(0);
    expect(ico.readUInt16LE(2)).toBe(1);
    expect(ico.readUInt16LE(4)).toBe(3);
  });

  test("each directory entry points at its image bytes with correct length and offset", () => {
    const images = [
      { size: 16, data: fakePng(40) },
      { size: 32, data: fakePng(80) },
    ];
    const ico = encodeIco(images);
    let expectedOffset = 6 + 16 * images.length;
    images.forEach((image, index) => {
      const at = 6 + index * 16;
      expect(ico.readUInt8(at)).toBe(image.size);
      expect(ico.readUInt8(at + 1)).toBe(image.size);
      expect(ico.readUInt16LE(at + 4)).toBe(1);
      expect(ico.readUInt16LE(at + 6)).toBe(32);
      expect(ico.readUInt32LE(at + 8)).toBe(image.data.length);
      expect(ico.readUInt32LE(at + 12)).toBe(expectedOffset);
      expect(ico.subarray(expectedOffset, expectedOffset + image.data.length)).toEqual(image.data);
      expectedOffset += image.data.length;
    });
  });

  test("encodes 256-pixel images as 0 in the directory (ICO convention)", () => {
    const ico = encodeIco([{ size: 256, data: fakePng(10) }]);
    expect(ico.readUInt8(6)).toBe(0);
    expect(ico.readUInt8(7)).toBe(0);
  });
});
