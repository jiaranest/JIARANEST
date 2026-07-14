/** Format a whole-rupee amount as Indian currency, e.g. 4999 -> "₹4,999". */
export function inr(amount: number): string {
  return '₹' + Math.round(amount).toLocaleString('en-IN');
}
