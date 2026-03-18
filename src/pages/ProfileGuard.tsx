import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

const API_URL = 'http://localhost:5000/analyze_profile'; // Change if backend is hosted elsewhere

const ProfileGuard = () => {
  const [form, setForm] = useState({
    url: '',
    followers: '',
    following: '',
    posts: '',
    account_age: '',
    bio: '',
    has_profile_picture: true,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const resp = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          followers: Number(form.followers),
          following: Number(form.following),
          posts: Number(form.posts),
          account_age: Number(form.account_age),
        }),
      });
      const data = await resp.json();
      setResult(data);
    } catch (err) {
      setResult({ error: 'Failed to analyze profile.' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-100 via-white to-pink-100">
      <Navigation />
      <main className="flex-grow flex flex-col items-center justify-center py-8">
        <div className="w-full max-w-xl bg-white/80 rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-veritas-purple mb-2 text-center">ProfileGuard</h1>
          <p className="text-center text-gray-600 mb-6">Analyze social profiles for signs of fake accounts.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="url"
              name="url"
              placeholder="Profile URL (Instagram, Tinder, etc.)"
              className="w-full rounded-lg border px-4 py-2"
              value={form.url}
              onChange={handleChange}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <input type="number" name="followers" placeholder="Followers" className="rounded-lg border px-4 py-2" value={form.followers} onChange={handleChange} required />
              <input type="number" name="following" placeholder="Following" className="rounded-lg border px-4 py-2" value={form.following} onChange={handleChange} required />
              <input type="number" name="posts" placeholder="Posts" className="rounded-lg border px-4 py-2" value={form.posts} onChange={handleChange} required />
              <input type="number" name="account_age" placeholder="Account Age (months)" className="rounded-lg border px-4 py-2" value={form.account_age} onChange={handleChange} required />
            </div>
            <textarea name="bio" placeholder="Bio" className="w-full rounded-lg border px-4 py-2" value={form.bio} onChange={handleChange} />
            <label className="flex items-center gap-2">
              <input type="checkbox" name="has_profile_picture" checked={form.has_profile_picture} onChange={handleChange} />
              Has profile picture
            </label>
            <button type="submit" className="w-full bg-veritas-purple text-white font-semibold py-2 rounded-lg hover:bg-veritas-purple/90 transition">
              {loading ? (
                <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" /> Analyzing...</span>
              ) : (
                'Analyze'
              )}
            </button>
          </form>
          {result && (
            <div className="mt-8">
              {result.error ? (
                <div className="bg-red-100 text-red-700 rounded-lg p-4 flex items-center gap-2"><AlertTriangle /> {result.error}</div>
              ) : (
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center mb-4">
                    <span className="text-lg font-semibold mb-1">Fake Score</span>
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                      <div className={`bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 h-4 rounded-full`} style={{ width: `${result.fake_score}%` }} />
                    </div>
                    <span className="text-2xl font-bold text-veritas-purple">{result.fake_score}%</span>
                  </div>
                  <ul className="text-left w-full mb-2">
                    {result.reasons && result.reasons.map((r, i) => (
                      <li key={i} className="text-gray-700 text-sm flex items-center gap-2 mb-1">- {r}</li>
                    ))}
                  </ul>
                  <div className={`mt-2 text-lg font-bold flex items-center gap-2 ${result.verdict.includes('fake') ? 'text-red-600' : 'text-green-600'}`}>
                    {result.verdict.includes('fake') ? <AlertTriangle /> : <CheckCircle />} {result.verdict}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfileGuard;
