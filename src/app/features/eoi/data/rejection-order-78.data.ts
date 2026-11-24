import type { RejectedAgencyItem } from '../models/empanelment-order.model';

export interface RejectionOrderPageDefinition {
  pageNumber: number;
  entries: RejectedAgencyItem[];
}

export const REJECTION_78_PAGES: RejectionOrderPageDefinition[] = [
  // Page 1: Entries 1 to 22 (22 items)
  {
    pageNumber: 1,
    entries: [
      { sNo: 1, applicationId: 'APP-004036', agencyName: 'A.P Electrical', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 2, applicationId: 'APP-004684', agencyName: 'Aashi Plastic Pvt.Ltd.', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 3, applicationId: 'APP-004243', agencyName: 'Arya Shiksha Samiti', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 4, applicationId: 'APP-004275', agencyName: 'Bahu Uddeshiya Kunal Academy Sansthan', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 5, applicationId: 'APP-004014', agencyName: 'Bhartiya Pashupalan Nigam Limited', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 6, applicationId: 'APP-003670', agencyName: 'Dikveer Engineers', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 7, applicationId: 'APP-003681', agencyName: 'DTTY infotech Pvt. Ltd.', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 8, applicationId: 'APP-004333', agencyName: 'Elephanta Milk Food Pvt.Ltd', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 9, applicationId: 'APP-003790', agencyName: 'Event Media & Promotion', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 10, applicationId: 'APP-004508', agencyName: 'Gaurav Enterprises', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 11, applicationId: 'APP-003660', agencyName: 'Gautam Hospital & Research Center (GHRC)', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 12, applicationId: 'APP-003781', agencyName: 'Hari Prashad Sharma contractor', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 13, applicationId: 'APP-003938', agencyName: 'Highway Agro India Pvt. Ltd.', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 14, applicationId: 'APP-004694', agencyName: 'HT Infra', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 15, applicationId: 'APP-004065', agencyName: 'IFA Skill', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 16, applicationId: 'APP-004096', agencyName: 'Jeewan Vidyapeeth Pvt.Ltd.', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 17, applicationId: 'APP-004737', agencyName: 'Kamaksha Nursing Gh Education Society Sagwara', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 18, applicationId: 'APP-003883', agencyName: 'Kavya Enterprises', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 19, applicationId: 'APP-004720', agencyName: 'Kavya Siksha Evam Vikas Seva Sansthan', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 20, applicationId: 'APP-003822', agencyName: 'Limba Trading Company', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 21, applicationId: 'APP-003649', agencyName: 'Lui Brail Drishtiheen Vikas Sansthan', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 22, applicationId: 'APP-003755', agencyName: 'M/S Jeteshwar Enterprises', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' }
    ]
  },

  // Page 2: Entries 23 to 49 (27 items)
  {
    pageNumber: 2,
    entries: [
      { sNo: 23, applicationId: 'APP-004312', agencyName: 'M/S Rakesh Kumar Sikarwar Govt.Contractor', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 24, applicationId: 'APP-004533', agencyName: 'M/S Skill India Manpower Service', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 25, applicationId: 'APP-004261', agencyName: 'Maa Samaleswari Educational And Welfare Trust', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 26, applicationId: 'APP-003986', agencyName: 'Mahak Enterprises', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 27, applicationId: 'APP-004697', agencyName: 'MAHAPREIT', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 28, applicationId: 'APP-004209', agencyName: 'Mahaveer Prasad Sharma', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 29, applicationId: 'APP-004430', agencyName: 'Nodal Society of Human Resources & Development', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 30, applicationId: 'APP-004392', agencyName: 'Public Rose Shiksha Samiti', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 31, applicationId: 'APP-004279', agencyName: 'Radha Krishna Critical Care and General Hospital', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 32, applicationId: 'APP-004208', agencyName: 'Rajshri Skill Council Sanstha', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 33, applicationId: 'APP-004504', agencyName: 'RIT Education & Welfare Socitey', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 34, applicationId: 'APP-004133', agencyName: 'Saint Conard Shiksha Samiti', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 35, applicationId: 'APP-004335', agencyName: 'Samarpan Samajik Sewa Samiti', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 36, applicationId: 'APP-004119', agencyName: 'SD Memorial Public Shikshan Samiti', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 37, applicationId: 'APP-004716', agencyName: 'Shiv Shakti Graameen Vikaas Samiti', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 38, applicationId: 'APP-004397', agencyName: 'Shree Balaji Enterprises', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 39, applicationId: 'APP-004732', agencyName: 'Shree Rajput Sabha', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 40, applicationId: 'APP-004414', agencyName: 'Shri Educational Society', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 41, applicationId: 'APP-004124', agencyName: 'Shri Krishan Vidhyalaya Prabandhak Samiti', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 42, applicationId: 'APP-004373', agencyName: 'Shri Lal Sharma Seva Avem Vikas Sansthan', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 43, applicationId: 'APP-004167', agencyName: 'Shri Naryan Shiksan Evam Anusandan Samiti', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 44, applicationId: 'APP-003797', agencyName: 'SKILLS ASSOCIATES', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 45, applicationId: 'APP-004772', agencyName: 'Society For Human Transformation And Research (SHTR)', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 46, applicationId: 'APP-003861', agencyName: 'Suman Shiksha Samiti Ekta', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 47, applicationId: 'APP-004740', agencyName: 'The Dream Welfare Society', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 48, applicationId: 'APP-004429', agencyName: 'Vatika Shikshan Sansthan', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 49, applicationId: 'APP-004571', agencyName: 'Vivek Shiksha Samiti', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' }
    ]
  },

  // Page 3: Entries 50 to 76 (27 items)
  {
    pageNumber: 3,
    entries: [
      { sNo: 50, applicationId: 'APP-004673', agencyName: 'ZSS', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 51, applicationId: 'APP-003862', agencyName: 'Aravali Shikshan Avum Anusandhan Sansthan', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 52, applicationId: 'APP-004547', agencyName: 'Asok Enterprises', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 53, applicationId: 'APP-003752', agencyName: 'Balaji Computer Educational Center', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 54, applicationId: 'APP-004683', agencyName: 'Bhartiya Mahila Kalyan Evam Bal Vikas Shodh Sansthan', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 55, applicationId: 'APP-004471', agencyName: 'Divyalok Seva Sansthan', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 56, applicationId: 'APP-003714', agencyName: 'Ganga Shikhsa Samiti', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 57, applicationId: 'APP-004602', agencyName: 'JS Education And Research Samiti', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 58, applicationId: 'APP-004343', agencyName: 'Maa Jwalamukhi Medicine LLP', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 59, applicationId: 'APP-004761', agencyName: 'Magan Foundation', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 60, applicationId: 'APP-003994', agencyName: 'Mahila Uddyopg Parikshan Samiti', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 61, applicationId: 'APP-003684', agencyName: 'MANDA INSTITUTE OF TECHNOLOGY', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 62, applicationId: 'APP-004774', agencyName: 'Meri Pahal Sanstha Rajasthan', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 63, applicationId: 'APP-004226', agencyName: 'Moreways Bizcom Private Limited', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 64, applicationId: 'APP-004266', agencyName: 'Politechno Support Services Private Limited', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 65, applicationId: 'APP-003922', agencyName: 'Pooja Shiksha Samiti', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 66, applicationId: 'APP-003833', agencyName: 'RAJEEV AOUDHOGIYC PRASHICHAN EVAM SODH SANSTHAN', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 67, applicationId: 'APP-004165', agencyName: 'Rostriya Jankalyan Infoirmation Technology Society', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 68, applicationId: 'APP-004381', agencyName: 'Saraswati Computer Education', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 69, applicationId: 'APP-004297', agencyName: 'Sewa Sankalp Sansthan', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 70, applicationId: 'APP-003735', agencyName: 'Shastri Shikshan Samiti', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 71, applicationId: 'APP-004679', agencyName: 'Tapanukula Private Limited', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 72, applicationId: 'APP-004584', agencyName: 'Vibra Consultants LLP', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 73, applicationId: 'APP-004120', agencyName: 'Vidhya Sagar Vikas Sewa Samiti', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 74, applicationId: 'APP-004254', agencyName: 'VIJ Corporate Solution', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 75, applicationId: 'APP-003927', agencyName: 'Shree Computer', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 76, applicationId: 'APP-004759', agencyName: 'Shreeji textile Pvt. Ltd', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' }
    ]
  },

  // Page 4: Entries 77 to 78 (2 items)
  {
    pageNumber: 4,
    entries: [
      { sNo: 77, applicationId: 'APP-004527', agencyName: 'Geeta Devi Kaushal Prshikshan Kendra', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' },
      { sNo: 78, applicationId: 'APP-004750', agencyName: 'Rajasthan Technical Prashikshan Sansthan', fileStatus: 'Not Eligible', reason: 'Not Eligible as per criteria laid down in EOI' }
    ]
  }
];

export const ALL_78_REJECTED_AGENCIES: RejectedAgencyItem[] = REJECTION_78_PAGES.flatMap(p => p.entries);
