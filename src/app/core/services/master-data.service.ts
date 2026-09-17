import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map, tap } from 'rxjs';

export interface Scheme { id: string; name: string; category: string; status: string; }
export interface District { id: string; stateId: string; name: string; }
export interface Sector { id: string; name: string; }
export interface Course { id: string; sectorId: string; name: string; durationHours: number; }

@Injectable({
  providedIn: 'root'
})
export class MasterDataService {
  private dataSubject = new BehaviorSubject<any>(null);
  data$ = this.dataSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadMasterData();
  }

  private loadMasterData() {
    this.http.get('/assets/mock-data/master-data.json').pipe(
      tap(data => this.dataSubject.next(data))
    ).subscribe();
  }

  getSchemes(): Observable<Scheme[]> {
    return this.data$.pipe(map(data => data?.schemes || []));
  }

  getDistricts(): Observable<District[]> {
    return this.data$.pipe(map(data => data?.districts || []));
  }

  getSectors(): Observable<Sector[]> {
    return this.data$.pipe(map(data => data?.sectors || []));
  }

  getCoursesBySector(sectorId: string): Observable<Course[]> {
    return this.data$.pipe(map(data => (data?.courses || []).filter((c: Course) => c.sectorId === sectorId)));
  }
}
