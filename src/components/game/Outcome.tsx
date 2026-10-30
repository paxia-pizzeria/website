import { outcomeMessage, type Phase } from '@/game/narration';

interface Props {
  phase: Exclude<Phase, 'playing'>;
  onReplay: () => void;
}

export function Outcome({ phase, onReplay }: Props) {
  return (
    <div class="outcome" data-testid="outcome">
      <p class="outcome__verdict">{outcomeMessage(phase)}</p>
      <button type="button" class="button" data-testid="replay" onClick={onReplay}>
        Gioca ancora
      </button>
    </div>
  );
}
