export function add(a: number, b: number): number | undefined {
  return a + b;
}

export function subtract(a: number, b: number): number | undefined {
  return a - b;
}

export function multiply(a: number, b: number): number | undefined {
  return a * b;
}

export function divide(a: number, b: number): number | undefined {
  if (b === 0) {
    return undefined;
  }
  return a / b;
}
