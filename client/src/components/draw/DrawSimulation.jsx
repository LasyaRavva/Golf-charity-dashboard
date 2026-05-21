import { simulateDraw } from '../../utils/drawEngine';

export default function DrawSimulation() {
  const result = simulateDraw(['Ticket-104', 'Ticket-121', 'Ticket-155']);

  return (
    <section className="card">
      <h3>Draw Simulation</h3>
      <p className="muted">Random sample winner: {result.winner}</p>
    </section>
  );
}
