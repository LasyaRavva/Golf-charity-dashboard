import Button from '../common/Button';
import { simulateDraw } from '../../utils/drawEngine';

export default function DrawManager() {
  const preview = simulateDraw(['Entry 1', 'Entry 2', 'Entry 3', 'Entry 4']);

  return (
    <section className="card">
      <h3>Draw Manager</h3>
      <p className="muted">Preview winner: {preview.winner}</p>
      <Button>Run Monthly Draw</Button>
    </section>
  );
}
