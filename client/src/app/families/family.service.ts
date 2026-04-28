import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Family } from './family';
import { Student } from './student';
import { Time } from './time';
import { School } from '../grade_list/school';
import { RequiredItem } from '../grade_list/required_item';
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
  private httpClient = inject(HttpClient);

  // The URL for the users part of the server API.
  readonly familyUrl: string = `${environment.apiUrl}families`;
  readonly schoolUrl: string = `${environment.apiUrl}schools`;
  readonly timeUrl: string = `${environment.apiUrl}times`;
  readonly gradeListUrl: string = `${environment.apiUrl}student_reqs`;
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
  savedFamilySortBy = 'name'; //Per-session saved value for sort-order search bar. Defaults to grade and school

  gradeOptions = [
    { value: 'P', label: 'Pre-School', spanish:'Preescolar'},
    { value: 'K', label: 'Kindergarten', spanish:'Kindergarten' },
    { value: '1', label: '1st Grade', spanish:'Primer Grado'},
    { value: '2', label: '2nd Grade', spanish:'Segundo Grado' },
    { value: '3', label: '3rd Grade', spanish:'Tercer Grado' },
    { value: '4', label: '4th Grade', spanish:'Cuarto Grado' },
    { value: '5', label: '5th Grade', spanish:'Quinto Grado' },
    { value: '6', label: '6th Grade', spanish:'Sexto Grado' },
    { value: '7', label: '7th Grade', spanish:'Séptimo Grado' },
    { value: '8', label: '8th Grade', spanish:'Octavo Grado' },
    { value: '9', label: '9th Grade', spanish:'Noveno Grado' },
    { value: '10', label: '10th Grade', spanish:'Décimo Grado' },
    { value: '11', label: '11th Grade', spanish:'Undécimo Grado' },
    { value: '12', label: '12th Grade', spanish:'Duodécimo Grado' }
  ];

  //Helper function for display
  getGradeLabel(grade: string) {
    for (let g = 0; g < this.gradeOptions.length; g ++) {
      if (this.gradeOptions[g].value == grade) {
        return this.gradeOptions[g].label;
      }
    }
  }

  //Another helper function for display
  familyCount(family:Family, grade?: string, school?: string): number {
    let count = 0;
    for (let s = 0; s < family.students.length; s ++) {
      if (((!grade) || (family.students[s].grade == grade))
      && ((!school) || (family.students[s].school == school))) {
        count ++;
      }
    }
    return count;
  }

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

  //Annoyingly necessary for per-student reqs.
  // Cannot simply attatch a grade_list service because grade_list also needs to import family service to fetch schools and grade labels.
  //...Though really, there's now no need for grade_list service to have its own getItems method.
  //This has been simplified since we just need a student's school and grade.
  getItems(): Observable<RequiredItem[]> {
    // let httpParams: HttpParams = new HttpParams();
    // httpParams = httpParams.set(this.gradeKey, student.grade);
    // httpParams = httpParams.set(this.schoolKey, student.school);
    // Send the HTTP GET request with the given URL and parameters.
    // That will return the desired `Observable<InventoryItem[]>`.
    return this.httpClient.get<RequiredItem[]>(this.gradeListUrl, {});
  }

  //See above.
  filterItems(items: RequiredItem[], student:Student): RequiredItem[] { // skipcq: JS-0105
    let filteredItems = items;

    filteredItems = filteredItems.filter(item => item.grade.toLowerCase().indexOf(student.grade.toLowerCase()) !== -1);
    filteredItems = filteredItems.filter(item => item.school.toLowerCase().indexOf(student.school.toLowerCase()) !== -1);

    return filteredItems;
  }

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

  serverFilteredSchools = signal(
    this.getSchools().pipe()
  );

  //Helper function
  getTimes(): Observable<Time[]> {
    return this.httpClient.get<Time[]>(this.timeUrl);
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
      filteredFamilies = filteredFamilies.filter(item => item.last_name.toLowerCase().indexOf(filters.name) !== -1);
    }

    if ((filters.grade) && (!filters.school)) {
      filteredFamilies = filteredFamilies.filter(item => item.students.some(student => student.grade == filters.grade));
    }

    if ((filters.school) && (!filters.grade)) {
      filteredFamilies = filteredFamilies.filter(item => item.students.some(student => student.school == filters.school));
    }

    if ((filters.school) && (filters.grade)) {
      //Necessary to do this seperate, since families can have students at different schools.
      //...In the test data, Koopa Clan has a 2nd grader who goes to MAES, and 10th graders at Saint Mary's...
      //With the independent filters, they pass the grade filter, (10th), and the school filter, (the 2nd graders count),
      //And so show up for MAES 10th grade, even though all their 10th graders go to Saint Marys.
      //...This appears to resolve that issue.
      filteredFamilies = filteredFamilies.filter(item => item.students.some(student =>
        (student.grade == filters.grade)
        && (student.school == filters.school))
      );
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
        return i1.last_name.localeCompare(i2.last_name);
      });
      break;
    case "name_des":
      filteredFamilies = filteredFamilies.sort((i1,i2) => {
        return i2.last_name.localeCompare(i1.last_name);
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
