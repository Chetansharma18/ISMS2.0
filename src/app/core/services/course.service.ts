import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Scheme, CourseMaster, SchemeCourseMapping } from '../models/course.model';
import mockCourses from './mock-courses.json';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private readonly courses: CourseMaster[] = mockCourses as CourseMaster[];
  
  // Mock Schemes based on the PDF requirement
  private readonly schemes: Scheme[] = [
    { id: 'SCH_MMKVY', name: 'MMKVY', code: 'MMKVY', status: 'ACTIVE' },
    { id: 'SCH_RAJKVIK', name: 'RAJKViK (Category I)', code: 'RAJKVIK', status: 'ACTIVE' },
    { id: 'SCH_MNSKSY', name: 'MNSKSY', code: 'MNSKSY', status: 'ACTIVE' }
  ];

  // In a real DB, we would have a mapping table.
  // Since the PDF states courses are for RAJKViK and MNSKSY combined,
  // we will map all active courses to both for this mock implementation.
  private getMockMappings(): SchemeCourseMapping[] {
    const mappings: SchemeCourseMapping[] = [];
    this.courses.forEach(course => {
      if (course.course_version_id) {
        mappings.push({ scheme_id: 'SCH_RAJKVIK', course_version_id: course.course_version_id, status: 'ACTIVE' });
        mappings.push({ scheme_id: 'SCH_MNSKSY', course_version_id: course.course_version_id, status: 'ACTIVE' });
      }
    });
    return mappings;
  }

  private mappings = this.getMockMappings();

  constructor() {}

  getSchemes(): Observable<Scheme[]> {
    return of(this.schemes).pipe(delay(300));
  }

  getSectorsByScheme(schemeId: string): Observable<string[]> {
    const validCourseIds = this.mappings
      .filter(m => m.scheme_id === schemeId && m.status === 'ACTIVE')
      .map(m => m.course_version_id);

    const sectors = new Set<string>();
    this.courses.forEach(c => {
      if (validCourseIds.includes(c.course_version_id) && c.sector) {
        sectors.add(c.sector);
      }
    });
    return of(Array.from(sectors).sort()).pipe(delay(200));
  }

  getJobRoles(schemeId: string, sector: string): Observable<{name: string, code: string}[]> {
    const validCourseIds = this.mappings
      .filter(m => m.scheme_id === schemeId && m.status === 'ACTIVE')
      .map(m => m.course_version_id);

    const rolesMap = new Map<string, {name: string, code: string}>();
    
    this.courses.forEach(c => {
      if (validCourseIds.includes(c.course_version_id) && c.sector === sector) {
        if (!rolesMap.has(c.qp_job_role_code)) {
          rolesMap.set(c.qp_job_role_code, {
            name: c.qp_job_role_name,
            code: c.qp_job_role_code
          });
        }
      }
    });
    
    return of(Array.from(rolesMap.values()).sort((a, b) => a.name.localeCompare(b.name))).pipe(delay(200));
  }

  getCourseVersions(qpCode: string): Observable<CourseMaster[]> {
    const versions = this.courses.filter(c => c.qp_job_role_code === qpCode);
    return of(versions).pipe(delay(200));
  }

  getCourseDetails(courseVersionId: string): Observable<CourseMaster | undefined> {
    const course = this.courses.find(c => c.course_version_id === courseVersionId);
    return of(course).pipe(delay(200));
  }

  isValidForNewBatch(course: CourseMaster): boolean {
    if (!course) return false;
    
    // Check status text
    const status = (course.source_status || '').toLowerCase();
    if (status.includes('expired') || status.includes('not valid')) {
      return false;
    }

    // Check date (if available) - Simple implementation
    // The PDF provides course_valid_up_to as string (e.g. 18-Feb-28)
    return true; 
  }
}
