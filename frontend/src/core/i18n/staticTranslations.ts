/**
 * Static Translation Dictionary
 * Common UI phrases to avoid API calls
 * Size: ~5KB (not storage intensive)
 */

export const staticTranslations: Record<string, Record<'en' | 'hi', string>> = {
    // Common Actions
    'Save': { en: 'Save', hi: 'सहेजें' },
    'Edit': { en: 'Edit', hi: 'संपादित करें' },
    'Cancel': { en: 'Cancel', hi: 'रद्द करें' },
    'Delete': { en: 'Delete', hi: 'हटाएं' },
    'Continue': { en: 'Continue', hi: 'जारी रखें' },
    'Back': { en: 'Back', hi: 'वापस' },
    'Next': { en: 'Next', hi: 'अगला' },
    'Submit': { en: 'Submit', hi: 'जमा करें' },
    'Close': { en: 'Close', hi: 'बंद करें' },
    'Confirm': { en: 'Confirm', hi: 'पुष्टि करें' },

    // Auth & Onboarding
    'Login': { en: 'Login', hi: 'लॉग इन करें' },
    'Signup': { en: 'Signup', hi: 'साइन अप करें' },
    'Create Account': { en: 'Create Account', hi: 'खाता बनाएं' },
    'Full Name': { en: 'Full Name', hi: 'पूरा नाम' },
    'Phone': { en: 'Phone', hi: 'फोन' },
    'Contact Number': { en: 'Contact Number', hi: 'संपर्क नंबर' },
    'Date of Birth': { en: 'Date of Birth', hi: 'जन्म तिथि' },
    'Gender': { en: 'Gender', hi: 'लिंग' },
    'Male': { en: 'Male', hi: 'पुरुष' },
    'Female': { en: 'Female', hi: 'महिला' },
    'Password': { en: 'Password', hi: 'पासवर्ड' },

    // Profile
    'Profile': { en: 'Profile', hi: 'प्रोफ़ाइल' },
    'My Profile': { en: 'My Profile', hi: 'मेरा प्रोफ़ाइल' },
    'Edit Profile': { en: 'Edit Profile', hi: 'प्रोफ़ाइल संपादित करें' },
    'Name': { en: 'Name', hi: 'नाम' },
    'Age': { en: 'Age', hi: 'उम्र' },
    'Location': { en: 'Location', hi: 'स्थान' },
    'City': { en: 'City', hi: 'शहर' },
    'Bio': { en: 'Bio', hi: 'बायो' },
    'Occupation': { en: 'Occupation', hi: 'व्यवसाय' },
    'Interests': { en: 'Interests', hi: 'रुचियाँ' },
    'Photos': { en: 'Photos', hi: 'फ़ोटो' },
    'Add Photo': { en: 'Add Photo', hi: 'फ़ोटो जोड़ें' },

    // Navigation
    'Home': { en: 'Home', hi: 'होम' },
    'Dashboard': { en: 'Dashboard', hi: 'डैशबोर्ड' },
    'Discover': { en: 'Discover', hi: 'खोजें' },
    'Chats': { en: 'Chats', hi: 'चैट' },
    'Messages': { en: 'Messages', hi: 'संदेश' },
    'Settings': { en: 'Settings', hi: 'सेटिंग्स' },
    'Notifications': { en: 'Notifications', hi: 'सूचनाएं' },
    'Logout': { en: 'Logout', hi: 'लॉगआउट' },
    'Delete Account': { en: 'Delete Account', hi: 'खाता हटाएं' },
    'Delete Account?': { en: 'Delete Account?', hi: 'खाता हटाएं?' },
    'deleteAccountConfirm': { en: 'Are you sure you want to delete your account? This action cannot be undone.', hi: 'क्या आप वाकई अपना खाता हटाना चाहते हैं? यह क्रिया वापस नहीं ली जा सकती।' },

    // Chat
    'Send': { en: 'Send', hi: 'भेजें' },
    'Type a message': { en: 'Type a message', hi: 'संदेश लिखें' },
    'Online': { en: 'Online', hi: 'ऑनलाइन' },
    'Offline': { en: 'Offline', hi: 'ऑफ़लाइन' },
    'Active now': { en: 'Active now', hi: 'अभी सक्रिय' },

    // Discover
    'Nearby': { en: 'Nearby', hi: 'पास में' },
    'km away': { en: 'km away', hi: 'किमी दूर' },
    'years old': { en: 'years old', hi: 'वर्ष की आयु' },

    // Location
    'Set Your Location': { en: 'Set Your Location', hi: 'अपना स्थान सेट करें' },
    'Use My Location': { en: 'Use My Location', hi: 'मेरा स्थान उपयोग करें' },
    'Save Location': { en: 'Save Location', hi: 'स्थान सहेजें' },

    // Earnings (Female)
    'Earnings': { en: 'Earnings', hi: 'कमाई' },
    'Balance': { en: 'Balance', hi: 'शेष राशि' },
    'Withdraw': { en: 'Withdraw', hi: 'निकालें' },
    'Total Earnings': { en: 'Total Earnings', hi: 'कुल कमाई' },
    'Available Balance': { en: 'Available Balance', hi: 'उपलब्ध शेष' },

    // Common Messages
    'Welcome': { en: 'Welcome', hi: 'स्वागत है' },
    'Loading': { en: 'Loading', hi: 'लोड हो रहा है' },
    'Saving': { en: 'Saving', hi: 'सहेजा जा रहा है' },
    'Error': { en: 'Error', hi: 'त्रुटि' },
    'Success': { en: 'Success', hi: 'सफलता' },
    'Please wait': { en: 'Please wait', hi: 'कृपया प्रतीक्षा करें' },

    // Form Validation
    'Required': { en: 'Required', hi: 'आवश्यक' },
    'Invalid': { en: 'Invalid', hi: 'अमान्य' },
    'This field is required': { en: 'This field is required', hi: 'यह फ़ील्ड आवश्यक है' },

    // Language
    'Language': { en: 'Language', hi: 'भाषा' },
    'Select Language': { en: 'Select Language', hi: 'भाषा चुनें' },
    'English': { en: 'English', hi: 'अंग्रेज़ी' },
    'Hindi': { en: 'Hindi', hi: 'हिंदी' },

    // Video Call
    'Video Call': { en: 'Video Call', hi: 'वीडियो कॉल' },
    'Start Call': { en: 'Start Call', hi: 'कॉल शुरू करें' },
    'End Call': { en: 'End Call', hi: 'कॉल समाप्त करें' },
    'Accept': { en: 'Accept', hi: 'स्वीकार करें' },
    'Reject': { en: 'Reject', hi: 'अस्वीकार करें' },
    'logoutSuccess': { en: 'Logged Out', hi: 'लॉगआउट हो गया' },
    'logoutSuccessMessage': { en: 'You have been successfully logged out.', hi: 'आप सफलतापूर्वक लॉगआउट हो गए हैं।' },
};

/**
 * Get static translation if available
 */
export function getStaticTranslation(text: string, targetLang: 'en' | 'hi'): string | null {
    const entry = staticTranslations[text];
    return entry ? entry[targetLang] : null;
}
