/** Placeholder artwork and generated previews shown in the document viewer when no real file is available. */

export const DEFAULT_AADHAAR_CARD_DATA_URL = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
      <rect width="600" height="380" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="0" y="0" width="600" height="60" fill="#f8fafc" rx="12"/>
      <rect x="0" y="48" width="600" height="12" fill="#ffffff"/>
      <line x1="0" y1="60" x2="600" y2="60" stroke="#e2e8f0" stroke-width="1.5"/>
      <rect x="0" y="0" width="600" height="5" fill="#f97316"/>
      <text x="30" y="32" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0f172a">भारत सरकार</text>
      <text x="30" y="48" font-family="sans-serif" font-size="10" fill="#64748b">Government of India</text>
      <text x="570" y="32" text-anchor="end" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0f172a">भारतीय विशिष्ट पहचान प्राधिकरण</text>
      <text x="570" y="48" text-anchor="end" font-family="sans-serif" font-size="10" fill="#64748b">Unique Identification Authority of India</text>
      <rect x="35" y="85" width="105" height="135" rx="6" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
      <circle cx="87" cy="135" r="28" fill="#1e293b"/>
      <path d="M50 205 C 50 170, 125 170, 125 205 Z" fill="#334155"/>
      <text x="87" y="215" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#94a3b8">PHOTO</text>
      <text x="165" y="105" font-family="sans-serif" font-size="11" fill="#64748b">नाम / Name:</text>
      <text x="165" y="125" font-family="sans-serif" font-size="15" font-weight="bold" fill="#0f172a">राहुल शर्मा / Rahul Sharma</text>
      <text x="165" y="152" font-family="sans-serif" font-size="11" fill="#64748b">जन्म तिथि / DOB:</text>
      <text x="280" y="152" font-family="sans-serif" font-size="13" font-weight="600" fill="#1e293b">15/05/2002</text>
      <text x="165" y="175" font-family="sans-serif" font-size="11" fill="#64748b">लिंग / Gender:</text>
      <text x="280" y="175" font-family="sans-serif" font-size="13" font-weight="600" fill="#1e293b">पुरुष / Male</text>
      <text x="165" y="198" font-family="sans-serif" font-size="11" fill="#64748b">पिता / Father:</text>
      <text x="280" y="198" font-family="sans-serif" font-size="13" font-weight="600" fill="#1e293b">मनोज शर्मा / Manoj Sharma</text>
      <rect x="470" y="85" width="95" height="95" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" rx="4"/>
      <path d="M480 95 h25 v25 h-25 z M530 95 h25 v25 h-25 z M480 145 h25 v25 h-25 z M515 125 h15 v15 h-15 z M535 135 h15 v15 h-15 z M510 150 h15 v15 h-15 z" fill="#1e293b"/>
      <text x="517" y="193" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#64748b">SECURE QR</text>
      <rect x="0" y="240" width="600" height="70" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
      <text x="300" y="284" text-anchor="middle" font-family="monospace" font-size="24" font-weight="bold" fill="#dc2626" letter-spacing="4">
        XXXX XXXX 3012
      </text>
      <rect x="0" y="340" width="600" height="40" fill="#ffffff" rx="12"/>
      <line x1="0" y1="340" x2="600" y2="340" stroke="#e2e8f0" stroke-width="1"/>
      <rect x="0" y="375" width="600" height="5" fill="#16a34a"/>
      <text x="300" y="362" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#047857">
        मेरा आधार, मेरी पहचान
      </text>
    </svg>
`);

export const DEFAULT_CANDIDATE_PHOTO_DATA_URL = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
      <defs>
        <linearGradient id="photoBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#f8fafc"/>
          <stop offset="100%" stop-color="#e2e8f0"/>
        </linearGradient>
      </defs>
      <rect width="400" height="500" fill="url(#photoBg)" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="15" y="15" width="370" height="470" rx="8" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5"/>
      <circle cx="200" cy="180" r="75" fill="#1e293b"/>
      <path d="M70 420 C 70 280, 330 280, 330 420 Z" fill="#334155"/>
      <rect x="50" y="430" width="300" height="40" rx="8" fill="#ffffff" stroke="#cbd5e1"/>
      <text x="200" y="455" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0f172a" letter-spacing="1">CANDIDATE PASSPORT PHOTO</text>
    </svg>
`);

export function generateDocumentPreviewSvg(title: string, sub: string, aspirantName: string, aadhaarNo: string): string {
  const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750">
        <rect width="600" height="750" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        <rect x="0" y="0" width="600" height="12" fill="#174a6e"/>
        <circle cx="300" cy="70" r="28" fill="#f1f5f9" stroke="#cbd5e1"/>
        <text x="300" y="75" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#174a6e">GOVT OF RAJASTHAN</text>
        <text x="300" y="130" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="bold" fill="#0f172a">${title.toUpperCase()}</text>
        <text x="300" y="155" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#64748b">${sub}</text>
        <line x1="60" y1="175" x2="540" y2="175" stroke="#e2e8f0" stroke-width="1.5"/>
        <rect x="60" y="200" width="480" height="360" rx="8" fill="#f8fafc" stroke="#e2e8f0"/>
        <text x="90" y="240" font-family="sans-serif" font-size="12" font-weight="bold" fill="#334155">CANDIDATE INFORMATION</text>
        <text x="90" y="280" font-family="sans-serif" font-size="12" fill="#64748b">Candidate Name: <tspan font-weight="bold" fill="#0f172a">${aspirantName || 'Rahul Sharma'}</tspan></text>
        <text x="90" y="310" font-family="sans-serif" font-size="12" fill="#64748b">Aadhaar (Masked): <tspan font-weight="bold" fill="#0f172a">XXXX-XXXX-${aadhaarNo ? aadhaarNo.slice(-4) : '3012'}</tspan></text>
        <text x="90" y="340" font-family="sans-serif" font-size="12" fill="#64748b">Application ID: <tspan font-weight="bold" fill="#0f172a">ASP-RJ-2026-9812</tspan></text>
        <text x="90" y="370" font-family="sans-serif" font-size="12" fill="#64748b">Verification Status: <tspan font-weight="bold" fill="#16a34a">VERIFIED &amp; ATTESTED</tspan></text>
        <rect x="90" y="410" width="420" height="100" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
        <text x="110" y="445" font-family="sans-serif" font-size="11" fill="#475569">Certified that this document has been scanned and verified against</text>
        <text x="110" y="465" font-family="sans-serif" font-size="11" fill="#475569">official records for ISMS Skill Development Registration.</text>
        <rect x="380" y="590" width="160" height="70" fill="#f1f5f9" stroke="#94a3b8" stroke-dasharray="4 2"/>
        <text x="460" y="630" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#64748b">OFFICIAL SEAL</text>
      </svg>
  `;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}
