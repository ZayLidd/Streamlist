import { GoogleLogin } from "@react-oauth/google";

function LoginScreen({
  googleClientIdConfigured,
  onGoogleSuccess,
  errorMessage,
  onBackHome,
  onContinueAsGuest,
}) {
  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <button className="login-back-button" type="button" onClick={onBackHome}>
          ← Back to Home
        </button>
        <div className="login-logo" aria-hidden="true">
          S
        </div>

        <p className="eyebrow">Optional account access</p>
        <h1 id="login-title">Sign in to StreamList</h1>
        <p className="login-copy">
          Use your Google account to display your profile and keep a separate
          saved card list. Every application feature also works in guest mode.
        </p>

        {googleClientIdConfigured ? (
          <div className="google-login-wrapper">
            <GoogleLogin
              onSuccess={onGoogleSuccess}
              onError={() => onGoogleSuccess(null)}
              theme="filled_black"
              size="large"
              shape="pill"
              text="signin_with"
              width="300"
            />
          </div>
        ) : (
          <div className="configuration-warning" role="alert">
            <strong>Google OAuth setup required</strong>
            <p>
              Copy <code>.env.example</code> to <code>.env</code>, then replace
              the placeholder with your Google Web Client ID. Guest mode remains
              fully available.
            </p>
          </div>
        )}

        {errorMessage && (
          <p className="form-error" role="alert">
            {errorMessage}
          </p>
        )}

        <button
          className="guest-login-button"
          type="button"
          onClick={onContinueAsGuest}
        >
          Continue Without Signing In
        </button>

        <p className="login-note">
          Guest data is stored locally and may differ between browsers or devices.
        </p>
      </section>
    </main>
  );
}

export default LoginScreen;
