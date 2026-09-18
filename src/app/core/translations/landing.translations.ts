export interface LandingTranslations {
  navbar: {
    govtRajasthan: string;
    rsldcLine1: string;
    rsldcLine2: string;
    ismsSubtitle: string;
    fontDecreaseAria: string;
    fontStandardAria: string;
    fontIncreaseAria: string;
    loginText: string;
    loginTitle: string;
    home: string;
    about: string;
    services: string;
    objectives: string;
    help: string;
    contact: string;
    searchPlaceholder: string;
    searchAria: string;
  };
  hero: {
    eyebrowSkills: string;
    eyebrowToday: string;
    eyebrowOpportunities: string;
    headingPart1: string;
    headingPart2: string;
    description: string;
    getStarted: string;
    knowMore: string;
  };
  tenderBox: {
    title: string;
    viewAll: string;
    modalTitle: string;
    modalSubtitle: string;
    close: string;
    downloadPdf: string;
    activeStatus: string;
    hoverToPause: string;
    refNo: string;
    categoryLabel: string;
    dateLabel: string;
    allTendersCount: string;
    searchPlaceholder?: string;
    noTendersFound?: string;
  };
  newsTicker: {
    badge: string;
    viewAll: string;
    modalTitle: string;
    modalSubtitle: string;
    modalSource: string;
    close: string;
    readDetails?: string;
    officialPortal?: string;
    viewAllPortal?: string;
    searchPlaceholder?: string;
    noNewsFound?: string;
  };
  about: {
    heading: string;
    p1: string;
    p2: string;
    knowMore: string;
    quote: string;
    stat1Label: string;
    stat2Label: string;
    stat3Label: string;
    baseline: string;
  };
  mobileApp: {
    tag: string;
    heading: string;
    description: string;
    knowMore: string;
    badge1: string;
    badge2: string;
    badge3: string;
    badge4: string;
    helpTag: string;
    helpHeading: string;
    helpDescription: string;
    visitHelpdesk: string;
    viewFaqs: string;
    helpdeskTitle: string;
    helpdeskDesc: string;
  };
  importantLinks: {
    heading: string;
    prevAria: string;
    nextAria: string;
    acbCallBanner: string;
    acbTollFreeLabel: string;
    acbTitle: string;
    saveLivesToday: string;
    oneDonor8Lives: string;
    registerPledge: string;
    janSoochnaTitle: string;
    janSoochnaGovt: string;
    bisTitle: string;
    bisSubtitle: string;
    skillIndiaTitle: string;
    skillIndiaTagline: string;
    skillIndiaGovt: string;
    digitalIndiaTitle: string;
    digitalIndiaTagline: string;
    ssoTitle: string;
    ssoSubtitle: string;
    samparkHelpLabel: string;
    samparkTitle: string;
    samparkSubtitle: string;
  };
  footer: {
    ismsSubtitle: string;
    rsldcLine1: string;
    rsldcLine2: string;
    quickLinks: string;
    home: string;
    about: string;
    services: string;
    objectives: string;
    help: string;
    contact: string;
    importantLinks: string;
    rajGovt: string;
    rsldc: string;
    skillRaj: string;
    privacy: string;
    terms: string;
    connectWithUs: string;
    helpline: string;
    copyright: string;
    tagline: string;
    scrollToTopAria: string;
  };
  helpdesk: {
    title: string;
    status: string;
    helplineLabel: string;
    acbLabel: string;
    whatsAppLabel: string;
    topicsLabel: string;
    inputPlaceholder: string;
    sendAria: string;
    launcherText: string;
    closeText: string;
    welcomeMsg: string;
    topicReg: string;
    topicTraining: string;
    topicPayments: string;
    topicHelpline: string;
    optReg: string;
    optTraining: string;
    optAssessment: string;
    optHelpline: string;
  };
}

export const LANDING_TRANSLATIONS: Record<'en' | 'hi', LandingTranslations> = {
  en: {
    navbar: {
      govtRajasthan: 'Government of Rajasthan',
      rsldcLine1: 'Rajasthan Skill and Livelihoods',
      rsldcLine2: 'Development Corporation (RSLDC)',
      ismsSubtitle: 'Integrated Scheme Management System',
      fontDecreaseAria: 'Decrease font size',
      fontStandardAria: 'Standard font size',
      fontIncreaseAria: 'Increase font size',
      loginText: 'Login',
      loginTitle: 'Login via Rajasthan Single Sign-On (SSO)',
      home: 'Home',
      about: 'About',
      services: 'Services',
      objectives: 'Objectives',
      help: 'Help',
      contact: 'Contact',
      searchPlaceholder: 'Search here...',
      searchAria: 'Search'
    },
    hero: {
      eyebrowSkills: 'Skills',
      eyebrowToday: 'for Today',
      eyebrowOpportunities: 'Opportunities for Tomorrow',
      headingPart1: 'Integrated Scheme',
      headingPart2: 'Management System',
      description: 'A unified platform to manage skill development schemes, training operations, assessments, certification and placements across Rajasthan.',
      getStarted: 'Get Started',
      knowMore: 'Know More'
    },
    tenderBox: {
      title: 'Tender',
      viewAll: 'View All',
      modalTitle: 'Official Tenders & RFP Notices',
      modalSubtitle: 'Rajasthan Skill and Livelihoods Development Corporation (RSLDC)',
      close: 'Close',
      downloadPdf: 'Download PDF',
      activeStatus: 'Open',
      hoverToPause: 'Hover to pause',
      refNo: 'Ref No',
      categoryLabel: 'Category',
      dateLabel: 'Published Date',
      allTendersCount: 'Total Tenders',
      searchPlaceholder: 'Search by title, reference number or category...',
      noTendersFound: 'No tenders found matching your search criteria.'
    },
    newsTicker: {
      badge: 'Press Releases',
      viewAll: 'View All',
      modalTitle: 'Press Releases & Official Statements',
      modalSubtitle: 'Rajasthan Skill and Livelihoods Development Corporation (RSLDC)',
      modalSource: 'Source: RSLDC Public Relations & Media',
      close: 'Close',
      readDetails: 'Read Details',
      officialPortal: 'RSLDC Official Portal',
      viewAllPortal: 'View All on Official Portal',
      searchPlaceholder: 'Search press releases by title or category...',
      noNewsFound: 'No press releases found matching your search.'
    },
    about: {
      heading: 'About ISMS 2.0',
      p1: 'Integrated Scheme Management System (ISMS 2.0) is a comprehensive e-Governance and Management Information System (MIS) designed to digitally transform and streamline RSLDC processes. It provides a centralized, secure, and integrated platform connecting youth, training providers, government departments, empaneled agencies, and assessment & certification agencies.',
      p2: 'ISMS 2.0 enables end-to-end scheme management, workflow-based approvals, real-time monitoring, MIS and reporting, and data-driven decision-making, providing a unified platform for efficient, transparent, and accountable delivery of skill development initiatives.',
      knowMore: 'Know More',
      quote: 'ISMS 2.0 is an integrated MIS system of RSLDC to provide a single platform to Youths, Training providers, Govt. Departments, Convergence Departments, and Certification agencies for Skill Development Schemes.',
      stat1Label: 'Official RFP Modules',
      stat2Label: 'Candidates',
      stat3Label: 'Training Partners',
      baseline: 'RFP Baseline (March 2025)'
    },
    mobileApp: {
      tag: 'Mobile Application',
      heading: 'ISMS 2.0 Mobile App',
      description: 'An integrated mobile application to enable access to key ISMS 2.0 services for all stakeholders.',
      knowMore: 'Know More',
      badge1: 'Access key services on the go',
      badge2: 'For multiple stakeholders',
      badge3: 'In English & Hindi',
      badge4: 'Secure and role-based access',
      helpTag: 'Help & Support',
      helpHeading: 'Need Assistance?',
      helpDescription: 'Get help with registration, training, assessment, placements, payments and other services.',
      visitHelpdesk: 'Visit Helpdesk',
      viewFaqs: 'View FAQs',
      helpdeskTitle: 'Helpdesk Support',
      helpdeskDesc: 'For any queries or support related to ISMS 2.0'
    },
    importantLinks: {
      heading: 'Other Important Links',
      prevAria: 'Previous Links',
      nextAria: 'Next Links',
      acbCallBanner: 'मांगे कोई रिश्वत तो कॉल करें',
      acbTollFreeLabel: 'Toll Free Number',
      acbTitle: 'Anti Corruption Bureau',
      saveLivesToday: 'Save lives today',
      oneDonor8Lives: 'One Donor Can Save 8 Lives',
      registerPledge: 'Register for Pledge',
      janSoochnaTitle: 'जन सूचना पोर्टल-2019',
      janSoochnaGovt: 'राजस्थान सरकार',
      bisTitle: 'Bureau of Indian Standards',
      bisSubtitle: 'The National Standards Body of India',
      skillIndiaTitle: 'Skill India',
      skillIndiaTagline: 'कौशल भारत - कुशल भारत',
      skillIndiaGovt: 'Govt of India',
      digitalIndiaTitle: 'Digital India',
      digitalIndiaTagline: 'Power To Empower',
      ssoTitle: 'Rajasthan SSO',
      ssoSubtitle: 'Single Sign On Portal',
      samparkHelpLabel: 'Help',
      samparkTitle: 'राजस्थान संपर्क',
      samparkSubtitle: 'जन समस्या निवारण प्रणाली'
    },
    footer: {
      ismsSubtitle: 'Integrated Scheme Management System',
      rsldcLine1: 'Rajasthan Skill and Livelihoods',
      rsldcLine2: 'Development Corporation (RSLDC)',
      quickLinks: 'Quick Links',
      home: 'Home',
      about: 'About',
      services: 'Services',
      objectives: 'Objectives',
      help: 'Help',
      contact: 'Contact',
      importantLinks: 'Important Links',
      rajGovt: 'Rajasthan Government',
      rsldc: 'RSLDC',
      skillRaj: 'Skill Rajasthan',
      privacy: 'Privacy Policy',
      terms: 'Terms & Conditions',
      connectWithUs: 'Connect With Us',
      helpline: 'Helpline',
      copyright: 'Rajasthan Skill and Livelihoods Development Corporation (RSLDC), All rights reserved.',
      tagline: 'Designed & Developed for a Skilled Rajasthan',
      scrollToTopAria: 'Scroll to top'
    },
    helpdesk: {
      title: 'ISMS 2.0 Helpdesk',
      status: 'Online • Rajasthan Govt Helpline',
      helplineLabel: 'Helpline',
      acbLabel: 'ACB',
      whatsAppLabel: 'WhatsApp',
      topicsLabel: 'Topics:',
      inputPlaceholder: 'Ask a question or type query...',
      sendAria: 'Send query',
      launcherText: 'Helpdesk',
      closeText: 'Close',
      welcomeMsg: 'Namaste! Welcome to ISMS 2.0 Helpdesk & Citizen Support. How may we help you today?',
      topicReg: 'Registration',
      topicTraining: 'Training MIS',
      topicPayments: 'Payments',
      topicHelpline: 'Helpline 181',
      optReg: 'Candidate Registration',
      optTraining: 'Training Center Support',
      optAssessment: 'Assessment & Certification',
      optHelpline: 'Toll-Free Helpline 181'
    }
  },
  hi: {
    navbar: {
      govtRajasthan: 'राजस्थान सरकार',
      rsldcLine1: 'राजस्थान कौशल एवं आजीविका',
      rsldcLine2: 'विकास निगम (RSLDC)',
      ismsSubtitle: 'Integrated Scheme Management System',
      fontDecreaseAria: 'फ़ॉन्ट आकार छोटा करें',
      fontStandardAria: 'सामान्य फ़ॉन्ट आकार',
      fontIncreaseAria: 'फ़ॉन्ट आकार बड़ा करें',
      loginText: 'लॉगिन',
      loginTitle: 'राजस्थान सिंगल साइन-ऑन (SSO) द्वारा लॉगिन करें',
      home: 'मुख्य पृष्ठ',
      about: 'परिचय',
      services: 'सेवाएं',
      objectives: 'उद्देश्य',
      help: 'सहायता',
      contact: 'संपर्क',
      searchPlaceholder: 'यहाँ खोजें...',
      searchAria: 'खोजें'
    },
    hero: {
      eyebrowSkills: 'कौशल',
      eyebrowToday: 'आज के लिए',
      eyebrowOpportunities: 'अवसर कल के लिए',
      headingPart1: 'Integrated Scheme',
      headingPart2: 'Management System',
      description: 'राजस्थान भर में कौशल विकास योजनाओं, प्रशिक्षण संचालन, मूल्यांकन, प्रमाणन एवं प्लेसमेंट प्रबंधन हेतु एक एकीकृत डिजिटल मंच।',
      getStarted: 'प्रारंभ करें',
      knowMore: 'अधिक जानें'
    },
    tenderBox: {
      title: 'टेंडर (Tender)',
      viewAll: 'सभी देखें',
      modalTitle: 'आधिकारिक निविदाएं एवं आरएफपी सूचनाएं',
      modalSubtitle: 'राजस्थान कौशल एवं आजीविका विकास निगम (RSLDC)',
      close: 'बंद करें',
      downloadPdf: 'पीडीएफ डाउनलोड',
      activeStatus: 'Open',
      hoverToPause: 'रोकने के लिए कर्सर लाएं',
      refNo: 'संदर्भ क्र.',
      categoryLabel: 'श्रेणी',
      dateLabel: 'प्रकाशन तिथि',
      allTendersCount: 'कुल निविदाएं',
      searchPlaceholder: 'शीर्षक, संदर्भ संख्या या श्रेणी से खोजें...',
      noTendersFound: 'खोजे गए विवरण से संबंधित कोई निविदा उपलब्ध नहीं है।'
    },
    newsTicker: {
      badge: 'प्रेस विज्ञप्ति',
      viewAll: 'सभी देखें',
      modalTitle: 'प्रेस विज्ञप्तियां एवं आधिकारिक वक्तव्य',
      modalSubtitle: 'राजस्थान कौशल एवं आजीविका विकास निगम (RSLDC)',
      modalSource: 'स्रोत: RSLDC जनसंपर्क एवं मीडिया प्रकोष्ठ',
      close: 'बंद करें',
      readDetails: 'विवरण देखें',
      officialPortal: 'RSLDC आधिकारिक पोर्टल',
      viewAllPortal: 'आधिकारिक पोर्टल पर सभी देखें',
      searchPlaceholder: 'प्रेस विज्ञप्ति या श्रेणी खोजें...',
      noNewsFound: 'खोजे गए विवरण से संबंधित कोई प्रेस विज्ञप्ति उपलब्ध नहीं है।'
    },
    about: {
      heading: 'ISMS 2.0 के बारे में',
      p1: 'Integrated Scheme Management System (ISMS 2.0) RSLDC प्रक्रियाओं को डिजिटल रूप से रूपांतरित एवं सुव्यवस्थित करने के लिए अभिकल्पित एक व्यापक ई-गवर्नेंस एवं प्रबंधन सूचना प्रणाली (MIS) है। यह युवाओं, प्रशिक्षण प्रदाताओं, सरकारी विभागों, पैनलबद्ध एजेंसियों तथा मूल्यांकन एवं प्रमाणन एजेंसियों को जोड़ने वाला एक केंद्रीकृत, सुरक्षित और एकीकृत मंच प्रदान करता है।',
      p2: 'ISMS 2.0 एंड-टू-एंड योजना प्रबंधन, वर्कफ़्लो-आधारित अनुमोदन, रीयल-टाइम निगरानी, MIS एवं रिपोर्टिंग तथा डेटा-संचालित निर्णय लेने में सक्षम बनाता है, जो कौशल विकास पहलों के कुशल, पारदर्शी और जवाबदेह निष्पादन हेतु एक एकीकृत मंच प्रदान करता है।',
      knowMore: 'अधिक जानें',
      quote: 'ISMS 2.0 RSLDC की एक एकीकृत MIS प्रणाली है जो कौशल विकास योजनाओं हेतु युवाओं, प्रशिक्षण प्रदाताओं, सरकारी विभागों, कन्वर्जेंस विभागों और प्रमाणन एजेंसियों को एक साझा मंच प्रदान करती है।',
      stat1Label: 'आधिकारिक RFP मॉड्यूल',
      stat2Label: 'प्रशिक्षित आशार्थी',
      stat3Label: 'प्रशिक्षण साझेदार',
      baseline: 'RFP आधार रेखा (मार्च 2025)'
    },
    mobileApp: {
      tag: 'मोबाइल एप्लिकेशन',
      heading: 'ISMS 2.0 मोबाइल ऐप',
      description: 'सभी हितधारकों के लिए प्रमुख ISMS 2.0 सेवाओं तक सुलभ पहुंच सुनिश्चित करने हेतु एक एकीकृत मोबाइल एप्लिकेशन।',
      knowMore: 'अधिक जानें',
      badge1: 'चलते-फिरते प्रमुख सेवाओं तक पहुंच',
      badge2: 'विभिन्न हितधारकों हेतु उपयोगी',
      badge3: 'अंग्रेजी एवं हिंदी में उपलब्ध',
      badge4: 'सुरक्षित एवं भूमिका-आधारित पहुंच',
      helpTag: 'सहायता एवं समर्थन',
      helpHeading: 'क्या आपको सहायता चाहिए?',
      helpDescription: 'पंजीकरण, प्रशिक्षण, मूल्यांकन, प्लेसमेंट, भुगतान एवं अन्य सेवाओं से संबंधित मार्गदर्शन प्राप्त करें।',
      visitHelpdesk: 'हेल्पडेस्क देखें',
      viewFaqs: 'अक्सर पूछे जाने वाले प्रश्न',
      helpdeskTitle: 'हेल्पडेस्क सहायता',
      helpdeskDesc: 'ISMS 2.0 से संबंधित किसी भी प्रश्न अथवा तकनीकी सहायता के लिए'
    },
    importantLinks: {
      heading: 'अन्य महत्वपूर्ण लिंक',
      prevAria: 'पिछले लिंक',
      nextAria: 'अगले लिंक',
      acbCallBanner: 'मांगे कोई रिश्वत तो कॉल करें',
      acbTollFreeLabel: 'Toll Free Number',
      acbTitle: 'Anti Corruption Bureau',
      saveLivesToday: 'Save lives today',
      oneDonor8Lives: 'One Donor Can Save 8 Lives',
      registerPledge: 'Register for Pledge',
      janSoochnaTitle: 'जन सूचना पोर्टल-2019',
      janSoochnaGovt: 'राजस्थान सरकार',
      bisTitle: 'Bureau of Indian Standards',
      bisSubtitle: 'The National Standards Body of India',
      skillIndiaTitle: 'Skill India',
      skillIndiaTagline: 'कौशल भारत - कुशल भारत',
      skillIndiaGovt: 'Govt of India',
      digitalIndiaTitle: 'Digital India',
      digitalIndiaTagline: 'Power To Empower',
      ssoTitle: 'Rajasthan SSO',
      ssoSubtitle: 'Single Sign On Portal',
      samparkHelpLabel: 'Help',
      samparkTitle: 'राजस्थान संपर्क',
      samparkSubtitle: 'जन समस्या निवारण प्रणाली'
    },
    footer: {
      ismsSubtitle: 'Integrated Scheme Management System',
      rsldcLine1: 'राजस्थान कौशल एवं आजीविका',
      rsldcLine2: 'विकास निगम (RSLDC)',
      quickLinks: 'त्वरित लिंक',
      home: 'मुख्य पृष्ठ',
      about: 'परिचय',
      services: 'सेवाएं',
      objectives: 'उद्देश्य',
      help: 'सहायता',
      contact: 'संपर्क',
      importantLinks: 'महत्वपूर्ण लिंक',
      rajGovt: 'राजस्थान सरकार',
      rsldc: 'RSLDC',
      skillRaj: 'कुशल राजस्थान',
      privacy: 'गोपनीयता नीति',
      terms: 'नियम एवं शर्तें',
      connectWithUs: 'हमसे जुड़ें',
      helpline: 'हेल्पलाइन',
      copyright: 'राजस्थान कौशल एवं आजीविका विकास निगम (RSLDC), सर्वाधिकार सुरक्षित।',
      tagline: 'कुशल राजस्थान के लिए संकल्पित एवं विकसित',
      scrollToTopAria: 'शीर्ष पर जाएं'
    },
    helpdesk: {
      title: 'ISMS 2.0 हेल्पडेस्क',
      status: 'ऑनलाइन • राजस्थान सरकार हेल्पलाइन',
      helplineLabel: 'हेल्पलाइन',
      acbLabel: 'एसीबी',
      whatsAppLabel: 'व्हाट्सएप',
      topicsLabel: 'प्रमुख विषय:',
      inputPlaceholder: 'अपना प्रश्न यहाँ पूछें या लिखें...',
      sendAria: 'संदेश भेजें',
      launcherText: 'हेल्पडेस्क',
      closeText: 'बंद करें',
      welcomeMsg: 'नमस्ते! ISMS 2.0 हेल्पडेस्क एवं नागरिक सहायता में आपका स्वागत है। आज हम आपकी क्या सहायता कर सकते हैं?',
      topicReg: 'पंजीकरण',
      topicTraining: 'प्रशिक्षण MIS',
      topicPayments: 'भुगतान',
      topicHelpline: 'हेल्पलाइन 181',
      optReg: 'आशार्थी पंजीकरण',
      optTraining: 'प्रशिक्षण केंद्र सहायता',
      optAssessment: 'मूल्यांकन एवं प्रमाणन',
      optHelpline: 'टोल-फ्री हेल्पलाइन 181'
    }
  }
};
