const TwoFactorVerify = ({ twoFactorCode, setTwoFactorCode, handleTwoFactorSubmit, handleTwoFactorCancel }) => {
  return (
    <div className="br3 ba b--black-10 mv4 w-100 w-50-m w-25-l mw6 shadow-5 center">
      <main className="pa4 black-80">
        <div className="measure">
          <h2 className="f1 fw6 ph0 mh0">Two-Factor Authentication</h2>
          <p className="f6 gray">
            Enter the 6-digit code from your authenticator app
          </p>
          
          <div className="mt3">
            <label className="db fw6 lh-copy f6" htmlFor="two-factor-code">
              Authentication Code
            </label>
            <input
              className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100 tc f3"
              type="text"
              id="two-factor-code"
              maxLength="6"
              placeholder="000000"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
              autoComplete="one-time-code"
              autoFocus
            />
          </div>
          
          <div className="mt3">
            <button
              onClick={handleTwoFactorSubmit}
              className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib mr2"
              disabled={twoFactorCode.length !== 6}
            >
              Verify
            </button>
            <button
              onClick={handleTwoFactorCancel}
              className="ph3 pv2 input-reset ba b--gray bg-transparent grow pointer f6 dib"
            >
              Cancel
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TwoFactorVerify;
