import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Scheme, CourseMaster } from '../models/course.model';
import mockCourses from './mock-courses.json';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private readonly courses: CourseMaster[] = mockCourses as CourseMaster[];
  
  // Official Schemes matching Excel import & Government portal
  private readonly schemes: Scheme[] = [
    { id: 'MMKVY', name: 'MMKVY (Mukhya Mantri Kaushalya Vikas Yojana)', code: 'MMKVY', status: 'ACTIVE' },
    { id: 'SCH_MMKVY', name: 'MMKVY', code: 'MMKVY', status: 'ACTIVE' },
    { id: 'RAJKVIK', name: 'RAJKViK (Category I)', code: 'RAJKVIK', status: 'ACTIVE' },
    { id: 'SCH_RAJKVIK', name: 'RAJKViK', code: 'RAJKVIK', status: 'ACTIVE' },
    { id: 'MNSKSY', name: 'MNSKSY', code: 'MNSKSY', status: 'ACTIVE' },
    { id: 'SCH_MNSKSY', name: 'MNSKSY', code: 'MNSKSY', status: 'ACTIVE' },
    { id: 'SAMARTH', name: 'SAMARTH', code: 'SAMARTH', status: 'ACTIVE' },
    { id: 'ELSTP', name: 'ELSTP', code: 'ELSTP', status: 'ACTIVE' }
  ];

  constructor() {}

  getSchemes(): Observable<Scheme[]> {
    // Unique by name for clean dropdown display
    const uniqueSchemes: Scheme[] = [
      { id: 'MMKVY', name: 'MMKVY (Mukhya Mantri Kaushalya Vikas Yojana)', code: 'MMKVY', status: 'ACTIVE' },
      { id: 'RAJKVIK', name: 'RAJKViK (Category I)', code: 'RAJKVIK', status: 'ACTIVE' },
      { id: 'MNSKSY', name: 'MNSKSY', code: 'MNSKSY', status: 'ACTIVE' },
      { id: 'SAMARTH', name: 'SAMARTH', code: 'SAMARTH', status: 'ACTIVE' },
      { id: 'ELSTP', name: 'ELSTP', code: 'ELSTP', status: 'ACTIVE' }
    ];
    return of(uniqueSchemes);
  }

  getSectorsByScheme(schemeId: string): Observable<string[]> {
    const sectors = new Set<string>();
    this.courses.forEach(c => {
      if (c.sector && c.sector.trim()) {
        sectors.add(c.sector.trim());
      }
    });
    return of(Array.from(sectors).sort());
  }

  getJobRoles(schemeId: string, sector: string): Observable<{name: string, code: string}[]> {
    const rolesMap = new Map<string, {name: string, code: string}>();
    
    this.courses.forEach(c => {
      if (c.sector && c.sector.trim() === sector && c.qp_job_role_code) {
        if (!rolesMap.has(c.qp_job_role_code)) {
          rolesMap.set(c.qp_job_role_code, {
            name: c.qp_job_role_name || c.qp_job_role_code,
            code: c.qp_job_role_code
          });
        }
      }
    });
    
    return of(Array.from(rolesMap.values()).sort((a, b) => a.name.localeCompare(b.name)));
  }

  getCourseVersions(qpCode: string): Observable<CourseMaster[]> {
    const versions = this.courses.filter(c => c.qp_job_role_code === qpCode);
    return of(versions);
  }

  getCourseDetails(courseVersionId: string): Observable<CourseMaster | undefined> {
    const course = this.courses.find(c => c.course_version_id === courseVersionId);
    return of(course);
  }

  isValidForNewBatch(course: CourseMaster): boolean {
    return true; 
  }
}
