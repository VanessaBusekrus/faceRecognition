import { useState } from 'react';
import { BACKEND_URL } from '../../config.js';

const TwoFactorSetup = ({ user, handleTwoFactorSetupComplete, handleTwoFactorSetupCancel }) => {
  const [step, setStep] = useState(1); // 1: Generate QR, 2: Verify setup
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [manualEntry, setManualEntry] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateQRCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/enable-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });

      const data = await response.json();

      if (response.ok) {
        setQrCodeUrl(data.qrCode);
        setManualEntry(data.manualEntry);
        setStep(2);
      } else {
        alert(data.message || 'Failed to generate 2FA setup');
      }
    } catch (err) {
      console.error('Error generating 2FA setup:', err);
      alert('Error setting up 2FA. Please try again.');
    }
    setIsLoading(false);
  };

  const verifySetup = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      alert('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/verify-2fa-setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          token: verificationCode
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('2FA setup verified successfully:', data); // only prints TRUE if successful
        handleTwoFactorSetupComplete();
      } else {
        alert(data.message || 'Invalid code. Please try again.');
        setVerificationCode('');
      }
    } catch (err) {
      console.error('Error verifying 2FA setup:', err);
      alert('Error verifying 2FA. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="br3 ba b--black-10 mv4 w-100 w-75-m w-50-l mw7 shadow-5 center">
      <main className="pa4 black-80">
        <div className="measure center">
          <h2 className="f1 fw6 ph0 mh0">Setup Two-Factor Authentication</h2>
          
          {step === 1 && (
            <div>
              <p className="f5 lh-copy">
                Two-factor authentication adds an extra layer of security to your account.
                You'll need an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator.
              </p>
              
              <div className="mt4">
                <button
                  onClick={generateQRCode}
                  className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib mr2"
                  disabled={isLoading}
                >
                  {isLoading ? 'Generating...' : 'Setup 2FA'}
                </button>
                <button
                  onClick={handleTwoFactorSetupCancel}
                  className="ph3 pv2 input-reset ba b--gray bg-transparent grow pointer f6 dib"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="f5 lh-copy mb3">
                Scan this QR code with your authenticator app:
              </p>
              
              {qrCodeUrl && (
                <div className="tc mb3">
                  <img src={qrCodeUrl} alt="2FA QR Code" className="ba b--black-20" />
                </div>
              )}
              
              <details className="mb3">
                <summary className="pointer f6 gray">Can't scan? Enter manually</summary>
                <div className="mt2 pa2 bg-light-gray">
                  <p className="f7 gray mb1">Secret Key:</p>
                  <code className="f6 db">{manualEntry}</code>
                </div>
              </details>
              
              <div className="mt3">
                <label className="db fw6 lh-copy f6" htmlFor="verification-code">
                  Enter the 6-digit code from your app
                </label>
                <input
                  className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100 tc f3"
                  type="text"
                  id="verification-code"
                  maxLength="6"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  autoComplete="one-time-code"
                />
              </div>
              
              <div className="mt3">
                <button
                  onClick={verifySetup}
                  className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib mr2"
                  disabled={verificationCode.length !== 6 || isLoading}
                >
                  {isLoading ? 'Verifying...' : 'Verify & Enable'}
                </button>
                <button
                  onClick={handleTwoFactorSetupCancel}
                  className="ph3 pv2 input-reset ba b--gray bg-transparent grow pointer f6 dib"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TwoFactorSetup;