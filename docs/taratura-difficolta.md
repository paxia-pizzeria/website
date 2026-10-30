# Taratura della difficoltà

`difficulty` è la probabilità che l'AI, invece della mossa ottima, giochi una casella
scelta a caso fra quelle libere. È la manopola del budget promozionale: determina quanti
sconti si regalano.

Misurazione su 20.000 partite per riga, AI come secondo giocatore (`O`), avversario che
gioca **completamente a caso**:

| difficoltà | vince chi gioca | pareggio | vince l'AI |
|---|---|---|---|
| 0 | 0,0% | 22,2% | 77,8% |
| 0,10 | 5,1% | 21,6% | 73,3% |
| 0,15 | 8,1% | 20,9% | 71,0% |
| 0,20 | 10,6% | 21,2% | 68,3% |
| **0,25** | **13,2%** | 20,8% | 66,0% |
| 0,30 | 16,6% | 20,2% | 63,2% |
| 0,40 | 22,0% | 19,4% | 58,6% |
| 0,50 | 28,5% | 18,6% | 52,9% |
| 0,75 | 43,4% | 16,0% | 40,6% |
| 1 | 58,9% | 12,6% | 28,5% |

## Come leggerla, e come non leggerla

**Questi numeri sono un limite inferiore, non una previsione.** L'avversario simulato gioca
a caso; una persona che sa giocare a tris fa molto meglio — blocca le minacce e riconosce
le forchette. A parità di difficoltà, il tasso di vincita reale sarà sensibilmente più alto
di quello in tabella.

Il modo giusto di tarare è quindi: partire da 0,20–0,25, misurare il tasso reale sulle prime
centinaia di partite, e correggere. Il dato in tabella serve a sapere in che direzione
muovere la manopola, non quanto sconto si regalerà.

Da notare che a difficoltà 0 il pareggio resta al 22%: contro un giocatore perfetto il tris
finisce pari, e l'AI vince solo perché l'avversario casuale sbaglia. Con una persona
competente, difficoltà 0 significa **quasi sempre pareggio** — cioè nessuno vince mai nulla,
e la promo non parte. È la ragione per cui la manopola esiste.

La riga a 0 è anche il test di correttezza del minimax: `0,0%` nella prima colonna è ciò che
il property test in `tests/game/ai.test.ts` verifica su mille partite, in entrambi i ruoli.
