import { useState } from 'react';
import { Github, Check, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { githubService } from '../services/githubService';

interface GitHubSetupProps {
  onSetupComplete: () => void;
}

export function GitHubSetup({ onSetupComplete }: GitHubSetupProps) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Initialize with token
      githubService.initialize(token);

      // Test connection by fetching database
      const db = await githubService.fetchDatabase();
      
      if (db) {
        setSuccess(true);
        setTimeout(() => {
          onSetupComplete();
        }, 1500);
      } else {
        setError('ডেটাবেস লোড করতে সমস্যা হয়েছে');
      }
    } catch (err) {
      setError('ভুল টোকেন বা সংযোগ সমস্যা');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Use local mode (will be prompted later)
    onSetupComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Github className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">GitHub সংযোগ</h1>
          <p className="text-gray-600 mt-2">
            আপনার ডেটা নিরাপদে GitHub-এ সংরক্ষণ করুন
          </p>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-600 mb-2">সংযোগ সফল!</h3>
            <p className="text-gray-600">GitHub-এ ডেটা সংরক্ষণ প্রস্তুত</p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GitHub Personal Access Token
                </label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  আপনার টোকেন কখনো শেয়ার করবেন না
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    সংযোগ হচ্ছে...
                  </>
                ) : (
                  <>
                    <Github className="w-5 h-5" />
                    GitHub-এ সংযোগ করুন
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="text-orange-600 text-sm font-medium hover:underline flex items-center gap-1"
              >
                কীভাবে টোকেন তৈরি করবেন?
              </button>

              {showInstructions && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-2">
                  <p className="font-medium">ধাপে ধাপে নির্দেশনা:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>GitHub-এ লগইন করুন</li>
                    <li>Settings → Developer settings এ যান</li>
                    <li>Personal access tokens → Tokens (classic) নির্বাচন করুন</li>
                    <li>Generate new token ক্লিক করুন</li>
                    <li>Note: "KHS Management App" লিখুন</li>
                    <li>Expiration: No expiration নির্বাচন করুন</li>
                    <li>Scopes: repo চেক করুন</li>
                    <li>Generate token ক্লিক করুন</li>
                    <li>টোকেন কপি করে এখানে পেস্ট করুন</li>
                  </ol>
                  <a
                    href="https://github.com/settings/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline mt-2"
                  >
                    টোকেন তৈরি করতে এখানে ক্লিক করুন
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleSkip}
                className="w-full text-gray-500 py-2 hover:text-gray-700 transition-colors"
              >
                পরে সংযোগ করব
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
