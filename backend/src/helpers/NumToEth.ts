export function NumToEth(number: number): number {
  if (number != 0) {
    number = number / 1000000000000000000
  }

  return number
}
