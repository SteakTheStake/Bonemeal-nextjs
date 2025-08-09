import { createContext, useContext, useState, ReactNode } from 'react';

interface ConversionSettings {
  // Basic settings
  generateBaseColor: boolean;
  generateRoughness: boolean;
  generateNormal: boolean;
  generateHeight: boolean;
  generateAO: boolean;
  baseColorContrast: number;
  roughnessIntensity: number;
  roughnessInvert: boolean;
  normalStrength: number;
  heightDepth: number;
  aoRadius: number;
  inputType: 'single' | 'sequence' | 'resourcepack';
  
  // Advanced processing
  advancedProcessing: {
    enableBulkResize: boolean;
    baseColorResolution: number;
    specularResolution: number;
    normalResolution: number;
    baseColorInterpolation: 'nearest' | 'linear' | 'cubic' | 'lanczos';
    specularInterpolation: 'nearest' | 'linear' | 'cubic' | 'lanczos';
    normalInterpolation: 'nearest' | 'linear' | 'cubic' | 'lanczos';
    enableCompression: boolean;
    compressionQuality: number;
    enableDithering: boolean;
    enableCTMSplit: boolean;
    ctmVariations: number;
  };
}

interface SettingsContextType {
  settings: ConversionSettings;
  updateSettings: (updates: Partial<ConversionSettings>) => void;
  updateAdvancedSettings: (updates: Partial<ConversionSettings['advancedProcessing']>) => void;
  currentFile: File | null;
  setCurrentFile: (file: File | null) => void;
  triggerUpload: () => void;
  uploadCallback: (() => void) | null;
  setUploadCallback: (callback: (() => void) | null) => void;
}

const defaultSettings: ConversionSettings = {
  generateBaseColor: true,
  generateRoughness: true,
  generateNormal: true,
  generateHeight: true,
  generateAO: true,
  baseColorContrast: 1.2,
  roughnessIntensity: 0.8,
  roughnessInvert: false,
  normalStrength: 1.0,
  heightDepth: 0.25,
  aoRadius: 0.5,
  inputType: 'single',
  advancedProcessing: {
    enableBulkResize: false,
    baseColorResolution: 256,
    specularResolution: 256,
    normalResolution: 256,
    baseColorInterpolation: 'cubic',
    specularInterpolation: 'linear',
    normalInterpolation: 'lanczos',
    enableCompression: false,
    compressionQuality: 85,
    enableDithering: false,
    enableCTMSplit: false,
    ctmVariations: 47,
  },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ConversionSettings>(defaultSettings);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [uploadCallback, setUploadCallback] = useState<(() => void) | null>(null);

  const updateSettings = (updates: Partial<ConversionSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const updateAdvancedSettings = (updates: Partial<ConversionSettings['advancedProcessing']>) => {
    setSettings(prev => ({
      ...prev,
      advancedProcessing: {
        ...prev.advancedProcessing,
        ...updates,
      },
    }));
  };

  const triggerUpload = () => {
    if (uploadCallback) {
      uploadCallback();
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateAdvancedSettings,
        currentFile,
        setCurrentFile,
        triggerUpload,
        uploadCallback,
        setUploadCallback,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}