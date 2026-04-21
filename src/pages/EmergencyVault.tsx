

import React, { useState, useEffect, useContext } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { File, Upload, Trash2, Lock, Shield, Loader2, FileText } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { VeritasUIContext } from '../App';

const translations = {
  en: {
    title: 'Emergency Vault',
    subtitle: 'Securely store sensitive documents with end-to-end encryption. Your files are protected and only accessible by you.',
    yourFiles: 'Your Secure Files',
    uploaded: 'Uploaded',
    actions: 'Actions',
    download: 'Download',
    delete: 'Delete',
    noFiles: 'No files yet',
    uploadFirst: 'Upload your first secure file to get started',
    uploadNew: 'Upload New File',
    clickToUpload: 'Click to upload',
    encrypting: 'Encrypting & Uploading...',
    secureUpload: 'Secure Upload',
    vaultSecurity: 'Vault Security',
    e2e: 'End-to-end encryption',
    onlyYou: 'Files accessible only by you',
    tamper: 'Tamper-proof storage',
    legal: 'Legal-grade evidence preservation',
    success: 'Success',
    uploadSuccess: 'File securely uploaded to your vault.',
    uploadFailed: 'Upload failed',
    uploadError: 'There was an error uploading your file. Please try again.',
    deleteSuccess: 'File deleted from your vault.',
    deleteFailed: 'Delete failed',
    deleteError: 'There was an error deleting your file. Please try again.',
    downloadFailed: 'Download failed',
    downloadError: 'There was an error downloading your file. Please try again.',
    authRequired: 'Authentication required',
    signInToAccess: 'Please sign in to access your vault files.',
    loadingFailed: 'Failed to load your vault files.'
  },
  hi: {
    title: 'आपातकालीन वॉल्ट',
    subtitle: 'संवेदनशील दस्तावेज़ों को एंड-टू-एंड एन्क्रिप्शन के साथ सुरक्षित रूप से स्टोर करें। आपकी फाइलें सुरक्षित हैं और केवल आप ही एक्सेस कर सकते हैं।',
    yourFiles: 'आपकी सुरक्षित फाइलें',
    uploaded: 'अपलोड किया गया',
    actions: 'क्रियाएँ',
    download: 'डाउनलोड',
    delete: 'हटाएं',
    noFiles: 'कोई फाइल नहीं',
    uploadFirst: 'शुरू करने के लिए अपनी पहली सुरक्षित फाइल अपलोड करें',
    uploadNew: 'नई फाइल अपलोड करें',
    clickToUpload: 'अपलोड करने के लिए क्लिक करें',
    encrypting: 'एन्क्रिप्ट किया जा रहा है और अपलोड हो रहा है...',
    secureUpload: 'सुरक्षित अपलोड',
    vaultSecurity: 'वॉल्ट सुरक्षा',
    e2e: 'एंड-टू-एंड एन्क्रिप्शन',
    onlyYou: 'फाइलें केवल आपके द्वारा एक्सेस की जा सकती हैं',
    tamper: 'छेड़छाड़-प्रूफ स्टोरेज',
    legal: 'कानूनी-ग्रेड साक्ष्य संरक्षण',
    success: 'सफलता',
    uploadSuccess: 'फाइल सफलतापूर्वक वॉल्ट में अपलोड हो गई।',
    uploadFailed: 'अपलोड विफल',
    uploadError: 'आपकी फाइल अपलोड करने में त्रुटि हुई। कृपया पुनः प्रयास करें।',
    deleteSuccess: 'फाइल वॉल्ट से हटा दी गई।',
    deleteFailed: 'हटाना विफल',
    deleteError: 'आपकी फाइल हटाने में त्रुटि हुई। कृपया पुनः प्रयास करें।',
    downloadFailed: 'डाउनलोड विफल',
    downloadError: 'आपकी फाइल डाउनलोड करने में त्रुटि हुई। कृपया पुनः प्रयास करें।',
    authRequired: 'प्रमाणीकरण आवश्यक',
    signInToAccess: 'कृपया अपनी वॉल्ट फाइलों तक पहुँचने के लिए साइन इन करें।',
    loadingFailed: 'आपकी वॉल्ट फाइलें लोड करने में विफल।'
  },
  kn: {
    title: 'ತುರ್ತು ವಾಲ್ಟ್',
    subtitle: 'ಸೂಕ್ಷ್ಮ ದಾಖಲೆಗಳನ್ನು ಎಂಡ್-ಟು-ಎಂಡ್ ಎನ್ಕ್ರಿಪ್ಷನ್‌ನೊಂದಿಗೆ ಸುರಕ್ಷಿತವಾಗಿ ಸಂಗ್ರಹಿಸಿ. ನಿಮ್ಮ ಫೈಲ್‌ಗಳು ಸುರಕ್ಷಿತವಾಗಿವೆ ಮತ್ತು ನೀವು ಮಾತ್ರ ಪ್ರವೇಶಿಸಬಹುದು.',
    yourFiles: 'ನಿಮ್ಮ ಸುರಕ್ಷಿತ ಫೈಲ್‌ಗಳು',
    uploaded: 'ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾಗಿದೆ',
    actions: 'ಕ್ರಿಯೆಗಳು',
    download: 'ಡೌನ್‌ಲೋಡ್',
    delete: 'ಅಳಿಸಿ',
    noFiles: 'ಯಾವುದೇ ಫೈಲ್‌ಗಳು ಇಲ್ಲ',
    uploadFirst: 'ಪ್ರಾರಂಭಿಸಲು ನಿಮ್ಮ ಮೊದಲ ಸುರಕ್ಷಿತ ಫೈಲ್ ಅನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    uploadNew: 'ಹೊಸ ಫೈಲ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    clickToUpload: 'ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ',
    encrypting: 'ಎನ್ಕ್ರಿಪ್ಟ್ ಮಾಡಲಾಗುತ್ತಿದೆ ಮತ್ತು ಅಪ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    secureUpload: 'ಸುರಕ್ಷಿತ ಅಪ್‌ಲೋಡ್',
    vaultSecurity: 'ವಾಲ್ಟ್ ಭದ್ರತೆ',
    e2e: 'ಎಂಡ್-ಟು-ಎಂಡ್ ಎನ್ಕ್ರಿಪ್ಷನ್',
    onlyYou: 'ಫೈಲ್‌ಗಳನ್ನು ನೀವು ಮಾತ್ರ ಪ್ರವೇಶಿಸಬಹುದು',
    tamper: 'ತಿದ್ದುಪಡಿ-ಪ್ರೂಫ್ ಸಂಗ್ರಹಣೆ',
    legal: 'ಕಾನೂನು-ಮಟ್ಟದ ಸಾಕ್ಷ್ಯ ಸಂರಕ್ಷಣೆ',
    success: 'ಯಶಸ್ಸು',
    uploadSuccess: 'ಫೈಲ್ ಯಶಸ್ವಿಯಾಗಿ ವಾಲ್ಟ್‌ಗೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾಗಿದೆ.',
    uploadFailed: 'ಅಪ್‌ಲೋಡ್ ವಿಫಲವಾಗಿದೆ',
    uploadError: 'ನಿಮ್ಮ ಫೈಲ್ ಅಪ್‌ಲೋಡ್ ಮಾಡುವಲ್ಲಿ ದೋಷವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    deleteSuccess: 'ಫೈಲ್ ವಾಲ್ಟ್‌ನಿಂದ ಅಳಿಸಲಾಗಿದೆ.',
    deleteFailed: 'ಅಳಿಸುವಿಕೆ ವಿಫಲವಾಗಿದೆ',
    deleteError: 'ನಿಮ್ಮ ಫೈಲ್ ಅಳಿಸುವಲ್ಲಿ ದೋಷವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    downloadFailed: 'ಡೌನ್‌ಲೋಡ್ ವಿಫಲವಾಗಿದೆ',
    downloadError: 'ನಿಮ್ಮ ಫೈಲ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡುವಲ್ಲಿ ದೋಷವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    authRequired: 'ದೃಢೀಕರಣ ಅಗತ್ಯವಿದೆ',
    signInToAccess: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ವಾಲ್ಟ್ ಫೈಲ್‌ಗಳನ್ನು ಪ್ರವೇಶಿಸಲು ಸೈನ್ ಇನ್ ಮಾಡಿ.',
    loadingFailed: 'ನಿಮ್ಮ ವಾಲ್ಟ್ ಫೈಲ್‌ಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ.'
  },
};

interface VaultFile {
  id: string;
  file_name: string;
  created_at: string;
  file_type: string | null;
  is_encrypted: boolean;
  file_path: string;
}

const EmergencyVault = () => {

  const { language } = useContext(VeritasUIContext);
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchVaultFiles();
  }, []);

  const fetchVaultFiles = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        toast({
          title: translations[language].authRequired,
          description: translations[language].signInToAccess,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('vault_files')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching vault files:', error);
      toast({
        title: translations[language].uploadFailed,
        description: translations[language].loadingFailed,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        throw new Error('Authentication required');
      }
      
      const userId = userData.user.id;
      const filePath = `${userId}/${Date.now()}-${selectedFile.name}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('vault-files')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
        });
        
      if (uploadError) throw uploadError;
      
      // Get file URL
      const { data: { publicUrl } } = supabase.storage
        .from('vault-files')
        .getPublicUrl(filePath);
      
      // Save file reference in database
      const { error: dbError } = await supabase
        .from('vault_files')
        .insert({
          user_id: userId,
          file_name: selectedFile.name,
          file_path: filePath,
          file_type: selectedFile.type,
          is_encrypted: true,
        });
        
      if (dbError) throw dbError;
      
      toast({
        title: translations[language].success,
        description: translations[language].uploadSuccess,
      });
      
      setSelectedFile(null);
      fetchVaultFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: translations[language].uploadFailed,
        description: translations[language].uploadError,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (fileId: string, filePath: string) => {
    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('vault_files')
        .delete()
        .eq('id', fileId);
        
      if (dbError) throw dbError;
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('vault-files')
        .remove([filePath]);
        
      if (storageError) throw storageError;
      
      // Update state
      setFiles(files.filter(file => file.id !== fileId));
      
      toast({
        title: translations[language].success,
        description: translations[language].deleteSuccess,
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: translations[language].deleteFailed,
        description: translations[language].deleteError,
        variant: "destructive",
      });
    }
  };

  const downloadFile = async (file: VaultFile) => {
    try {
      const { data, error } = await supabase.storage
        .from('vault-files')
        .download(file.file_path);
        
      if (error) throw error;
      
      // Create download link and trigger download
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: translations[language].downloadFailed,
        description: translations[language].downloadError,
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <File className="h-6 w-6 text-gray-400" />;
    
    if (fileType.includes('image')) {
      return <img src="/placeholder.svg" alt="File" className="h-6 w-6 object-cover" />;
    } else if (fileType.includes('pdf')) {
      return <FileText className="h-6 w-6 text-red-500" />;
    } else {
      return <File className="h-6 w-6 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow bg-gray-50">
        <div className="veritas-container py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-veritas-purple">{translations[language].title}</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {translations[language].subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">{translations[language].yourFiles}</h2>
                
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-veritas-purple" />
                  </div>
                ) : files.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-gray-500 border-b">
                          <th className="pb-2">File</th>
                          <th className="pb-2">{translations[language].uploaded}</th>
                          <th className="pb-2 text-right">{translations[language].actions}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {files.map((file) => (
                          <tr key={file.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3">
                              <div className="flex items-center">
                                <div className="mr-3">
                                  {getFileIcon(file.file_type)}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-800">{file.file_name}</div>
                                  <div className="text-xs text-gray-500">
                                    {file.file_type?.split('/')[1]?.toUpperCase() || 'Unknown'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3">
                              <span className="text-sm text-gray-600">
                                {new Date(file.created_at).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => downloadFile(file)}
                                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                >
                                  {translations[language].download}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(file.id, file.file_path)}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" /> {translations[language].delete}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                    <Lock className="mx-auto h-10 w-10 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">{translations[language].noFiles}</h3>
                    <p className="mt-1 text-sm text-gray-500">{translations[language].uploadFirst}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">{translations[language].uploadNew}</h2>
                
                <div className="mb-4">
                  <label 
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed 
                    border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center p-3 text-center">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 font-medium">
                        {selectedFile ? selectedFile.name : translations[language].clickToUpload}
                      </p>
                      {selectedFile && (
                        <p className="text-xs text-gray-400">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      )}
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="w-full bg-veritas-purple hover:bg-veritas-darkPurple"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {translations[language].encrypting}
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      {translations[language].secureUpload}
                    </>
                  )}
                </Button>
              </div>
              
              <div className="bg-veritas-lightPurple rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <Shield className="h-6 w-6 text-veritas-purple mr-2" />
                  <h3 className="text-lg font-semibold text-veritas-purple">{translations[language].vaultSecurity}</h3>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <div className="bg-veritas-purple rounded-full p-1 mr-2 mt-0.5">
                      <Lock className="h-3 w-3 text-white" />
                    </div>
                    <span>{translations[language].e2e}</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-veritas-purple rounded-full p-1 mr-2 mt-0.5">
                      <Lock className="h-3 w-3 text-white" />
                    </div>
                    <span>{translations[language].onlyYou}</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-veritas-purple rounded-full p-1 mr-2 mt-0.5">
                      <Lock className="h-3 w-3 text-white" />
                    </div>
                    <span>{translations[language].tamper}</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-veritas-purple rounded-full p-1 mr-2 mt-0.5">
                      <Lock className="h-3 w-3 text-white" />
                    </div>
                    <span>{translations[language].legal}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default EmergencyVault;
