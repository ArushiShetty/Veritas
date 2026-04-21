import React, { useState, useContext } from 'react';
import { VeritasUIContext } from '../App';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { helplineData } from '../lib/helplines';
import { useToast } from '../components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Mail, Phone, AlertTriangle } from 'lucide-react';

// Default red flag patterns (example)
const redFlagPatterns = [
  { pattern: /urgent|emergency|help/i, category: 'Urgency', explanation: 'Message contains urgent or emergency language.' },
  { pattern: /password|otp|account/i, category: 'Sensitive Info', explanation: 'Message requests sensitive information.' },
  { pattern: /click here|link|http/i, category: 'Suspicious Link', explanation: 'Message contains a suspicious link.' },
];

// Example national helplines in multiple languages
const EMERGENCY_HELPLINES: Record<string, string[]> = {
  en: [
    'National Women Helpline: 181',
    'Police: 100',
    'Child Helpline: 1098',
    'Cyber Crime: 155260',
  ],
  hi: [
    'राष्ट्रीय महिला हेल्पलाइन: 181',
    'पुलिस: 100',
    'चाइल्ड हेल्पलाइन: 1098',
    'साइबर क्राइम: 155260',
  ],
  kn: [
    'ರಾಷ್ಟ್ರೀಯ ಮಹಿಳಾ ಸಹಾಯವಾಣಿ: 181',
    'ಪೊಲೀಸ್: 100',
    'ಮಕ್ಕಳ ಸಹಾಯವಾಣಿ: 1098',
    'ಸೈಬರ್ ಕ್ರೈಮ್: 155260',
  ],
};

const parseHelpline = (entry: string) => {
  const [name, rawNumber] = entry.split(':');
  const label = name?.trim() ?? entry;
  const number = rawNumber?.trim() ?? '';
  const telNumber = number.replace(/[^\d+]/g, '');
  return { label, number, telNumber };
};

interface RedFlag {
  phrase: string;
  category: string;
  explanation: string;
}


interface Helpline {
  name: string;
  number: string;
  type: string;
  email: string | null;
}

const SafetyAnalyzer = () => {
  const [chatText, setChatText] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [redFlags, setRedFlags] = useState<RedFlag[]>([]);
  const [threatLevel, setThreatLevel] = useState<'low' | 'moderate' | 'high' | null>(null);
  const { toast } = useToast();
  const { language } = useContext(VeritasUIContext);

  const analyzeChatText = () => {
    if (!chatText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some chat text to analyze",
        variant: "destructive",
      });
      return;
    }

    const foundFlags: RedFlag[] = [];
    // Check each pattern against the text
    redFlagPatterns.forEach(pattern => {
      const matches = chatText.match(pattern.pattern);
      if (matches) {
        foundFlags.push({
          phrase: matches[0],
          category: pattern.category,
          explanation: pattern.explanation
        });
      }
    });
    setRedFlags(foundFlags);
  };

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Chat Message Analyzer</CardTitle>
            <CardDescription>
              Analyze chat messages for red flags and potential threats.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <textarea
                className="w-full border rounded p-2"
                rows={4}
                value={chatText}
                onChange={e => setChatText(e.target.value)}
                placeholder={language === 'en' ? 'Paste chat message here...' : language === 'hi' ? 'यहाँ चैट संदेश पेस्ट करें...' : 'ಚಾಟ್ ಸಂದೇಶವನ್ನು ಇಲ್ಲಿ ಅಂಟಿಸಿ...'}
              />
              <Button onClick={analyzeChatText} className="w-full">
                {language === 'en' ? 'Analyze' : language === 'hi' ? 'विश्लेषण करें' : 'ವಿಶ್ಲೇಷಿಸಿ'}
              </Button>
              {redFlags.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phrase</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Explanation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {redFlags.map((flag, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">{flag.phrase}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{flag.category}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{flag.explanation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Helpline Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>
              {language === 'en' ? 'Emergency Helplines' : language === 'hi' ? 'आपातकालीन हेल्पलाइन' : 'ತುರ್ತು ಸಹಾಯವಾಣಿ'}
            </CardTitle>
            <CardDescription>
              {language === 'en'
                ? 'Find local helplines and support services'
                : language === 'hi'
                  ? 'स्थानीय हेल्पलाइन और सहायता सेवाएँ खोजें'
                  : 'ಸ್ಥಳೀಯ ಸಹಾಯವಾಣಿ ಮತ್ತು ಬೆಂಬಲ ಸೇವೆಗಳನ್ನು ಹುಡುಕಿ'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select
                value={selectedRegion}
                onValueChange={setSelectedRegion}
              >
                <SelectTrigger>
                  <SelectValue placeholder={language === 'en' ? 'Select your region' : language === 'hi' ? 'अपना क्षेत्र चुनें' : 'ನಿಮ್ಮ ಪ್ರದೇಶವನ್ನು ಆಯ್ಕೆಮಾಡಿ'} />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(helplineData).map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedRegion && (
                <div className="grid gap-4">
                  {helplineData[selectedRegion as keyof typeof helplineData].map((helpline, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{helpline.name}</h3>
                        <p className="text-sm text-gray-500">{helpline.type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {helpline.email && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={`mailto:${helpline.email}`}>
                              <Mail className="h-4 w-4 mr-1" />
                              {language === 'en' ? 'Email' : language === 'hi' ? 'ईमेल' : 'ಇಮೇಲ್'}
                            </a>
                          </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <a href={`tel:${helpline.number}`}>
                            <Phone className="h-4 w-4 mr-1" />
                            {helpline.number}
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 p-4 rounded-xl bg-purple-50 dark:bg-gray-800">
                <h3 className="font-bold mb-2">{language === 'en' ? 'National Helplines' : language === 'hi' ? 'राष्ट्रीय हेल्पलाइन' : 'ರಾಷ್ಟ್ರೀಯ ಸಹಾಯವಾಣಿ'}</h3>
                <ul className="text-sm">
                  {EMERGENCY_HELPLINES[language]?.map((hl, i) => (
                    <li key={i} className="mb-1 flex items-center gap-2">
                      {(() => {
                        const { label, number, telNumber } = parseHelpline(hl);
                        return (
                          <>
                            <span>{label}:</span>
                            <a href={`tel:${telNumber}`} className="inline-flex items-center gap-1 underline">
                              <Phone className="h-3.5 w-3.5" />
                              {number}
                            </a>
                          </>
                        );
                      })()}
                    </li>
                  ))}
                </ul>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>
                  {language === 'en' ? 'Emergency Situations' : language === 'hi' ? 'आपातकालीन स्थिति' : 'ತುರ್ತು ಪರಿಸ್ಥಿತಿಗಳು'}
                </AlertTitle>
                <AlertDescription>
                  {language === 'en'
                    ? "If you're in immediate danger, always call your local emergency services first."
                    : language === 'hi'
                      ? 'यदि आप तत्काल खतरे में हैं, तो हमेशा पहले अपनी स्थानीय आपातकालीन सेवाओं को कॉल करें।'
                      : 'ನೀವು ತಕ್ಷಣದ ಅಪಾಯದಲ್ಲಿದ್ದರೆ, ಯಾವಾಗಲೂ ನಿಮ್ಮ ಸ್ಥಳೀಯ ತುರ್ತು ಸೇವೆಗಳಿಗೆ ಕರೆಮಾಡಿ.'}
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </main>
  );
}

export default SafetyAnalyzer;

