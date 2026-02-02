/**
 * Convert decimal numbers to fraction representation
 * Examples:
 * 0.33333 -> "1/3"
 * 0.5 -> "1/2"
 * 0.66667 -> "2/3"
 * 1.5 -> "1 1/2"
 * 2.33 -> "2 1/3"
 */

interface Fraction {
  whole: number;
  numerator: number;
  denominator: number;
}

// Common fractions for cooking (up to 16ths)
const FRACTION_THRESHOLDS = [
  { decimal: 0.0625, fraction: "1/16" },
  { decimal: 0.125, fraction: "1/8" },
  { decimal: 0.1875, fraction: "3/16" },
  { decimal: 0.25, fraction: "1/4" },
  { decimal: 0.3125, fraction: "5/16" },
  { decimal: 0.333, fraction: "1/3" },
  { decimal: 0.375, fraction: "3/8" },
  { decimal: 0.4375, fraction: "7/16" },
  { decimal: 0.5, fraction: "1/2" },
  { decimal: 0.5625, fraction: "9/16" },
  { decimal: 0.583, fraction: "7/12" },
  { decimal: 0.625, fraction: "5/8" },
  { decimal: 0.6667, fraction: "2/3" },
  { decimal: 0.6875, fraction: "11/16" },
  { decimal: 0.75, fraction: "3/4" },
  { decimal: 0.8125, fraction: "13/16" },
  { decimal: 0.833, fraction: "5/6" },
  { decimal: 0.875, fraction: "7/8" },
  { decimal: 0.9375, fraction: "15/16" },
];

/**
 * Find the closest common fraction for a decimal value
 */
function findClosestFraction(decimalPart: number): string | null {
  if (decimalPart === 0) return null;

  let closest = FRACTION_THRESHOLDS[0];
  let minDiff = Math.abs(decimalPart - closest.decimal);

  for (const threshold of FRACTION_THRESHOLDS) {
    const diff = Math.abs(decimalPart - threshold.decimal);
    if (diff < minDiff) {
      minDiff = diff;
      closest = threshold;
    }
  }

  // Only return if difference is small enough (tolerance of 0.02)
  if (minDiff < 0.02) {
    return closest.fraction;
  }

  return null;
}

/**
 * Parse a number string or return the number as-is
 */
function parseNumber(value: any): number {
  if (typeof value === "string") {
    return parseFloat(value);
  }
  return Number(value);
}

/**
 * Convert a decimal number to a mixed fraction string
 * @param value - The decimal number to convert
 * @returns A string representation like "1 1/2" or "1/3"
 */
export function decimalToFraction(value: any): string {
  const num = parseNumber(value);

  if (isNaN(num)) {
    return String(value);
  }

  // Handle whole numbers
  if (Number.isInteger(num)) {
    return String(num);
  }

  // Split into whole and decimal parts
  const whole = Math.floor(num);
  const decimalPart = num - whole;
  const roundedDecimal = Math.round(decimalPart * 10000) / 10000; // Round to 4 decimal places

  const fractionPart = findClosestFraction(roundedDecimal);

  if (!fractionPart) {
    // If no close fraction found, return the original number
    return num.toFixed(2);
  }

  if (whole === 0) {
    return fractionPart;
  }

  return `${whole} ${fractionPart}`;
}

/**
 * Convert a number or string amount with optional unit to a fraction-based amount
 * @param amount - The amount value
 * @param unit - The unit (cup, tbsp, tsp, etc.)
 * @returns Object with formatted amount and unit
 */
export function formatIngredientAmount(
  amount: any,
  unit?: string
): { amount: string; unit?: string } {
  if (!amount) {
    return { amount: "", unit };
  }

  const formattedAmount = decimalToFraction(amount);

  return {
    amount: formattedAmount,
    unit: unit || undefined,
  };
}

/**
 * Format an ingredient object with amount converted to fractions
 */
export function formatIngredient(ingredient: any): {
  name: string;
  amount?: string;
  unit?: string;
  display: string;
} {
  const name = ingredient.name || ingredient;

  if (typeof ingredient === "string") {
    return {
      name,
      display: name,
    };
  }

  const amount = ingredient.amount || ingredient.qty;
  const unit = ingredient.unit;

  if (amount === undefined || amount === null || amount === "") {
    return {
      name,
      display: name,
    };
  }

  const formatted = formatIngredientAmount(amount, unit);

  const display = unit ? `${formatted.amount} ${formatted.unit} ${name}` : `${formatted.amount} ${name}`;

  return {
    name,
    amount: formatted.amount,
    unit: formatted.unit,
    display,
  };
}

/**
 * Batch format multiple ingredients
 */
export function formatIngredients(
  ingredients: any[]
): Array<{ name: string; amount?: string; unit?: string; display: string }> {
  return ingredients.map(formatIngredient);
}
