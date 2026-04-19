export function drawCards(deck, count = 3) {
  const shuffled = [...deck].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
