const xlsx = require('xlsx'); 
const wb = xlsx.readFile('C:/Users/DELL/Desktop/isms/ISMS2.0/MMKVY_RAJKViK_MNSKSY_Course_Master_Import.xlsx'); 
const sheet = wb.Sheets['course_master_import']; 
const data = xlsx.utils.sheet_to_json(sheet); 
require('fs').writeFileSync('src/app/core/services/mock-courses.json', JSON.stringify(data, null, 2));
