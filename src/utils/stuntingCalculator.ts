/**
 * Stunting Calculator
 * Kalkulator stunting berdasarkan standar WHO
 */

// WHO Z-Score standards for stunting calculation (Height-for-Age)
const WHO_TB_U_LAKI = [
  { bulan: 0, median: 49.9, sd_minus1: 48.0, sd_minus2: 46.1, sd_minus3: 44.2 },
  { bulan: 1, median: 54.7, sd_minus1: 52.8, sd_minus2: 50.8, sd_minus3: 48.9 },
  { bulan: 2, median: 58.4, sd_minus1: 56.4, sd_minus2: 54.4, sd_minus3: 52.4 },
  { bulan: 3, median: 61.4, sd_minus1: 59.4, sd_minus2: 57.3, sd_minus3: 55.3 },
  { bulan: 4, median: 63.9, sd_minus1: 61.8, sd_minus2: 59.7, sd_minus3: 57.6 },
  { bulan: 5, median: 65.9, sd_minus1: 63.8, sd_minus2: 61.7, sd_minus3: 59.6 },
  { bulan: 6, median: 67.6, sd_minus1: 65.5, sd_minus2: 63.3, sd_minus3: 61.2 },
  { bulan: 12, median: 75.7, sd_minus1: 73.4, sd_minus2: 71.0, sd_minus3: 68.6 },
  { bulan: 24, median: 87.8, sd_minus1: 84.8, sd_minus2: 81.7, sd_minus3: 78.7 },
  { bulan: 36, median: 96.1, sd_minus1: 92.4, sd_minus2: 88.7, sd_minus3: 85.0 },
  { bulan: 48, median: 103.3, sd_minus1: 99.1, sd_minus2: 94.9, sd_minus3: 90.7 },
  { bulan: 60, median: 110.0, sd_minus1: 105.3, sd_minus2: 100.7, sd_minus3: 96.1 },
];

const WHO_TB_U_PEREMPUAN = [
  { bulan: 0, median: 49.1, sd_minus1: 47.3, sd_minus2: 45.4, sd_minus3: 43.6 },
  { bulan: 1, median: 53.7, sd_minus1: 51.7, sd_minus2: 49.8, sd_minus3: 47.8 },
  { bulan: 2, median: 57.1, sd_minus1: 55.0, sd_minus2: 53.0, sd_minus3: 51.0 },
  { bulan: 3, median: 59.8, sd_minus1: 57.7, sd_minus2: 55.6, sd_minus3: 53.5 },
  { bulan: 4, median: 62.1, sd_minus1: 59.9, sd_minus2: 57.8, sd_minus3: 55.6 },
  { bulan: 5, median: 64.0, sd_minus1: 61.8, sd_minus2: 59.6, sd_minus3: 57.4 },
  { bulan: 6, median: 65.7, sd_minus1: 63.5, sd_minus2: 61.2, sd_minus3: 58.9 },
  { bulan: 12, median: 74.0, sd_minus1: 71.4, sd_minus2: 68.9, sd_minus3: 66.3 },
  { bulan: 24, median: 86.4, sd_minus1: 83.2, sd_minus2: 80.0, sd_minus3: 76.7 },
  { bulan: 36, median: 95.1, sd_minus1: 91.2, sd_minus2: 87.4, sd_minus3: 83.6 },
  { bulan: 48, median: 102.7, sd_minus1: 98.4, sd_minus2: 94.1, sd_minus3: 89.8 },
  { bulan: 60, median: 109.4, sd_minus1: 104.7, sd_minus2: 99.9, sd_minus3: 95.2 },
];

export interface StuntingResult {
  status: string;
  zscore: number;
  color: string;
}

/**
 * Calculate stunting status based on WHO standards
 * @param usiaBulan - Age in months
 * @param tinggiBadan - Height in cm
 * @param jenisKelamin - Gender (L/P)
 * @returns Stunting status, z-score, and color
 */
export function calculateStuntingStatus(
  usiaBulan: number,
  tinggiBadan: number,
  jenisKelamin: "L" | "P"
): StuntingResult {
  const whoData = jenisKelamin === "L" ? WHO_TB_U_LAKI : WHO_TB_U_PEREMPUAN;
  
  // Find the closest age data
  let closestData = whoData[0];
  let minDiff = Math.abs(whoData[0].bulan - usiaBulan);
  
  for (const data of whoData) {
    const diff = Math.abs(data.bulan - usiaBulan);
    if (diff < minDiff) {
      minDiff = diff;
      closestData = data;
    }
  }
  
  // Calculate Z-score (approximate)
  const sd = closestData.median - closestData.sd_minus1;
  const zscore = (tinggiBadan - closestData.median) / sd;
  
  if (zscore < -3) {
    return { status: "Stunting Berat", zscore, color: "#dc2626" };
  } else if (zscore < -2) {
    return { status: "Stunting Ringan", zscore, color: "#f97316" };
  } else if (zscore < -1) {
    return { status: "Risiko Stunting", zscore, color: "#eab308" };
  } else {
    return { status: "Normal", zscore, color: "#22c55e" };
  }
}
