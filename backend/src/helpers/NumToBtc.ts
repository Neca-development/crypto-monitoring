export function NumToBtc(number: number): number {
  if (number != 0) {
    number = number / 100000000
  }

  return number
}
