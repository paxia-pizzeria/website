/** Le due linee divisorie di una griglia, in frazione del lato. */
export type Lines = readonly [number, number];

/** Larghezza delle tre bande delimitate dalle due linee. */
export function bandSizes([first, second]: Lines): [number, number, number] {
  return [first, second - first, 1 - second];
}

/**
 * Centro di ciascuna banda.
 *
 * I segni si posano qui, non a un sesto / metà / cinque sesti: la griglia del tema
 * PAXIA è tracciata a mano e le sue bande hanno larghezze diverse.
 */
export function bandCenters(lines: Lines): [number, number, number] {
  const [a, b, c] = bandSizes(lines);
  return [a / 2, lines[0] + b / 2, lines[1] + c / 2];
}
