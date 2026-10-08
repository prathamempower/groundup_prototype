import { PDFParse } from 'pdf-parse';
import zlib from 'zlib';

export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  try {
    const parser = new PDFParse({ data: buffer });
    const res = await parser.getText();
    if (res && res.text && res.text.trim().length > 10) {
      return res.text.trim();
    }
  } catch {
    // Proceed to fallback stream scanners
  }

  try {
    const textChunks: string[] = [];
    const bufStr = buffer.toString('latin1');

    const literalMatches = bufStr.matchAll(/\(([^()]+)\)\s*Tj/g);
    for (const m of literalMatches) {
      if (m[1] && m[1].length > 1) {
        textChunks.push(m[1].trim());
      }
    }

    const tjMatches = bufStr.matchAll(/\[(.*?)\]\s*TJ/g);
    for (const m of tjMatches) {
      const parts = m[1].match(/\(([^()]+)\)/g);
      if (parts) {
        const combined = parts.map((p) => p.slice(1, -1)).join(' ').trim();
        if (combined.length > 1) textChunks.push(combined);
      }
    }

    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let streamMatch: RegExpExecArray | null;
    while ((streamMatch = streamRegex.exec(bufStr)) !== null) {
      const rawStream = streamMatch[1];
      try {
        const decompressed = zlib.inflateSync(Buffer.from(rawStream, 'latin1')).toString('utf-8');
        const subLiterals = decompressed.matchAll(/\(([^()]+)\)\s*Tj/g);
        for (const sm of subLiterals) {
          if (sm[1] && sm[1].length > 1) textChunks.push(sm[1].trim());
        }
        const subTj = decompressed.matchAll(/\[(.*?)\]\s*TJ/g);
        for (const sm of subTj) {
          const parts = sm[1].match(/\(([^()]+)\)/g);
          if (parts) {
            const combined = parts.map((p) => p.slice(1, -1)).join(' ').trim();
            if (combined.length > 1) textChunks.push(combined);
          }
        }
      } catch {
        // Not a zlib stream
      }
    }

    if (textChunks.length > 0) {
      return textChunks.join('\n');
    }

    const asciiRuns = bufStr.match(/[A-Za-z0-9$,.:/%#& -]{5,}/g);
    if (asciiRuns && asciiRuns.length > 3) {
      const meaningful = asciiRuns.filter(
        (r) =>
          !r.startsWith('PDF-') &&
          !r.includes('Catalog') &&
          !r.includes('Font') &&
          !r.includes('FlateDecode') &&
          !r.includes('Length') &&
          !r.includes('MediaBox')
      );
      if (meaningful.length > 0) {
        return meaningful.join('\n');
      }
    }
  } catch (err) {
    console.warn('PDF stream fallback exception:', err);
  }

  return '';
}
