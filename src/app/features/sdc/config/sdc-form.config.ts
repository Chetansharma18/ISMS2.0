import { FormFieldConfig, FormSectionConfig, FormOption } from '../../../shared/components/form-sdc';
import { SdcScheme, SDC_SCHEME_OPTIONS, SDC_SECTOR_OPTIONS } from '../models/sdc.model';

export interface SdcFormConfigOptions {
  onSchemeChange?: (scheme: SdcScheme) => void;
  onSectorChange?: (sector: string) => void;
  initialDistrict?: string;
}

export interface DistrictInfo {
  division: string;
  assemblyConstituencies: string[];
  parliamentConstituencies: string[];
  blocks: string[];
}

/**
 * Complete Rajasthan district, division, assembly constituency, parliament constituency,
 * and block hierarchy for ISMS 2.0. State is exclusively Rajasthan.
 */
export const RAJASTHAN_LOCATION_DATA: Record<string, DistrictInfo> = {
  Jaipur: {
    division: 'Jaipur',
    assemblyConstituencies: ['Sanganer', 'Amber', 'Bassi', 'Chaksu', 'Chomu', 'Civil Lines', 'Hawa Mahal', 'Jamwa Ramgarh', 'Jhotwara', 'Kishanpole', 'Kotputli', 'Malviya Nagar', 'Phulera', 'Shahpura', 'Vidhyadhar Nagar', 'Viratnagar', 'Adarsh Nagar', 'Bagru', 'Dudu'],
    parliamentConstituencies: ['Jaipur', 'Jaipur Rural'],
    blocks: ['Sanganer', 'Amber', 'Bassi', 'Chaksu', 'Chomu', 'Govindgarh', 'Jamwa Ramgarh', 'Jhotwara', 'Kotputli', 'Paota', 'Phagi', 'Sambhar', 'Shahpura', 'Viratnagar']
  },
  Jodhpur: {
    division: 'Jodhpur',
    assemblyConstituencies: ['Sardarpura', 'Jodhpur', 'Soorsagar', 'Luni', 'Bilara', 'Bhopalgarh', 'Osian', 'Shergarh', 'Phalodi', 'Lohawat'],
    parliamentConstituencies: ['Jodhpur'],
    blocks: ['Balesar', 'Baori', 'Bhopalgarh', 'Bilara', 'Luni', 'Mandor', 'Osian', 'Phalodi', 'Shergarh', 'Tiwari']
  },
  Ajmer: {
    division: 'Ajmer',
    assemblyConstituencies: ['Ajmer North', 'Ajmer South', 'Nasirabad', 'Beawar', 'Masuda', 'Kekri', 'Kishangarh', 'Pushkar'],
    parliamentConstituencies: ['Ajmer'],
    blocks: ['Ajmer Rural', 'Arain', 'Bhinai', 'Jawaja', 'Kekri', 'Kishangarh', 'Masuda', 'Peesangan', 'Srinagar']
  },
  Alwar: {
    division: 'Jaipur',
    assemblyConstituencies: ['Tijara', 'Kishangarh Bas', 'Mundawar', 'Behror', 'Alwar Rural', 'Alwar Urban', 'Ramgarh', 'Rajgarh Laxmangarh', 'Kathumar', 'Thanagazi', 'Bansur'],
    parliamentConstituencies: ['Alwar'],
    blocks: ['Bansur', 'Behror', 'Kathumar', 'Kishangarh Bas', 'Kotkasim', 'Laxmangarh', 'Mandawar', 'Neemrana', 'Rajgarh', 'Ramgarh', 'Reni', 'Thanagazi', 'Tijara', 'Umren']
  },
  Bikaner: {
    division: 'Bikaner',
    assemblyConstituencies: ['Bikaner West', 'Bikaner East', 'Kolayat', 'Lunkaransar', 'Dungargarh', 'Nokha', 'Khajuwala'],
    parliamentConstituencies: ['Bikaner'],
    blocks: ['Bikaner', 'Dungargarh', 'Khajuwala', 'Kolayat', 'Lunkaransar', 'Nokha', 'Poogal']
  },
  Kota: {
    division: 'Kota',
    assemblyConstituencies: ['Kota North', 'Kota South', 'Ladpura', 'Ramganj Mandi', 'Sangod', 'Pipalda'],
    parliamentConstituencies: ['Kota'],
    blocks: ['Chechat', 'Itawa', 'Khairabad', 'Ladpura', 'Sangod', 'Sultanpur']
  },
  Udaipur: {
    division: 'Udaipur',
    assemblyConstituencies: ['Udaipur', 'Udaipur Rural', 'Vallabhnagar', 'Mavli', 'Gogunda', 'Jhadol', 'Kherwara', 'Salumber'],
    parliamentConstituencies: ['Udaipur'],
    blocks: ['Badgaon', 'Bhinder', 'Girwa', 'Gogunda', 'Jhadol', 'Kherwara', 'Kotra', 'Lasadiya', 'Mavli', 'Rishabhdeo', 'Salumbar', 'Sarada', 'Sayra', 'Vallabhnagar']
  },
  Sikar: {
    division: 'Jaipur',
    assemblyConstituencies: ['Sikar', 'Dhod', 'Danta Ramgarh', 'Khandela', 'Neem Ka Thana', 'Srimadhopur', 'Fatehpur', 'Laxmangarh'],
    parliamentConstituencies: ['Sikar'],
    blocks: ['Danta Ramgarh', 'Dhod', 'Fatehpur', 'Khandela', 'Laxmangarh', 'Neem Ka Thana', 'Patan', 'Piprali', 'Srimadhopur']
  },
  Bhilwara: {
    division: 'Ajmer',
    assemblyConstituencies: ['Asind', 'Mandal', 'Sahara', 'Bhilwara', 'Shahpura', 'Jahazpur', 'Mandalgarh'],
    parliamentConstituencies: ['Bhilwara'],
    blocks: ['Asind', 'Banera', 'Bijolia', 'Hurda', 'Jahazpur', 'Kotri', 'Mandal', 'Mandalgarh', 'Raipur', 'Sahada', 'Shahpura', 'Suwana']
  },
  Bharatpur: {
    division: 'Bharatpur',
    assemblyConstituencies: ['Kaman', 'Nagar', 'Deeg-Kumher', 'Bharatpur', 'Nadbai', 'Weir', 'Bayana'],
    parliamentConstituencies: ['Bharatpur'],
    blocks: ['Bayana', 'Deeg', 'Kaman', 'Kumher', 'Nadbai', 'Nagar', 'Pahari', 'Roopbas', 'Sewar', 'Weir']
  },
  Nagaur: {
    division: 'Ajmer',
    assemblyConstituencies: ['Nagaur', 'Khinvsar', 'Merta', 'Degana', 'Makrana', 'Parbatsar', 'Nawa', 'Jayal', 'Ladnun', 'Didwana'],
    parliamentConstituencies: ['Nagaur'],
    blocks: ['Degana', 'Didwana', 'Jayal', 'Kuchaman City', 'Ladnun', 'Makrana', 'Merta', 'Mundwa', 'Nagaur', 'Parbatsar', 'Riyan Badi']
  },
  Pali: {
    division: 'Jodhpur',
    assemblyConstituencies: ['Sojat', 'Pali', 'Marwar Junction', 'Bali', 'Sumerpur', 'Jaitaran'],
    parliamentConstituencies: ['Pali'],
    blocks: ['Bali', 'Desuri', 'Jaitaran', 'Marwar Junction', 'Pali', 'Raipur', 'Rani', 'Rohat', 'Sojat', 'Sumerpur']
  },
  Barmer: {
    division: 'Jodhpur',
    assemblyConstituencies: ['Sheo', 'Barmer', 'Baytoo', 'Pachpadra', 'Siwana', 'Gudamalani', 'Chohtan'],
    parliamentConstituencies: ['Barmer'],
    blocks: ['Balotra', 'Barmer', 'Baytoo', 'Chohtan', 'Dhorimanna', 'Gudamalani', 'Kalyanpur', 'Patodi', 'Ramsar', 'Samdari', 'Sedwa', 'Sheo', 'Sindhari']
  },
  Banswara: {
    division: 'Udaipur',
    assemblyConstituencies: ['Ghatol', 'Garhi', 'Banswara', 'Bagidora', 'Kushalgarh'],
    parliamentConstituencies: ['Banswara'],
    blocks: ['Anandpuri', 'Bagidora', 'Banswara', 'Chhoti Sarwan', 'Gangartalav', 'Ghatol', 'Garhi', 'Kushalgarh', 'Sajjangarh', 'Talwara']
  },
  Baran: {
    division: 'Kota',
    assemblyConstituencies: ['Anta', 'Kishanganj', 'Baran-Atru', 'Chhabra'],
    parliamentConstituencies: ['Jhalawar-Baran'],
    blocks: ['Anta', 'Atru', 'Baran', 'Chhabra', 'Chhipabarod', 'Kishanganj', 'Shahbad']
  },
  Chittorgarh: {
    division: 'Udaipur',
    assemblyConstituencies: ['Chittorgarh', 'Begun', 'Kapasan', 'Bari Sadri', 'Nimbahera'],
    parliamentConstituencies: ['Chittorgarh'],
    blocks: ['Bari Sadri', 'Begun', 'Bhadesar', 'Bhopalsagar', 'Chittorgarh', 'Dungla', 'Gangrar', 'Kapasan', 'Nimbahera', 'Rashmi', 'Rawatbhata']
  },
  Churu: {
    division: 'Bikaner',
    assemblyConstituencies: ['Sadulpur', 'Taranagar', 'Sardarshahar', 'Churu', 'Ratangarh', 'Sujangarh'],
    parliamentConstituencies: ['Churu'],
    blocks: ['Bidasar', 'Churu', 'Rajgarh', 'Ratangarh', 'Sardarshahar', 'Sujangarh', 'Taranagar']
  },
  Dausa: {
    division: 'Jaipur',
    assemblyConstituencies: ['Dausa', 'Bandikui', 'Mahwa', 'Sikrai', 'Lalsot'],
    parliamentConstituencies: ['Dausa'],
    blocks: ['Bandikui', 'Dausa', 'Lalsot', 'Mahwa', 'Ramgarh Pachwara', 'Sikrai']
  },
  Dholpur: {
    division: 'Bharatpur',
    assemblyConstituencies: ['Baseri', 'Bari', 'Dholpur', 'Rajakhera'],
    parliamentConstituencies: ['Karauli-Dholpur'],
    blocks: ['Bari', 'Baseri', 'Dholpur', 'Rajakhera', 'Saipau', 'Sarmathura']
  },
  Dungarpur: {
    division: 'Udaipur',
    assemblyConstituencies: ['Dungarpur', 'Aspur', 'Sagwara', 'Chorasi'],
    parliamentConstituencies: ['Banswara'],
    blocks: ['Aspur', 'Bichhiwara', 'Dovda', 'Dungarpur', 'Galiakot', 'Gamhari', 'Jhulthana', 'Sagwara', 'Simalwara']
  },
  Hanumangarh: {
    division: 'Bikaner',
    assemblyConstituencies: ['Sangaria', 'Hanumangarh', 'Pilibanga', 'Nohar', 'Bhadra'],
    parliamentConstituencies: ['Ganganagar'],
    blocks: ['Bhadra', 'Hanumangarh', 'Nohar', 'Pilibanga', 'Rawatsar', 'Sangaria', 'Tibbi']
  },
  Jaisalmer: {
    division: 'Jodhpur',
    assemblyConstituencies: ['Jaisalmer', 'Pokaran'],
    parliamentConstituencies: ['Barmer'],
    blocks: ['Fatehgarh', 'Jaisalmer', 'Mohangarh', 'Nachna', 'Pokaran', 'Sam']
  },
  Jalore: {
    division: 'Jodhpur',
    assemblyConstituencies: ['Ahore', 'Jalore', 'Bhinmal', 'Sanchore', 'Raniwara'],
    parliamentConstituencies: ['Jalore'],
    blocks: ['Ahore', 'Bagoda', 'Bhinmal', 'Chitalwana', 'Jalore', 'Jaswantpura', 'Raniwara', 'Sanchore', 'Sayla']
  },
  Jhalawar: {
    division: 'Kota',
    assemblyConstituencies: ['Dag', 'Jhalrapatan', 'Khanpur', 'Manohar Thana'],
    parliamentConstituencies: ['Jhalawar-Baran'],
    blocks: ['Bakani', 'Dag', 'Jhalrapatan', 'Khanpur', 'Manohar Thana', 'Pirawa', 'Sunel']
  },
  Jhunjhunu: {
    division: 'Jaipur',
    assemblyConstituencies: ['Pilani', 'Surajgarh', 'Jhunjhunu', 'Mandawa', 'Nawalgarh', 'Udaipurwati', 'Khetri'],
    parliamentConstituencies: ['Jhunjhunu'],
    blocks: ['Alsisar', 'Buhana', 'Chirawa', 'Jhunjhunu', 'Khetri', 'Nawalgarh', 'Surajgarh', 'Udaipurwati']
  },
  Karauli: {
    division: 'Bharatpur',
    assemblyConstituencies: ['Todabhim', 'Hindaun', 'Karauli', 'Sapotra'],
    parliamentConstituencies: ['Karauli-Dholpur'],
    blocks: ['Hindaun', 'Karauli', 'Karanpur', 'Mandrayal', 'Nadoti', 'Sapotra', 'Todabhim']
  },
  Pratapgarh: {
    division: 'Udaipur',
    assemblyConstituencies: ['Dhariawad', 'Pratapgarh'],
    parliamentConstituencies: ['Chittorgarh'],
    blocks: ['Arnod', 'Chhoti Sadri', 'Dhariawad', 'Peepalkhoont', 'Pratapgarh']
  },
  Rajsamand: {
    division: 'Udaipur',
    assemblyConstituencies: ['Bhim', 'Kumbhalgarh', 'Rajsamand', 'Nathdwara'],
    parliamentConstituencies: ['Rajsamand'],
    blocks: ['Amet', 'Bhim', 'Deogarh', 'Khamnore', 'Kumbhalgarh', 'Railmagra', 'Rajsamand']
  },
  'Sawai Madhopur': {
    division: 'Bharatpur',
    assemblyConstituencies: ['Gangapur', 'Bamanwas', 'Sawai Madhopur', 'Khandar'],
    parliamentConstituencies: ['Tonk-Sawai Madhopur'],
    blocks: ['Bamanwas', 'Bonli', 'Chauth Ka Barwara', 'Gangapur City', 'Khandar', 'Malarna Doongar', 'Sawai Madhopur']
  },
  Sirohi: {
    division: 'Jodhpur',
    assemblyConstituencies: ['Sirohi', 'Pindwara-Abu', 'Reodar'],
    parliamentConstituencies: ['Jalore'],
    blocks: ['Abu Road', 'Pindwara', 'Reodar', 'Sheoganj', 'Sirohi']
  },
  'Sri Ganganagar': {
    division: 'Bikaner',
    assemblyConstituencies: ['Sadulshahar', 'Ganganagar', 'Karanpur', 'Suratgarh', 'Raisinghnagar', 'Anupgarh'],
    parliamentConstituencies: ['Ganganagar'],
    blocks: ['Anupgarh', 'Gharshana', 'Karanpur', 'Padampur', 'Raisingh Nagar', 'Sadulshahar', 'Sri Ganganagar', 'Suratgarh', 'Vijaynagar']
  },
  Tonk: {
    division: 'Ajmer',
    assemblyConstituencies: ['Malpura', 'Niwai', 'Tonk', 'Deoli-Uniara'],
    parliamentConstituencies: ['Tonk-Sawai Madhopur'],
    blocks: ['Deoli', 'Malpura', 'Niwai', 'Peeploo', 'Todaraisingh', 'Tonk', 'Uniara']
  },
  Bundi: {
    division: 'Kota',
    assemblyConstituencies: ['Hindoli', 'Keshoraipatan', 'Bundi'],
    parliamentConstituencies: ['Kota'],
    blocks: ['Bundi', 'Hindoli', 'K.Patan', 'Nainwa', 'Talera']
  }
};

/** Standard TP Recommendation options */
export const TP_RECOMMENDATION_OPTIONS: string[] = [
  'Recommended for Level-4 Accreditation',
  'Recommended for Level-3 Accreditation',
  'Recommended with Minor Conditions',
  'Under Review / Auditor Inspection Pending',
  'Correction / Rectification Required',
  'Not Recommended'
];

/** Standard Mandatory Measures compliance options */
export const MANDATORY_MEASURES_OPTIONS: string[] = [
  'All Mandatory Measures Met',
  'Infrastructure & Classrooms Compliant',
  'Biometric AEBAS Attendance Setup Verified',
  'CCTV & Fire Safety Norms Compliant',
  'Domain Equipment & Power Backup Ready',
  'Pending Minor Rectification'
];

/**
 * Returns a flat list of form fields in unified responsive 4-column layout:
 * - Row 1: Center Name (2) + Sector (2) = 4 [Center Name text input, not dropdown]
 * - Row 2: State (1) + District (1) + Assembly Constituency (1, dropdown) + Parliament Constituency (1, dropdown) = 4
 * - Row 3: Division (1, auto-filled accordingly) + Block (1, dropdown) + Proposed Start Date (1) + SDC Capacity (1) = 4
 * - Row 4: Center Email (1) + Address (2) + Pin Code (1) = 4
 * - Row 5: Total TP Trained (1) + Total TP Placed (1) + Hostel Category (2, non-residential removed) = 4
 * - Row 6: Latitude (1) + Longitude (1) + Remarks (2) = 4
 * - Row 7 (LAST): Center Photos (4, min 3 JPG photos + add more) = 4
 */
export function getSdcFormFields(options: SdcFormConfigOptions = {}): FormFieldConfig[] {
  const currentDistrict = options.initialDistrict || 'Jaipur';

  const districtNames = Object.keys(RAJASTHAN_LOCATION_DATA);
  const districtOptions: FormOption[] = districtNames.map(d => ({ label: d, value: d }));

  const initialDistrictInfo = RAJASTHAN_LOCATION_DATA[currentDistrict] || RAJASTHAN_LOCATION_DATA['Jaipur'];

  const initialAssemblyOptions: FormOption[] = (initialDistrictInfo?.assemblyConstituencies || []).map(a => ({
    label: a,
    value: a
  }));

  const initialParliamentOptions: FormOption[] = (initialDistrictInfo?.parliamentConstituencies || []).map(p => ({
    label: p,
    value: p
  }));

  const initialBlockOptions: FormOption[] = (initialDistrictInfo?.blocks || []).map(b => ({
    label: b,
    value: b
  }));

  const sectorOptions: FormOption[] = SDC_SECTOR_OPTIONS.map(s => ({
    label: s,
    value: s
  }));

  // Non-Residential removed as requested
  const hostelCategoryOptions: FormOption[] = [
    { label: 'Residential (Both Boys & Girls)', value: 'Residential (Both Boys & Girls)' },
    { label: 'Residential (Boys Only)', value: 'Residential (Boys Only)' },
    { label: 'Residential (Girls Only)', value: 'Residential (Girls Only)' }
  ];

  const assemblyField: FormFieldConfig = {
    key: 'assemblyConstituency',
    label: 'Assembly Constituency',
    type: 'select',
    required: true,
    requiredMessage: 'Please select an Assembly Constituency',
    options: initialAssemblyOptions,
    placeholder: 'Select Assembly Constituency',
    colSpan: 1
  };

  const parliamentField: FormFieldConfig = {
    key: 'parliamentConstituency',
    label: 'Parliament Constituency',
    type: 'select',
    required: true,
    requiredMessage: 'Please select a Parliament Constituency',
    options: initialParliamentOptions,
    placeholder: 'Select Parliament Constituency',
    colSpan: 1
  };

  const blockField: FormFieldConfig = {
    key: 'block',
    label: 'Block',
    type: 'select',
    required: true,
    requiredMessage: 'Please select a Block',
    options: initialBlockOptions,
    placeholder: 'Select Block',
    colSpan: 1
  };

  const divisionField: FormFieldConfig = {
    key: 'division',
    label: 'Division',
    type: 'text',
    readonly: true,
    placeholder: 'Auto-synced from District',
    colSpan: 1
  };

  const districtField: FormFieldConfig = {
    key: 'district',
    label: 'District',
    type: 'select',
    required: true,
    options: districtOptions,
    placeholder: 'Select District',
    colSpan: 1,
    onChange: (newDistrict: string, _field, model: Record<string, any>) => {
      const distInfo = RAJASTHAN_LOCATION_DATA[newDistrict];
      if (distInfo) {
        // Auto-fill division accordingly
        model['division'] = distInfo.division;

        // Populate and select Assembly Constituency
        assemblyField.options = distInfo.assemblyConstituencies.map(a => ({ label: a, value: a }));
        model['assemblyConstituency'] = distInfo.assemblyConstituencies[0] || '';

        // Populate and select Parliament Constituency
        parliamentField.options = distInfo.parliamentConstituencies.map(p => ({ label: p, value: p }));
        model['parliamentConstituency'] = distInfo.parliamentConstituencies[0] || '';

        // Populate and select Block
        blockField.options = distInfo.blocks.map(b => ({ label: b, value: b }));
        model['block'] = distInfo.blocks[0] || '';
      }
    }
  };

  // State is strictly one: Rajasthan
  const stateField: FormFieldConfig = {
    key: 'state',
    label: 'State',
    type: 'select',
    required: true,
    disabled: true,
    options: [{ label: 'Rajasthan', value: 'Rajasthan' }],
    colSpan: 1
  };

  const fields: FormFieldConfig[] = [
    // ------------------------------------------------------------------------------------------------------
    // ROW 1: Center Name (2) | Sector (2) = 4
    // Center Name: text input (not dropdown) as requested by user
    // Sector: dropdown with the 35 sectors
    // ------------------------------------------------------------------------------------------------------
    {
      key: 'sdcName',
      label: 'Center Name',
      type: 'text',
      required: true,
      requiredMessage: 'Center Name is required',
      placeholder: 'Enter Center Name',
      colSpan: 2
    },
    {
      key: 'sector',
      label: 'Sector',
      type: 'select',
      required: true,
      requiredMessage: 'Please select a Sector',
      placeholder: 'Select Sector',
      options: sectorOptions,
      colSpan: 2,
      onChange: (newSector: string) => {
        if (options.onSectorChange) {
          options.onSectorChange(newSector);
        }
      }
    },

    // ------------------------------------------------------------------------------------------------------
    // ROW 2: State (1) | District (1) | Assembly Constituency (1) | Parliament Constituency (1) = 4
    // Directly after District: Assembly Constituency (dropdown) then Parliament Constituency (dropdown)
    // ------------------------------------------------------------------------------------------------------
    stateField,
    districtField,
    assemblyField,
    parliamentField,

    // ------------------------------------------------------------------------------------------------------
    // ROW 3: Division (1) | Block (1) | Proposed Start Date (1) | SDC Capacity (1) = 4
    // Division filled accordingly based on selected District
    // ------------------------------------------------------------------------------------------------------
    divisionField,
    blockField,
    {
      key: 'proposedStartDate',
      label: 'Proposed Start Date',
      type: 'date',
      required: true,
      requiredMessage: 'Proposed Start Date is required',
      colSpan: 1
    },
    {
      key: 'sdcCapacity',
      label: 'SDC Capacity',
      type: 'number',
      required: true,
      requiredMessage: 'SDC Capacity is required',
      min: 1,
      max: 5000,
      placeholder: '100',
      colSpan: 1
    },

    // ------------------------------------------------------------------------------------------------------
    // ROW 4: Center Email (1) | Address (2) | Pin Code (1) = 4
    // ------------------------------------------------------------------------------------------------------
    {
      key: 'centerEmail',
      label: 'Center Email',
      type: 'email',
      required: true,
      requiredMessage: 'Center Email is required',
      maxLength: 80,
      placeholder: 'center@example.com',
      colSpan: 1
    },
    {
      key: 'fullAddress',
      label: 'Address',
      type: 'textarea',
      required: true,
      requiredMessage: 'Address is required',
      minLength: 10,
      maxLength: 250,
      rows: 2,
      placeholder: 'Plot 42, Skill Industrial Area, Sanganer, Jaipur',
      colSpan: 2
    },
    {
      key: 'pincode',
      label: 'Pin Code',
      type: 'text',
      required: true,
      requiredMessage: 'Pin Code is required',
      minLength: 6,
      maxLength: 6,
      pattern: '^[1-9][0-9]{5}$',
      patternMessage: 'Pin Code must be a 6-digit numeric code',
      placeholder: '302029',
      colSpan: 1
    },

    // ------------------------------------------------------------------------------------------------------
    // ROW 5: Total TP Trained (1) | Total TP Placed (1) | Hostel Category (2) = 4
    // Hostel Category without 'Non-Residential' option as requested
    // ------------------------------------------------------------------------------------------------------
    {
      key: 'totalTrainedAspirants',
      label: 'Total TP Trained Aspirant',
      type: 'number',
      min: 0,
      max: 999999,
      placeholder: '500',
      colSpan: 1
    },
    {
      key: 'totalPlacedAspirants',
      label: 'Total TP Placed Aspirant',
      type: 'number',
      min: 0,
      max: 999999,
      placeholder: '400',
      colSpan: 1
    },
    {
      key: 'hostelCategory',
      label: 'Hostel Category',
      type: 'select',
      placeholder: 'Select Hostel Category',
      options: hostelCategoryOptions,
      colSpan: 2
    },

    // ------------------------------------------------------------------------------------------------------
    // ROW 6: Latitude (1) | Longitude (1) | Remarks (2) = 4
    // Remarks placed at photo upload location as requested
    // ------------------------------------------------------------------------------------------------------
    {
      key: 'latitude',
      label: 'Latitude (GPS)',
      type: 'number',
      min: -90,
      max: 90,
      placeholder: '26.9124',
      colSpan: 1
    },
    {
      key: 'longitude',
      label: 'Longitude (GPS)',
      type: 'number',
      min: -180,
      max: 180,
      placeholder: '75.7873',
      colSpan: 1
    },
    {
      key: 'remarks',
      label: 'Remarks',
      type: 'textarea',
      rows: 2,
      maxLength: 300,
      placeholder: 'Inspection & operational remarks',
      colSpan: 2,
      onChange: (val: string, _f: any, model: Record<string, any>) => {
        model['tpRemarks'] = val;
      }
    },

    // ------------------------------------------------------------------------------------------------------
    // ROW 7 (LAST): Center Photos (4) = 4
    // Center Photos placed last spanning full width
    // ------------------------------------------------------------------------------------------------------
    {
      key: 'centerPhotos',
      label: 'Center Photos (JPG)',
      type: 'photos',
      accept: '.jpg,.jpeg,image/jpeg',
      required: true,
      minPhotos: 3,
      colSpan: 4
    }
  ];

  return fields;
}

/**
 * Backward compatibility helper for components expecting sections.
 */
export function getSdcFormSections(options: SdcFormConfigOptions = {}): FormSectionConfig[] {
  return [
    {
      id: 'sdc-single-form',
      gridCols: 4,
      fields: getSdcFormFields(options)
    }
  ];
}
