/** I due contendenti. `X` è sempre la persona, `O` sempre il computer. */
export type Player = 'X' | 'O';

/** Una casella: occupata da un giocatore, oppure vuota. */
export type Cell = Player | null;

/** Nove caselle in ordine di lettura, da in alto a sinistra a in basso a destra. */
export type Board = readonly Cell[];
