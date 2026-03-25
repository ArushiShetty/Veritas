import React, { useState, useContext } from 'react';
import { VeritasUIContext } from '../App';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Loader2, CheckCircle, AlertTriangle, Info, ThumbsUp, ThumbsDown, Flag, User } from 'lucide-react';

const API_URL = 'http://localhost:5000/analyze_profile'; // Change if backend is hosted elsewhere

const suspiciousKeywords = [
  'DM for collab', 'crypto', 'sugar daddy', 'free followers', 'click link', 'investment', 'bitcoin', 'forex', 'win money', 'adult', 'escort', 'onlyfans', 'cashapp', 'venmo', 'promo', 'sponsor'
];

const EMERGENCY_HELPLINES = {
  en: [
    'Women Helpline: 181',
    'Police: 100',
    'Cybercrime Helpline: 1930',
    'Child Helpline: 1098',
    'National Commission for Women: 7827-170-170',
    'Mental Health: 9152987821',
    'Senior Citizen Helpline: 14567',
    'Disaster Management: 108',
  ],
  hi: [
    'महिला हेल्पलाइन: 181',
    'पुलिस: 100',
    'साइबर अपराध हेल्पलाइन: 1930',
    'बाल हेल्पलाइन: 1098',
    'राष्ट्रीय महिला आयोग: 7827-170-170',
    'मानसिक स्वास्थ्य: 9152987821',
    'वरिष्ठ नागरिक हेल्पलाइन: 14567',
    'आपदा प्रबंधन: 108',
  ],
  kn: [
    'ಮಹಿಳಾ ಸಹಾಯವಾಣಿ: 181',
    'ಪೊಲೀಸ್: 100',
    'ಸೈಬರ್ ಕ್ರೈಂ ಸಹಾಯವಾಣಿ: 1930',
    'ಮಕ್ಕಳ ಸಹಾಯವಾಣಿ: 1098',
    'ರಾಷ್ಟ್ರೀಯ ಮಹಿಳಾ ಆಯೋಗ: 7827-170-170',
    'ಮಾನಸಿಕ ಆರೋಗ್ಯ: 9152987821',
    'ವಯೋವೃದ್ಧರ ಸಹಾಯವಾಣಿ: 14567',
    'ವಿಪತ್ತು ನಿರ್ವಹಣೆ: 108',
  ]
};


const ProfileGuardScanner = () => {
  const [step, setStep] = useState(1);
  const { language, darkMode } = useContext(VeritasUIContext);
  const [form, setForm] = useState({
    url: '',
    followers: '',
    following: '',
    posts: '',
    account_age: '',
    bio: '',
    has_profile_picture: true,
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm((prev) => ({ ...prev, image: e.target.files![0] }));
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    // For demo: always show a mock result
    setTimeout(() => {
      setResult({
        fake_score: 72,
        reasons: [
          'Very low followers',
          'High following-to-follower ratio',
          'Suspicious keyword in bio: "crypto"',
          'Missing profile picture'
        ],
        verdict: 'Highly likely fake',
        timeline: [
          { label: 'Account created', value: `${form.account_age} months ago` },
          { label: 'Posts', value: form.posts },
          { label: 'Followers', value: form.followers },
          { label: 'Following', value: form.following },
        ]
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-purple-100 via-white to-pink-100'}`}> 
      <Navigation />
      <main className="flex-grow flex flex-col items-center justify-center py-8">
        {/* Global toggles are now in App bar */}
        <div className="w-full max-w-xl bg-white/80 rounded-2xl shadow-lg p-8">
          <h1 className={`text-3xl font-bold mb-2 text-center flex items-center gap-2 ${darkMode ? 'text-white' : 'text-veritas-purple'}`}><User /> ProfileGuard Scanner</h1>
          <p className={`text-center mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Step-by-step analysis of social profiles for fake detection.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <label className="block font-medium mb-1">Profile URL <Info className="inline h-4 w-4 text-gray-400" title="Instagram, Tinder, etc." /></label>
                <input type="url" name="url" placeholder="Profile URL" className="w-full rounded-lg border px-4 py-2 mb-2" value={form.url} onChange={handleChange} required />
                <label className="block font-medium mb-1">Profile Image (optional)</label>
                <input type="file" accept="image/*" onChange={handleImageChange} className="mb-2" />
                {imagePreview && <img src={imagePreview} alt="Preview" className="h-32 w-32 object-cover rounded-lg mx-auto mb-2" />}
                <button type="button" className="w-full bg-veritas-purple text-white font-semibold py-2 rounded-lg hover:bg-veritas-purple/90 transition" onClick={handleNext}>Next</button>
              </>
            )}
            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" name="followers" placeholder="Followers" className="rounded-lg border px-4 py-2" value={form.followers} onChange={handleChange} required />
                  <input type="number" name="following" placeholder="Following" className="rounded-lg border px-4 py-2" value={form.following} onChange={handleChange} required />
                  <input type="number" name="posts" placeholder="Posts" className="rounded-lg border px-4 py-2" value={form.posts} onChange={handleChange} required />
                  <input type="number" name="account_age" placeholder="Account Age (months)" className="rounded-lg border px-4 py-2" value={form.account_age} onChange={handleChange} required />
                </div>
                <label className="block font-medium mb-1 mt-2">Bio</label>
                <textarea name="bio" placeholder="Bio" className="w-full rounded-lg border px-4 py-2" value={form.bio} onChange={handleChange} />
                <label className="flex items-center gap-2 mt-2">
                  <input type="checkbox" name="has_profile_picture" checked={form.has_profile_picture} onChange={handleChange} />
                  Has profile picture
                </label>
                <div className="flex justify-between mt-4">
                  <button type="button" className="bg-gray-200 text-gray-700 rounded-lg px-4 py-2" onClick={handleBack}>Back</button>
                  <button type="submit" className="bg-veritas-purple text-white rounded-lg px-4 py-2 font-semibold">Analyze</button>
                </div>
              </>
            )}
          </form>
          {loading && (
            <div className="flex flex-col items-center mt-8">
              <Loader2 className="animate-spin h-8 w-8 text-veritas-purple mb-2" />
              <span className="text-veritas-purple font-medium">Analyzing profile...</span>
            </div>
          )}
          {result && (
            <div className="mt-8">
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <div className="w-full flex flex-col items-center mb-4">
                  <span className="text-lg font-semibold mb-1">Fake Score</span>
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                    <div className={`bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 h-4 rounded-full`} style={{ width: `${result.fake_score}%` }} />
                  </div>
                  <span className="text-2xl font-bold text-veritas-purple">{result.fake_score}%</span>
                  <div className="flex gap-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${result.fake_score > 70 ? 'bg-red-100 text-red-700' : result.fake_score > 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                      {result.fake_score > 70 ? 'High Risk' : result.fake_score > 40 ? 'Suspicious' : 'Safe'}
                    </span>
                  </div>
                </div>
                <ul className="text-left w-full mb-2">
                  {result.reasons && result.reasons.map((r: string, i: number) => (
                    <li key={i} className="text-gray-700 text-sm flex items-center gap-2 mb-1">- {r}</li>
                  ))}
                </ul>
                <div className={`mt-2 text-lg font-bold flex items-center gap-2 ${result.verdict.includes('fake') ? 'text-red-600' : 'text-green-600'}`}>
                  {result.verdict.includes('fake') ? <AlertTriangle /> : <CheckCircle />} {result.verdict}
                </div>
                {result.timeline && (
                  <div className="w-full mt-4">
                    <h3 className="text-md font-semibold mb-2">Profile Summary</h3>
                    <ul className="text-sm text-gray-600">
                      {result.timeline.map((item: any, idx: number) => (
                        <li key={idx} className="mb-1 flex gap-2 items-center"><Info className="h-4 w-4 text-gray-400" /> <span className="font-medium">{item.label}:</span> {item.value}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex gap-4 mt-6">
                  <button className={`flex items-center gap-1 px-3 py-1 rounded-lg border ${feedback === 'correct' ? 'bg-green-100 border-green-300' : 'border-gray-200'}`} onClick={() => setFeedback('correct')}><ThumbsUp className="h-4 w-4" /> Correct</button>
                  <button className={`flex items-center gap-1 px-3 py-1 rounded-lg border ${feedback === 'incorrect' ? 'bg-red-100 border-red-300' : 'border-gray-200'}`} onClick={() => setFeedback('incorrect')}><ThumbsDown className="h-4 w-4" /> Incorrect</button>
                  <button className="flex items-center gap-1 px-3 py-1 rounded-lg border border-yellow-200" onClick={() => alert('Reported!')}><Flag className="h-4 w-4 text-yellow-500" /> Report</button>
                </div>
              </div>
            </div>
            <div className={`mt-8 p-4 rounded-xl ${darkMode ? 'bg-gray-800 text-white' : 'bg-purple-50 text-veritas-purple'}`}>
              <h3 className="font-bold mb-2">{language === 'en' ? 'Emergency Helplines' : language === 'hi' ? 'आपातकालीन हेल्पलाइन' : 'ತುರ್ತು ಸಹಾಯವಾಣಿ'}</h3>
              <ul className="text-sm">
                {EMERGENCY_HELPLINES[language].map((hl, i) => (
                  <li key={i} className="mb-1">{hl}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfileGuardScanner;
