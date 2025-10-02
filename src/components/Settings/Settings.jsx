const Settings = ({ setShowTwoFactorSetup, handleRouteChangeHome, handleRouteChange2FASetup, user2FAEnabled }) => {
    if (user2FAEnabled) {
        return (
            <div className="glass br3 ba b--black-10 mv4 w-90 w-75-m w-50-l mw7 shadow-5 center">
                <main className="pa4 black-80">
                    <div className="measure flex flex-col items-start w-full">
                        <h2 className="f2 fw6 mb2 w-full">Two-Factor Authentication</h2>
                    </div>
                    <div className="mt3 pa3 ba b--black-20 br2 w-full">
                        <p className="f5 lh-copy w-full">
                            ✅ 2FA is already enabled for your account.
                        </p>
                    </div>
                </main>
            </div>
        );
    }

  return (
    <div className="glass br3 ba b--black-10 mv4 w-90 w-75-m w-50-l mw6 shadow-5 center">
      <main className="pa4 black-80">
        <div className="measure">
          <h2 className="f2 fw6 ph0 mh0 mb3">Account Settings</h2>
          
          <div className="mt4">
            <h3 className="f3 fw6 mb2">Security</h3>
            
            <div className="mt3 pa3 ba b--black-20 br2 w-full">
                <div className="stack-vertical">
                    <h4 className="f4 fw6 ma0 mb2">Two-Factor Authentication</h4>
                    <p className="f6 gray ma0 mb3">
                        Add an extra layer of security to your account
                    </p>
                    <button
                        // onClick={setShowTwoFactorSetup}
                        onClick={handleRouteChange2FASetup}
                        className="b ph3 pv2 input-reset ba b--black bg-transparent hover-bg-black hover-white text-black grow pointer f6"
                        >
                        Go to security setup
                    </button>
                </div>
            </div>


            
            <div className="mt4">
              <button
                onClick={handleRouteChangeHome}
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
