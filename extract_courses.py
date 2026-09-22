import pandas as pd
import json
import os

os.makedirs('src/app/core/constants', exist_ok=True)
df = pd.read_excel('MMKVY_RAJKViK_MNSKSY_Course_Master_Import.xlsx')
courses = sorted([str(x).strip() for x in df['qp_job_role_name'].dropna().unique() if str(x).strip()])

with open('src/app/core/constants/mmkvy-courses.ts', 'w', encoding='utf-8') as f:
    f.write('export const MMKVY_COURSES: string[] = ' + json.dumps(courses, indent=2) + ';\n')
