import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { Family } from '../app/families/family';
import { Time } from '../app/families/time';
import { School } from '../app/grade_list/school';
import { FamilyService } from 'src/app/families/family.service';

/**
 * A "mock" version of the `FamilyService` that can be used to test components
 * without having to create an actual service. It needs to be `Injectable` since
 * that's how services are typically provided to components.
 */
@Injectable({
  providedIn: AppComponent
})

//'modifyMass'
export class MockFamilyService implements Pick<FamilyService, 'getFamilies' | 'getFamilyById' | 'filterFamilies' | 'addFamily' | 'deleteFamily'| 'updateSavedSearch'|'getSchools' | 'deleteAll'|'getGradeLabel'|'familyCount' | 'getTimes' > {
  savedFamilyName = ''; //Per-session saved value for name search bar.
  savedFamilySchool = '';
  savedFamilyGrade = '';
  savedFamilyStudents = 0;
  savedFamilyTime = '';
  savedFamilySortBy = ''; //Per-session saved value for sort-order search bar.

  static testSchools: School[] = [
    {
      "_id": "maes_id",
      "value": "Morris Area Elementary School",
      "label":"MAES"
    },
    {
      "_id": "hancock_id",
      "value": "Hancock Elementary",
      "label":"Hancock"
    },
    {
      "_id": "saint_mary's_id",
      "value": "Saint Mary's Elementary",
      "label":"Saint Mary's"
    }
  ];

  static testTimes: Time[] = [
    {
      "_id": "9_id",
      "value": "9:00am",
    },
    {
      "_id": "12_id",
      "value": "12:00pm",
    },
    {
      "_id": "2_id",
      "value": "2:00pm",
    }
  ];

  static testItems: Family[] = [
    {
      "_id": "richards_id",
      "first_name": "Steve",
      "last_name":"Richards",
      "first_name_alt":"",
      "last_name_alt":"",
      "time":"12:00pm",
      "email":"prcrichards@gmail.com",
      "phone":"320-287-1867",
      "students":[
        {
          "first_name":"Ted",
          "last_name":"Richards",
          "grade":"P",
          "teacher":"Mrs.Greene",
          "school":"MAES",
          "backpack":true,
          "headphones":false
        },
        {
          "first_name":"Tod",
          "last_name":"Richards",
          "grade":"3",
          "teacher":"Mrs.Ulrich",
          "school":"MAES",
          "backpack":false,
          "headphones":true
        }
      ]
    },
    {
      "_id": "krosschell_id",
      "first_name": "Frank",
      "last_name":"Krosschell",
      "first_name_alt":"",
      "last_name_alt":"",
      "time":"9:00pm",
      "email":"gkross@gmail.com",
      "phone":"320-287-1867",
      "students":[
        {
          "first_name":"Bob",
          "last_name":"Krosschell",
          "grade":"1",
          "teacher":"Mr.Greene",
          "school":"MAES",
          "backpack":true,
          "headphones":false
        },
        {
          "first_name":"Kevin",
          "last_name":"Krosschell",
          "grade":"3",
          "teacher":"Mrs.Ulrich",
          "school":"MAES",
          "backpack":true,
          "headphones":true
        },
        {
          "first_name":"Kyle",
          "last_name":"Krosschell",
          "grade":"3",
          "teacher":"Mrs.Ulrich",
          "school":"MAES",
          "backpack":true,
          "headphones":true
        },
        {
          "first_name":"Mitchel",
          "last_name":"Krosschell",
          "grade":"7",
          "teacher":"Mr.Cannon",
          "school":"Hancock",
          "backpack":true,
          "headphones":true
        }
      ]
    },
    {
      "_id": "tucker_id",
      "first_name": "Nadine",
      "last_name":"Tucker",
      "first_name_alt":"Judith",
      "last_name_alt":"Mahoney",
      "time":"7:00pm",
      "email":"ntucker@gmail.com",
      "phone":"320-287-1867",
      "students":[
        {
          "first_name":"Thomas",
          "last_name":"Tucker",
          "grade":"K",
          "teacher":"Mr.Greene",
          "school":"MAES",
          "backpack":true,
          "headphones":false
        },
        {
          "first_name":"Omer",
          "last_name":"Tucker",
          "grade":"3",
          "teacher":"Mrs.Ulrich",
          "school":"MAES",
          "backpack":true,
          "headphones":true
        },
        {
          "first_name":"Larry",
          "last_name":"Mahoney",
          "grade":"7",
          "teacher":"Mr.Cannon",
          "school":"Hancock",
          "backpack":true,
          "headphones":true
        }
      ]
    }
  ];

  static emptyFamily: Family = {
    _id: '',
    first_name: '',
    last_name: '',
    first_name_alt: "",
    last_name_alt: "",
    email: "",
    time: '',
    students: [],
  }

  gradeOptions = [
    { value: 'P', label: 'Pre-School', spanish: 'Preescolar' },
    { value: 'K', label: 'Kindergarten', spanish: 'Kindergarten' },
    { value: '1', label: '1st Grade', spanish: 'Primer Grado' },
    { value: '2', label: '2nd Grade', spanish: 'Segundo Grado' },
    { value: '3', label: '3rd Grade', spanish: 'Tercer Grado' },
    { value: '4', label: '4th Grade', spanish: 'Cuarto Grado' },
    { value: '5', label: '5th Grade', spanish: 'Quinto Grado' },
    { value: '6', label: '6th Grade', spanish: 'Sexto Grado' },
    { value: '7', label: '7th Grade', spanish: 'Séptimo Grado' },
    { value: '8', label: '8th Grade', spanish: 'Octavo Grado' },
    { value: '9', label: '9th Grade', spanish: 'Noveno Grado' },
    { value: '10', label: '10th Grade', spanish: 'Décimo Grado' },
    { value: '11', label: '11th Grade', spanish: 'Undécimo Grado' },
    { value: '12', label: '12th Grade', spanish: 'Duodécimo Grado' },
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
      && (!school) || (family.students[s].school == school)) {
        count ++;
      }
    }
    return count;
  }

  //For testing purposes, this is identical to the actual service. (Otherwise linting is mad about not using fields.)
  updateSavedSearch(fields: {name: string; grade: string; school: string; students: number; time: string; sortby: string;}) {
    //Formerly checked if fields were provided; now required.
    //Defaults to empty strings and zeros.
    this.savedFamilyName = fields.name;
    this.savedFamilyGrade = fields.grade;
    this.savedFamilySchool = fields.school;
    this.savedFamilyStudents = fields.students;
    this.savedFamilyTime = fields.time;
    this.savedFamilySortBy = fields.sortby;
  }

  // skipcq: JS-0105
  // It's OK that the `_filters` argument isn't used here, so we'll disable
  // this warning for just his function.
  /* eslint-disable @typescript-eslint/no-unused-vars */
  getFamilies(_filters: { name?: string; stocked?: number; desc?: string; location?: string; type?: string;}): Observable<Family[]> {
    return of(MockFamilyService.testItems);
  }

  getSchools(): Observable<School[]> {
    return of(MockFamilyService.testSchools);
  }

  getTimes(): Observable<Time[]> {
    return of(MockFamilyService.testTimes);
  }

  //Probably unessesary
  // skipcq: JS-0105
  getFamilyById(id: string): Observable<Family> {
    // If the specified ID is for one of the first two test users,
    // return that user, otherwise return `null` so
    // we can test illegal user requests.
    // If you need more, just add those in too.
    if (id === MockFamilyService.testItems[0]._id) {
      return of(MockFamilyService.testItems[0]);
    } else if (id === MockFamilyService.testItems[1]._id) {
      return of(MockFamilyService.testItems[1]);
    } else {
      return of(null);
    }
  }

  //Todo
  addFamily(item: Partial<Family>): Observable<string> {
    // Send post request to add a new item with the item data as the body.
    // `res.id` should be the MongoDB ID of the newly added `Item`.
    return of('');
  }

  deleteFamily(id: string): Observable<Family> {
    // Send post request to add a new item with the item data as the body.
    // `res.id` should be the MongoDB ID of the newly added `Item`.
    return of(MockFamilyService.emptyFamily);
  }

  deleteAll(oldItems:Family[]) {
    //Same as inventory items. Not sure when we'd ever need to use this, but it's here.
    for (let i = 0; i < oldItems.length; i ++) {
      this.deleteFamily(oldItems[i]._id).subscribe();
    }
  }

  // modifyMass(newProps:Family,oldItems:Family[]) {
  //   //Doesn't return anything; just modifies database.
  // }

  filterFamilies(items: Family[], filters: {
    name?: string;
    grade?: string;
    desc?: string;
    location?: string;
    type?: string;
  }): Family[] {
    return MockFamilyService.testItems;
  }
}
