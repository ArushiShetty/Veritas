

import React, { useContext } from 'react';
import { VeritasUIContext } from '../App';
import { Link } from 'react-router-dom';
import { Shield, Github, Heart } from 'lucide-react';

const translations = {
  en: {
    platform: 'Platform',
    profileGuard: 'ProfileGuard',
    report: 'Report Submission',
    evidence: 'Evidence Timestamping',
    quiz: 'Self-Defense Quiz',
    resources: 'Resources',
    verify: 'Verify Case ID',
    documentation: 'Documentation',
    support: 'Support',
    blog: 'Blog',
    help: 'Help',
    safetyResources: 'Safety Resources',
    reportAbuse: 'Report Abuse',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    madeWith: 'Made with',
    forSafer: 'for a safer digital world',
    description: 'A digital safety platform empowering women against online threats and harassment.',
    copyright: 'All rights reserved.'
  },
  hi: {
    platform: 'प्लेटफ़ॉर्म',
    profileGuard: 'प्रोफाइल गार्ड',
    report: 'रिपोर्ट सबमिशन',
    evidence: 'सबूत टाइमस्टैम्पिंग',
    quiz: 'सेल्फ-डिफेंस क्विज़',
    resources: 'संसाधन',
    verify: 'मामला सत्यापित करें',
    documentation: 'दस्तावेज़ीकरण',
    support: 'सहायता',
    blog: 'ब्लॉग',
    help: 'मदद',
    safetyResources: 'सुरक्षा संसाधन',
    reportAbuse: 'दुरुपयोग रिपोर्ट करें',
    privacy: 'गोपनीयता नीति',
    terms: 'सेवा की शर्तें',
    madeWith: 'के साथ बनाया गया',
    forSafer: 'एक सुरक्षित डिजिटल दुनिया के लिए',
    description: 'एक डिजिटल सुरक्षा मंच जो महिलाओं को ऑनलाइन खतरों और उत्पीड़न से सशक्त बनाता है।',
    copyright: 'सर्वाधिकार सुरक्षित।'
  },
  kn: {
    platform: 'ವೇದಿಕೆ',
    profileGuard: 'ಪ್ರೊಫೈಲ್ ಗಾರ್ಡ್',
    report: 'ವರದಿ ಸಲ್ಲಿಕೆ',
    evidence: 'ಸಾಕ್ಷ್ಯ ಟೈಮ್‌ಸ್ಟ್ಯಾಂಪಿಂಗ್',
    quiz: 'ಸ್ವಯಂ-ರಕ್ಷಣಾ ಪ್ರಶ್ನೋತ್ತರ',
    resources: 'ಸಂಪನ್ಮೂಲಗಳು',
    verify: 'ಕೇಸ್ ಐಡಿ ಪರಿಶೀಲಿಸಿ',
    documentation: 'ಡಾಕ್ಯುಮೆಂಟೇಶನ್',
    support: 'ಬೆಂಬಲ',
    blog: 'ಬ್ಲಾಗ್',
    help: 'ಸಹಾಯ',
    safetyResources: 'ಭದ್ರತಾ ಸಂಪನ್ಮೂಲಗಳು',
    reportAbuse: 'ದುರುಪಯೋಗವನ್ನು ವರದಿ ಮಾಡಿ',
    privacy: 'ಗೌಪ್ಯತಾ ನೀತಿ',
    terms: 'ಸೇವಾ ನಿಯಮಗಳು',
    madeWith: 'ಇದರಿಂದ ಮಾಡಲಾಗಿದೆ',
    forSafer: 'ಭದ್ರವಾದ ಡಿಜಿಟಲ್ ಜಗತ್ತಿಗಾಗಿ',
    description: 'ಮಹಿಳೆಯರನ್ನು ಆನ್‌ಲೈನ್ ಅಪಾಯಗಳು ಮತ್ತು ಕಿರುಕುಳಗಳಿಂದ ಶಕ್ತಿಶಾಲಿಯಾಗಿಸುವ ಡಿಜಿಟಲ್ ಭದ್ರತಾ ವೇದಿಕೆ.',
    copyright: 'ಎಲ್ಲ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.'
  },
};

const Footer = () => {
  const { language, darkMode } = useContext(VeritasUIContext);
  return (
    <footer className={darkMode ? "bg-gray-900 py-6 mt-12 border-t border-gray-700" : "bg-white border-t border-gray-200 pt-10 pb-6"}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-6 w-6 text-veritas-purple" />
              <span className="text-xl font-bold text-veritas-purple">VERITAS</span>
            </div>
            <p className="text-gray-600 mb-4">
              {translations[language].description}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-veritas-purple hover:text-veritas-darkPurple transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-veritas-purple">{translations[language].platform}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/profile-guard" className="text-gray-600 hover:text-veritas-purple transition-colors">
                  {translations[language].profileGuard}
                </Link>
              </li>
              <li>
                <Link to="/report" className="text-gray-600 hover:text-veritas-purple transition-colors">
                  {translations[language].report}
                </Link>
              </li>
              <li>
                <Link to="/evidence" className="text-gray-600 hover:text-veritas-purple transition-colors">
                  {translations[language].evidence}
                </Link>
              </li>
              <li>
                <Link to="/quiz" className="text-gray-600 hover:text-veritas-purple transition-colors">
                  {translations[language].quiz}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-veritas-purple">{translations[language].resources}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/verify" className="text-gray-600 hover:text-veritas-purple transition-colors">
                  {translations[language].verify}
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-veritas-purple transition-colors">
                  {translations[language].documentation}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-veritas-purple transition-colors">
                  {translations[language].support}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-veritas-purple transition-colors">
                  {translations[language].blog}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-veritas-purple">{translations[language].help}</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-veritas-purple transition-colors">
                  {translations[language].safetyResources}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-veritas-purple transition-colors">
                  {translations[language].reportAbuse}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-veritas-purple transition-colors">
                  {translations[language].privacy}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-veritas-purple transition-colors">
                  {translations[language].terms}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className={darkMode ? "text-gray-400 text-sm mb-4 md:mb-0" : "text-gray-500 text-sm mb-4 md:mb-0"}>
            &copy; {new Date().getFullYear()} VERITAS. {translations[language].copyright}
          </p>
          <div className="flex items-center text-gray-500 text-sm">
            <span>{translations[language].madeWith}</span>
            <Heart className="h-4 w-4 mx-1 text-veritas-purple" />
            <span>{translations[language].forSafer}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
