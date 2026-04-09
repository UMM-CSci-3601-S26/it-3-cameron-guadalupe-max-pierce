import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { Family } from '../app/families/family';
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
export class MockFamilyService implements Pick<FamilyService, 'getFamilies' | 'filterFamilies' | 'addFamily' | 'deleteFamily'| 'updateSavedSearch'|'getSchools' | 'deleteAll'> {
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

  static testItems: Family[] = [
    {
      "_id": "richards_id",
      "name": "Richards",
      "time":"12:00pm",
      "students":[
        {
          "grade": "P",
          "school": "MAES",
          "backpack": true,
          firstName: '',
          lastName: ''
        },
        {
          "grade": "3",
          "school": "MAES",
          "backpack": false,
          firstName: '',
          lastName: ''
        }
      ]
    },
    {
      "_id": "jones_id",
      "name": "Smith",
      "time":"1:00pm",
      "students":[
        {
          "grade": "2",
          "school": "Hancock",
          "backpack": false,
          firstName: '',
          lastName: ''
        }
      ]
    },
    {
      "_id": "baudelaires_id",
      "name": "Baudelaires",
      "time":"9:00am",
      "students":[
        {
          "grade": "P",
          "school": "MAES",
          "backpack": false,
          firstName: '',
          lastName: ''
        },
        {
          "grade": "6",
          "school": "MAES",
          "backpack": true,
          firstName: '',
          lastName: ''
        },
        {
          "grade": "10",
          "school": "MAES",
          "backpack": false,
          firstName: '',
          lastName: ''
        }
      ]
    }
  ];

  static emptyFamily: Family = {
    _id: '',
    name: '',
    time: '',
    students: [],
  }

  //Probably terrible form, but best way I could figure to get the tests working.
  realService = new FamilyService;
  gradeOptions = this.realService.gradeOptions;

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
