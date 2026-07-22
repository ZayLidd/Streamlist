function PublicHome({ onSignIn, onContinueAsGuest }) {
  return (
    <div className="public-shell">
      <nav className="public-nav" aria-label="Public navigation">
        <button className="brand-button" type="button" aria-label="StreamList home">
          StreamList
        </button>

        <div className="public-nav-actions">
          <button className="public-open-app" type="button" onClick={onContinueAsGuest}>
            Open App
          </button>
          <button className="public-sign-in" type="button" onClick={onSignIn}>
            Sign In with Google
          </button>
        </div>
      </nav>

      <main>
        <section className="public-hero" aria-labelledby="public-home-title">
          <div className="public-hero-copy">
            <p className="eyebrow">Your movies, organized</p>
            <h1 id="public-home-title">Build a watchlist worth watching.</h1>
            <p className="public-hero-text">
              Search movies, organize your StreamList, compare subscription
              options, and complete checkout from one application.
            </p>

            <div className="public-actions">
              <button
                className="primary-button"
                type="button"
                onClick={onContinueAsGuest}
              >
                Continue as Guest
              </button>
              <button className="secondary-link" type="button" onClick={onSignIn}>
                Sign In with Google
              </button>
              <a className="secondary-link" href="#public-features">
                Explore Features
              </a>
            </div>

            <p className="public-security-note">
              Google sign in is optional. Guest information remains saved only in
              the browser being used.
            </p>
          </div>

          <div className="public-preview" aria-label="StreamList application preview">
            <div className="preview-window">
              <div className="preview-toolbar" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className="preview-content">
                <p className="eyebrow">Tonight&apos;s queue</p>
                <h2>My StreamList</h2>
                <div className="preview-movie">
                  <span className="preview-poster">01</span>
                  <div>
                    <strong>Find a movie</strong>
                    <small>Search the TMDB catalog</small>
                  </div>
                </div>
                <div className="preview-movie">
                  <span className="preview-poster">02</span>
                  <div>
                    <strong>Save your favorites</strong>
                    <small>Keep your watch queue organized</small>
                  </div>
                </div>
                <div className="preview-movie">
                  <span className="preview-poster">03</span>
                  <div>
                    <strong>Checkout your way</strong>
                    <small>Use guest mode or sign in with Google</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="public-features" id="public-features" aria-labelledby="features-title">
          <p className="eyebrow">What StreamList offers</p>
          <h2 id="features-title">Everything stays simple and connected.</h2>

          <div className="feature-grid">
            <article className="feature-card">
              <span className="feature-number">01</span>
              <h3>Movie Search</h3>
              <p>Search the TMDB catalog and add movies directly to your list.</p>
            </article>

            <article className="feature-card">
              <span className="feature-number">02</span>
              <h3>Guest Access</h3>
              <p>Use the complete application without creating or signing into an account.</p>
            </article>

            <article className="feature-card">
              <span className="feature-number">03</span>
              <h3>Optional Google Sign In</h3>
              <p>Sign in at any time to display your Google profile and use separate saved cards.</p>
            </article>
          </div>
        </section>

        <section className="public-cta">
          <div>
            <p className="eyebrow">Choose how to enter</p>
            <h2>Ready to create your StreamList?</h2>
            <p>Start immediately as a guest, or sign in with Google whenever you choose.</p>
          </div>
          <div className="public-cta-actions">
            <button className="primary-button" type="button" onClick={onContinueAsGuest}>
              Continue as Guest
            </button>
            <button className="public-sign-in" type="button" onClick={onSignIn}>
              Google Sign In
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default PublicHome;
