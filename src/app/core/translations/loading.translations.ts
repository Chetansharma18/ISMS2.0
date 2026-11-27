export type LoadingMessageKey =
  | 'loadingApplication'
  | 'loadingPage'
  | 'loadingRecords'
  | 'verifyingSession'
  | 'signingIn'
  | 'signingOut'
  | 'savingDetails'
  | 'submittingApplication'
  | 'processingUploadedFile'
  | 'preparingExcelFile'
  | 'generatingDocument'
  | 'verifyingOtp'
  | 'processingDigitalSignature';

export type LoadingTranslations = Record<LoadingMessageKey, string>;

export const LOADING_TRANSLATIONS: Record<'en' | 'hi', LoadingTranslations> = {
  en: {
    loadingApplication: 'Loading application...',
    loadingPage: 'Loading page...',
    loadingRecords: 'Loading records...',
    verifyingSession: 'Verifying session...',
    signingIn: 'Signing in...',
    signingOut: 'Signing out...',
    savingDetails: 'Saving details...',
    submittingApplication: 'Submitting application...',
    processingUploadedFile: 'Processing uploaded file...',
    preparingExcelFile: 'Preparing Excel file...',
    generatingDocument: 'Generating document...',
    verifyingOtp: 'Verifying OTP...',
    processingDigitalSignature: 'Processing digital signature...'
  },
  hi: {
    loadingApplication: 'एप्लिकेशन लोड हो रहा है...',
    loadingPage: 'पृष्ठ लोड हो रहा है...',
    loadingRecords: 'रिकॉर्ड लोड हो रहे हैं...',
    verifyingSession: 'सत्र सत्यापित किया जा रहा है...',
    signingIn: 'साइन इन किया जा रहा है...',
    signingOut: 'साइन आउट किया जा रहा है...',
    savingDetails: 'विवरण सहेजा जा रहा है...',
    submittingApplication: 'आवेदन सबमिट किया जा रहा है...',
    processingUploadedFile: 'अपलोड की गई फ़ाइल प्रोसेस हो रही है...',
    preparingExcelFile: 'एक्सेल फ़ाइल तैयार की जा रही है...',
    generatingDocument: 'दस्तावेज़ तैयार किया जा रहा है...',
    verifyingOtp: 'ओटीपी सत्यापित किया जा रहा है...',
    processingDigitalSignature: 'डिजिटल हस्ताक्षर प्रोसेस हो रहा है...'
  }
};
