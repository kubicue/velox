/**
 * Velox - Native Zero-Dependency Code 128 Barcode Generator
 * Generates standards-compliant SVG barcodes for USPS / carrier tracking numbers.
 */

// Code 128 patterns (widths of bars and spaces, 6 digits each representing widths summing to 11, stop pattern sums to 13)
const CODE128_PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213", // 0-9
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132", // 10-19
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211", // 20-29
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313", // 30-39
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331", // 40-49
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111", // 50-59
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214", // 60-69
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111", // 70-79
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141", // 80-89
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141", // 90-99
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112"                                 // 100-106 (106 is STOP pattern)
];

const START_B = 104;
const START_C = 105;
const STOP = 106;

/**
 * Encodes input string to Code 128 symbols and produces clean SVG.
 * Automatically chooses Set C for purely numeric USPS tracking codes,
 * or Set B for alphanumeric barcodes.
 * 
 * @param {string} text - Tracking number or identifier to encode
 * @param {Object} options - Barcode display options
 * @returns {string} SVG string
 */
export function generateBarcodeSVG(text, options = {}) {
  const cleanText = String(text || "").replace(/\s+/g, "").toUpperCase();
  if (!cleanText) return "";

  const barHeight = options.height || 70;
  const moduleWidth = options.moduleWidth || 2;
  const quietZone = options.quietZone !== undefined ? options.quietZone : 20;

  const isAllDigits = /^\d+$/.test(cleanText);
  let symbols = [];
  let checksum = 0;

  if (isAllDigits && cleanText.length % 2 === 0) {
    // Code 128 Set C: Pairs of digits (USPS standard)
    symbols.push(START_C);
    checksum = START_C;
    let weight = 1;

    for (let i = 0; i < cleanText.length; i += 2) {
      const val = parseInt(cleanText.substr(i, 2), 10);
      symbols.push(val);
      checksum += val * weight;
      weight++;
    }
  } else {
    // Code 128 Set B: Standard ASCII
    symbols.push(START_B);
    checksum = START_B;
    let weight = 1;

    for (let i = 0; i < cleanText.length; i++) {
      const code = cleanText.charCodeAt(i) - 32;
      const val = code >= 0 && code <= 95 ? code : 0;
      symbols.push(val);
      checksum += val * weight;
      weight++;
    }
  }

  // Calculate Checksum mod 103
  const checkDigit = checksum % 103;
  symbols.push(checkDigit);
  symbols.push(STOP);

  // Convert symbols to binary modules (1 = bar, 0 = space)
  let binaryString = "";
  for (const sym of symbols) {
    const pattern = CODE128_PATTERNS[sym];
    let isBar = true;
    for (let i = 0; i < pattern.length; i++) {
      const width = parseInt(pattern[i], 10);
      binaryString += (isBar ? "1" : "0").repeat(width);
      isBar = !isBar;
    }
  }

  // Render binary string into SVG rects
  const totalModules = binaryString.length;
  const totalWidth = totalModules * moduleWidth + quietZone * 2;
  const svgHeight = barHeight;

  let rects = [];
  let currentX = quietZone;

  for (let i = 0; i < totalModules; i++) {
    if (binaryString[i] === "1") {
      // Find consecutive bar length for cleaner SVG rect
      let run = 1;
      while (i + 1 < totalModules && binaryString[i + 1] === "1") {
        run++;
        i++;
      }
      rects.push(`<rect x="${currentX}" y="0" width="${run * moduleWidth}" height="${barHeight}" fill="#000000" />`);
      currentX += run * moduleWidth;
    } else {
      currentX += moduleWidth;
    }
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${svgHeight}" preserveAspectRatio="xMidYMid meet" class="barcode-svg" role="img" aria-label="Barcode for ${cleanText}">
      <rect width="100%" height="100%" fill="#ffffff" />
      ${rects.join("\n      ")}
    </svg>
  `.trim();
}

