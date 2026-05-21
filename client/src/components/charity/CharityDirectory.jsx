import CharityCard from './CharityCard';

export default function CharityDirectory({ charities }) {
  return (
    <section className="grid-3">
      {charities.map((charity) => (
        <CharityCard key={charity.id} charity={charity} />
      ))}
    </section>
  );
}
