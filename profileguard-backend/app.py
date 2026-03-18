from flask import Flask, request, jsonify
import csv
import re

app = Flask(__name__)

# Load suspicious keywords
with open('suspicious_keywords.txt', 'r', encoding='utf-8') as f:
    SUSPICIOUS_KEYWORDS = [line.strip().lower() for line in f if line.strip()]

def analyze_profile(data):
    reasons = []
    score = 0
    followers = int(data.get('followers', 0))
    following = int(data.get('following', 0))
    posts = int(data.get('posts', 0))
    account_age = int(data.get('account_age', 0))
    bio = data.get('bio', '').lower()
    has_profile_picture = data.get('has_profile_picture', True)

    # Rule-based logic
    if followers < 50:
        score += 20
        reasons.append('Very low followers')
    if following > followers * 2:
        score += 15
        reasons.append('High following-to-follower ratio')
    if posts < 5:
        score += 15
        reasons.append('Very few posts')
    if account_age < 6:
        score += 15
        reasons.append('New account (less than 6 months old)')
    if not has_profile_picture:
        score += 20
        reasons.append('Missing profile picture')
    for kw in SUSPICIOUS_KEYWORDS:
        if re.search(r'\b' + re.escape(kw) + r'\b', bio):
            score += 15
            reasons.append(f'Suspicious keyword in bio: "{kw}"')
            break
    if score > 70:
        verdict = 'Highly likely fake'
    elif score > 40:
        verdict = 'Possibly fake'
    else:
        verdict = 'Likely real'
    return {
        'fake_score': min(score, 100),
        'reasons': reasons,
        'verdict': verdict
    }

@app.route('/analyze_profile', methods=['POST'])
def analyze():
    data = request.json
    result = analyze_profile(data)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
