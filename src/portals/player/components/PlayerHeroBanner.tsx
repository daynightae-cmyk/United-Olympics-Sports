export function PlayerHeroBanner() {
  return (
    <section className="player-reference-hero" aria-label="Player Portal Hero | واجهة بوابة اللاعب">
      <div className="player-reference-hero__backdrop">
        <img
          src="/media/sports/football/football-01-hero.webp"
          alt=""
          className="player-reference-hero__bg-img"
          aria-hidden="true"
        />
        <div className="player-reference-hero__overlay" aria-hidden="true" />
      </div>

      <div className="player-reference-hero__content">
        <div className="player-reference-hero__copy">
          <h1 className="player-reference-hero__title-en">PLAYER PORTAL</h1>
          <h2 className="player-reference-hero__title-ar">بوابة اللاعب</h2>
          <p className="player-reference-hero__slogan">
            <span>TRAIN. IMPROVE. BELONG.</span>
            <span className="player-reference-hero__slogan-sep">·</span>
            <span className="player-reference-hero__slogan-ar">تدرب. تطوّر. تنتمي.</span>
          </p>
        </div>

        <div className="player-reference-hero__brand-callout" aria-hidden="true">
          <span className="player-reference-hero__callout-line1">Bigger Players</span>
          <span className="player-reference-hero__callout-line2">Brighter Tomorrows</span>
        </div>
      </div>
    </section>
  );
}
