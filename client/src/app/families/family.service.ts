import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Family } from './family';
import { School } from '../grade_list/school';
//import { Company } from '../company-list/company';
//import { Signal } from '@angular/core/rxjs-interop';

/**
 * Service that provides the interface for getting information
 * about `Users` from the server.
 */
@Injectable({
  providedIn: 'root'
})
export class FamilyService {
  // The private `HttpClient` is *injected* into the service
  // by the Angular framework. This allows the system to create
  // only one `HttpClient` and share that across all services
  // that need it, and it allows us to inject a mock version
  // of `HttpClient` in the unit tests so they don't have to
  // make "real" HTTP calls to a server that might not exist or
  // might not be currently running.
  private httpClient = inject(HttpClient);

  // The URL for the users part of the server API.
  readonly familyUrl: string = `${environment.apiUrl}families`;
  readonly schoolUrl: string = `${environment.apiUrl}schools`;
  //readonly usersByCompanyUrl: string = `${environment.apiUrl}usersByCompany`;

  private readonly schoolKey = 'school'; //school filtering
  private readonly gradeKey = 'grade'; //grade filtering
  private readonly nameKey = 'name'; //name filtering
  private readonly timeKey = 'time'; //time filtering
  private readonly studentKey = 'students'; //minimum students

  // private readonly nameKey = 'name';
  // private readonly locationKey = 'location';
  // private readonly typeKey = 'type';
  // private readonly descKey = 'desc';
  // private readonly stockedKey = 'stocked';

  savedFamilyName = ''; //Per-session saved value for name search bar.
  savedFamilySchool = '';
  savedFamilyGrade = '';
  savedFamilyStudents = 0;
  savedFamilyTime = '';
  savedFamilySortBy = 'grade_school'; //Per-session saved value for sort-order search bar. Defaults to grade and school

  gradeOptions = [
    { value: 'P', label: 'Pre-School' },
    { value: 'K', label: 'Kindergarten' },
    { value: '1', label: '1st Grade' },
    { value: '2', label: '2nd Grade' },
    { value: '3', label: '3rd Grade' },
    { value: '4', label: '4th Grade' },
    { value: '5', label: '5th Grade' },
    { value: '6', label: '6th Grade' },
    { value: '7', label: '7th Grade' },
    { value: '8', label: '8th Grade' },
    { value: '9', label: '9th Grade' },
    { value: '10', label: '10th Grade' },
    { value: '11', label: '11th Grade' },
    { value: '12', label: '12th Grade' }
  ];

  /**
   * @param fields a map that specifies which search terms to save
  */
  updateSavedSearch(fields: {name: string; grade: string; school: string; students: number; time: string; sortby: string;}) {
    //Formerly checked if fields were provided; now required.
    //Defaults to empty strings and zeros.
    this.savedFamilyName = fields.name;
    this.savedFamilySchool = fields.school;
    this.savedFamilyGrade = fields.grade;
    this.savedFamilyTime = fields.time;
    this.savedFamilyStudents = fields.students;
    this.savedFamilySortBy = fields.sortby;
  }

  /**
   * Get all the items from the server, filtered by the information
   * in the `filters` map.
   *
   *
   * @param filters a map that allows us to specify a target role, age,
   *  or company to filter by, or any combination of those
   * @returns an `Observable` of an array of `InventoryItems`. Wrapping the array
   *  in an `Observable` means that other bits of of code can `subscribe` to
   *  the result (the `Observable`) and get the results that come back
   *  from the server after a possibly substantial delay (because we're
   *  contacting a remote server over the Internet).
   */
  getFamilies(filters?: { name?: string; grade?: string; school?: string; students?: number; time?: string; }): Observable<Family[]> {
    // `HttpParams` is essentially just a map used to hold key-value
    // pairs that are then encoded as "?key1=value1&key2=value2&…" in
    // the URL when we make the call to `.get()` below.
    let httpParams: HttpParams = new HttpParams();
    if (filters) {
      if (filters.name) {
        httpParams = httpParams.set(this.nameKey, filters.name);
      }
      if (filters.grade) {
        httpParams = httpParams.set(this.gradeKey, filters.grade);
      }
      if (filters.school) {
        httpParams = httpParams.set(this.schoolKey, filters.school);
      }
      if (filters.students) {
        httpParams = httpParams.set(this.studentKey, filters.students);
      }
      if (filters.time) {
        httpParams = httpParams.set(this.timeKey, filters.time);
      }
    }
    // Send the HTTP GET request with the given URL and parameters.
    // That will return the desired `Observable<InventoryItem[]>`.
    return this.httpClient.get<Family[]>(this.familyUrl, {
      params: httpParams,
    });
  }

  //Helper function
  getSchools(): Observable<School[]> {
    return this.httpClient.get<School[]>(this.schoolUrl);
  }

  /**
   * Get the `Family` with the specified ID.
   *
   * @param id the ID of the desired user
   * @returns an `Observable` containing the resulting user.
   */
  getFamilyById(id: string): Observable<Family> {
    // The input to get could also be written as (this.userUrl + '/' + id)
    return this.httpClient.get<Family>(`${this.familyUrl}/${id}`);
  }

  /**
   * A service method that filters an array of `Families` using
   * the specified filters.
   *
   * Note that the filters here support partial matches. Since the
   * matching is done locally we can afford to repeatedly look for
   * partial matches instead of waiting until we have a full string
   * to match against.
   *
   * @param families the array of `InventoryItems` that we're filtering
   * @param filters the map of key-value pairs used for the filtering
   * @returns an array of `Users` matching the given filters
   */
  filterFamilies(families: Family[], filters: { name?: string; grade?: string; school?: string; students?: number; time?: string; sortBy?: string;}): Family[] { // skipcq: JS-0105
    let filteredFamilies = families; //.getValue();
    // let filteredFamilies: InventoryItem[] = [];

    //TODO, write sorting logic here!
    // Filter by name
    if (filters.name) {
      filters.name = filters.name.toLowerCase();
      filteredFamilies = filteredFamilies.filter(item => item.name.toLowerCase().indexOf(filters.name) !== -1);
    }

    if (filters.grade) {
      //Inclusive- if a family has any students in this grade, they show up in the filter.
      filteredFamilies = filteredFamilies.filter(item => item.students.some(student => student.grade == filters.grade));
    }

    if (filters.school) {
      filteredFamilies = filteredFamilies.filter(item => item.students.some(student => student.school == filters.school));
    }

    if (filters.students) {
      filteredFamilies = filteredFamilies.filter(item => item.students.length >= filters.students);
    }

    if (filters.time) {
      filters.time = filters.time.toLowerCase();
      filteredFamilies = filteredFamilies.filter(item => item.time.toLowerCase().indexOf(filters.time) !== -1);
    }

    switch (filters.sortBy) {
    case "students":
      filteredFamilies = filteredFamilies.sort((i1,i2) => {
        return i1.students.length - i2.students.length;
      });
      break;
    case "students_des":
      filteredFamilies = filteredFamilies.sort((i1,i2) => {
        return i2.students.length - i1.students.length;
      });
      break;
    case "name":
      filteredFamilies = filteredFamilies.sort((i1,i2) => {
        return i1.name.localeCompare(i2.name);
      });
      break;
    case "name_des":
      filteredFamilies = filteredFamilies.sort((i1,i2) => {
        return i2.name.localeCompare(i1.name);
      });
      break;
    case "time":
      filteredFamilies = filteredFamilies.sort((i1,i2) => {
        return i1.time.localeCompare(i2.time);
      });
      break;
    case "time_des":
      filteredFamilies = filteredFamilies.sort((i1,i2) => {
        return i2.time.localeCompare(i1.time);
      });
      break;
    }

    return filteredFamilies;
  }

  addFamily(newItem: Partial<Family>): Observable<string> {
    // Send post request to add a new item with the item data as the body.
    // `res.id` should be the MongoDB ID of the newly added `Item`.
    return this.httpClient.post<{id: string}>(this.familyUrl, newItem).pipe(map(response => response.id));
  }

  deleteFamily(id: string): Observable<Family> {
    return this.httpClient.delete<Family>(`${this.familyUrl}/${id}`);
  }

  reloadPage() { //Not really a good way to test this.
    setTimeout(() => {
      window.location.reload();
      //Why on Earth does it need such a long delay to handle this???
    }, 2000);
  }

  deleteAll(oldItems:Family[]) {
    //Same as inventory items. Not sure when we'd ever need to use this, but it's here.
    if (oldItems.length > 0) {
      for (let i = 0; i < oldItems.length; i ++) {
        this.deleteFamily(oldItems[i]._id).subscribe();
      }
    }
  }
}
