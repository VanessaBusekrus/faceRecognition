const Settings = ({ setShowTwoFactorSetup, handleRouteChange, user2FAEnabled }) => {
  if (user2FAEnabled) {
      return (
        <div className="br3 ba b--black-10 mv4 w-100 w-75-m w-50-l mw7 shadow-5 center">
          <main className="pa4 black-80">
            <div className="measure center">
              <h2 className="f1 fw6 ph0 mh0">Two-Factor Authentication</h2>
              <p className="f5 lh-copy">
                ✅ 2FA is already enabled for your account.
              </p>
            </div>
          </main>
        </div>
      );
    }
  
    return (
    <div className="br3 ba b--black-10 mv4 w-100 w-50-m w-25-l mw6 shadow-5 center">
      <main className="pa4 black-80">
        <div className="measure">
          <h2 className="f1 fw6 ph0 mh0">Account Settings</h2>
          
          <div className="mt4">
            <h3 className="f3 fw6">Security</h3>
            
            <div className="mt3 pa3 ba b--black-20 br2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="f4 fw6 ma0">Two-Factor Authentication</h4>
                  <p className="f6 gray ma0 mt1">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <button
                  onClick={setShowTwoFactorSetup}
                  className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6"
                >
                  Enable 2FA
                </button>
              </div>
            </div>
            
            <div className="mt4">
              <button
                onClick={handleRouteChange}
                className="ph3 pv2 input-reset ba b--gray bg-transparent grow pointer f6"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
