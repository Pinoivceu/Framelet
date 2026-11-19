export default function EmbedNotFound() {
  return (
    <main className="embed-page">
      <section className="embed-unavailable widget theme-system" data-font="sans">
        <span className="unavailable-mark" aria-hidden="true">□</span>
        <p>Widget tidak tersedia atau telah dihapus.</p>
      </section>
    </main>
  );
}
