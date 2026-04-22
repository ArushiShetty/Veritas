import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VeritasUIContext } from '../App';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const translations = {
  en: {
    title: 'My Profile',
    subtitle: 'Manage your personal details for a safer experience.',
    name: 'Name',
    age: 'Age',
    emergencyContact: 'Emergency Contact',
    location: 'Location',
    save: 'Save',
    updateSuccess: 'Profile updated successfully!',
    updateError: 'Failed to update profile.',
    loading: 'Loading profile...'
  },
  hi: {
    title: 'मेरी प्रोफ़ाइल',
    subtitle: 'सुरक्षित अनुभव के लिए अपनी व्यक्तिगत जानकारी प्रबंधित करें।',
    name: 'नाम',
    age: 'आयु',
    emergencyContact: 'आपातकालीन संपर्क',
    location: 'स्थान',
    save: 'सहेजें',
    updateSuccess: 'प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!',
    updateError: 'प्रोफ़ाइल अपडेट करने में विफल।',
    loading: 'प्रोफ़ाइल लोड हो रही है...'
  },
  kn: {
    title: 'ನನ್ನ ಪ್ರೊಫೈಲ್',
    subtitle: 'ಭದ್ರವಾದ ಅನುಭವಕ್ಕಾಗಿ ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ವಿವರಗಳನ್ನು ನಿರ್ವಹಿಸಿ.',
    name: 'ಹೆಸರು',
    age: 'ವಯಸ್ಸು',
    emergencyContact: 'ತುರ್ತು ಸಂಪರ್ಕ',
    location: 'ಸ್ಥಳ',
    save: 'ಉಳಿಸಿ',
    updateSuccess: 'ಪ್ರೊಫೈಲ್ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ!',
    updateError: 'ಪ್ರೊಫೈಲ್ ನವೀಕರಿಸಲು ವಿಫಲವಾಗಿದೆ.',
    loading: 'ಪ್ರೊಫೈಲ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ...'
  }
};

const Profile = () => {
  const { language } = useContext(VeritasUIContext);
  const { toast } = useToast();
  const [profile, setProfile] = useState({ name: '', age: '', emergencyContact: '', location: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userData.user.id)
        .single();
      if (data) setProfile({
        name: data.name || '',
        age: data.age || '',
        emergencyContact: data.emergency_contact || '',
        location: data.location || ''
      });
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const updates = {
      user_id: userData.user.id,
      name: profile.name,
      age: profile.age,
      emergency_contact: profile.emergencyContact,
      location: profile.location
    };
    const { error } = await supabase
      .from('profiles')
      .upsert(updates, { onConflict: ['user_id'] });
    if (error) {
      toast({
        title: translations[language].updateError,
        description: error.message || error.details,
        variant: 'destructive',
      });
    } else {
      toast({ title: translations[language].updateSuccess });
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow bg-gray-50 flex justify-center items-center py-12">
        <div className="max-w-md w-full p-6 bg-white rounded-xl shadow-md">
          <h1 className="text-2xl font-bold text-center text-veritas-purple mb-2">{translations[language].title}</h1>
          <p className="text-center text-gray-600 mb-6">{translations[language].subtitle}</p>
          {loading ? (
            <div className="text-center text-gray-500">{translations[language].loading}</div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{translations[language].name}</label>
                <input type="text" name="name" value={profile.name} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{translations[language].age}</label>
                <input type="number" name="age" value={profile.age} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{translations[language].emergencyContact}</label>
                <input type="text" name="emergencyContact" value={profile.emergencyContact} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{translations[language].location}</label>
                <input type="text" name="location" value={profile.location} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <Button type="submit" className="w-full bg-veritas-purple hover:bg-veritas-darkPurple" disabled={saving}>
                {translations[language].save}
              </Button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
