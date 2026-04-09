import { HttpClient, HttpParams, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { Family } from './family';
import { FamilyService } from './family.service';
//import { Company } from '../company-list/company';

describe('FamilyService', () => {
  // A small collection of test users
  const testFamilies: Family[] = [
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
      "_id": "smith_id",
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

  let familyService: FamilyService;
  // These are used to mock the HTTP requests so that we (a) don't have to
  // have the server running and (b) we can check exactly which HTTP
  // requests were made to ensure that we're making the correct requests.
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    // Set up the mock handling of the HTTP requests
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    // Construct an instance of the service with the mock
    // HTTP client.
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    familyService = TestBed.inject(FamilyService);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  describe('Updates saved search terms correctly', () => {
    //Simple as that. On E2E testing, should make sure this actually persists between pages.
    it('correctly initializes and updates saved search terms.', () => {
      //Begins with correct values.
      expect(familyService.savedFamilyName).toEqual('');
      expect(familyService.savedFamilyGrade).toEqual('');
      expect(familyService.savedFamilySchool).toEqual('');
      expect(familyService.savedFamilyStudents).toEqual(0);
      expect(familyService.savedFamilyTime).toEqual('');
      expect(familyService.savedFamilySortBy).toEqual('grade_school');
      //We test elsewhere that the list actually calls this correctly.
      familyService.updateSavedSearch({
        name:'Test',
        grade:'K',
        school:'MAES',
        students:1,
        time:'2:00am',
        sortby:'name'
      });
      expect(familyService.savedFamilyName).toEqual('Test');
      expect(familyService.savedFamilyGrade).toEqual('K');
      expect(familyService.savedFamilySchool).toEqual('MAES');
      expect(familyService.savedFamilyStudents).toEqual(1);
      expect(familyService.savedFamilyTime).toEqual('2:00am');
      expect(familyService.savedFamilySortBy).toEqual('name');
    });
  });

  describe('When getFamilies() is called with no parameters', () => {
    it('calls `api/families`', waitForAsync(() => {
      // Mock the `httpClient.get()` method, so that instead of making an HTTP request,
      // it just returns our test data.
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testFamilies));

      familyService.getFamilies().subscribe(() => {
        // The mocked method (`httpClient.get()`) should have been called
        // exactly one time.
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(familyService.familyUrl, { params: new HttpParams() });
      });
    }));
  });

  describe('When getSchools() is called', () => {
    it('calls `api/families`', waitForAsync(() => {
      // Mock the `httpClient.get()` method, so that instead of making an HTTP request,
      // it just returns our test data.
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(undefined));

      familyService.getSchools().subscribe(() => {
        // The mocked method (`httpClient.get()`) should have been called
        // exactly one time.
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(familyService.schoolUrl);
      });
    }));
  });

  describe('When getFamilies() is called with parameters, it correctly forms the HTTP request (Javalin/Server filtering)', () => {
    it('correctly calls api/users with filter parameter \'Test\'', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testFamilies));

      familyService.getFamilies({ name: 'Test' }).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(familyService.familyUrl, { params: new HttpParams().set('name', 'Test') });
      });
    });

    it('correctly calls api/families with filter parameter \'students\'', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testFamilies));

      familyService.getFamilies({ students: 25 }).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(familyService.familyUrl, { params: new HttpParams().set('students', 25) });
      });
    });

    it('correctly calls api/families with multiple filter parameters', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testFamilies));

      familyService.getFamilies({ name: 'Test', grade: 'K', school: 'MAES', students: 2, time: '1:00am'}).subscribe(() => {
        const [url, options] = mockedMethod.calls.argsFor(0);
        const calledHttpParams: HttpParams = (options.params) as HttpParams;
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(url)
          .withContext('talks to the correct endpoint')
          .toEqual(familyService.familyUrl);
        expect(calledHttpParams.keys().length)
          .withContext('should have 5 params')
          .toEqual(5);
        expect(calledHttpParams.get('name'))
          .withContext('name of item')
          .toEqual('Test');
        expect(calledHttpParams.get('grade'))
          .withContext('grade K')
          .toEqual('K');
        expect(calledHttpParams.get('school'))
          .withContext('school MAES')
          .toEqual('MAES');
        expect(calledHttpParams.get('students'))
          .withContext('students equals 2')
          .toEqual('2');
        expect(calledHttpParams.get('time'))
          .withContext('time of 1:00am')
          .toEqual('1:00am');
      });
    });
  });

  describe('When getFamilyById() is given an ID', () => {
    it('calls api/families/id with the correct ID', waitForAsync(() => {
      // We're just picking a Item "at random" from our little
      // set of Items up at the top.
      const targetUser: Family = testFamilies[1];
      const targetId: string = targetUser._id;

      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(targetUser));

      familyService.getFamilyById(targetId).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(`${familyService.familyUrl}/${targetId}`);
      });
    }));
  });

  describe('Filtering on the client using `filterFamilies()` (Angular/Client filtering)', () => {
    it('filters by name', () => {
      const itemName = 'a';
      const filteredItems = familyService.filterFamilies(testFamilies, { name: itemName });
      // There should be two families with an 'a' in their
      // name: richards, baudelaires
      expect(filteredItems.length).toBe(2);
      // Every returned user's name should contain an 'a'.
      filteredItems.forEach(item => {
        expect(item.name.indexOf(itemName)).toBeGreaterThanOrEqual(0);
      });
    });

    it('filters by grade', () => {
      const gradeName = 'P';
      const filteredItems = familyService.filterFamilies(testFamilies, { grade: gradeName });
      // There should be two families with preschoolers
      expect(filteredItems.length).toBe(2);
    });

    it('filters by school', () => {
      const schoolName = 'MAES';
      const filteredItems = familyService.filterFamilies(testFamilies, { school: schoolName });
      //2 Families have students at MAES
      expect(filteredItems.length).toBe(2);
    });

    it('filters by time', () => {
      const itemTime = '12:00pm';
      const filteredItems = familyService.filterFamilies(testFamilies, { time: itemTime });
      // Only the baudelaires
      expect(filteredItems.length).toBe(1);
      // Every returned item's name should have the correct time.
      filteredItems.forEach(item => {
        expect(item.time.indexOf(itemTime)).toBeGreaterThanOrEqual(0);
      });
    });

    it('filters by students', () => {
      const itemStudents = 2;
      const filteredItems = familyService.filterFamilies(testFamilies, { students: itemStudents });
      // Two of the provided items have at least 2 students.
      expect(filteredItems.length).toBe(2);
      // Every returned item's stock should be >= 2
      filteredItems.forEach(item => {
        expect(item.students.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('filters by time and students', () => {
      const itemTime = '9:00am';
      const itemStudents = 3;
      const filters = { time: itemTime, students: itemStudents };
      const filteredItems = familyService.filterFamilies(testFamilies, filters);
      // There should be just one family with these properties.
      expect(filteredItems.length).toBe(1);
      // Every returned family should have _both_ these properties.
      filteredItems.forEach(item => {
        expect(item.students.length).toBeGreaterThanOrEqual(3);
        expect(item.time.indexOf(itemTime)).toBeGreaterThanOrEqual(0);
      });
    });
  });

  it('sorts by name', () => {
    const filteredItems = familyService.filterFamilies(testFamilies, {sortBy:"name"});
    // Sorting should not change length.
    expect(filteredItems.length).toBe(3);
    // The first item should be from Tote #2
    expect(filteredItems[0].name).toBe("Baudelaires");
    // The second item should be from Tote #3
    expect(filteredItems[1].name).toBe("Richards");
    // The third item should be from Tote #4
    expect(filteredItems[2].name).toBe("Smith");
  });

  it('sorts by reverse name', () => {
    const filteredItems = familyService.filterFamilies(testFamilies, {sortBy:"name_des"});
    // Sorting should not change length.
    expect(filteredItems.length).toBe(3);
    // The first item should be from Tote #2
    expect(filteredItems[0].name).toBe("Smith");
    // The second item should be from Tote #3
    expect(filteredItems[1].name).toBe("Richards");
    // The third item should be from Tote #4
    expect(filteredItems[2].name).toBe("Baudelaires");
  });

  it('sorts by students', () => {
    const filteredItems = familyService.filterFamilies(testFamilies, {sortBy:"students"});
    // Sorting should not change length.
    expect(filteredItems.length).toBe(3);
    // The first item should have stock 0
    expect(filteredItems[0].students.length).toBe(1);
    // The second item should have 2
    expect(filteredItems[1].students.length).toBe(2);
    // The third item should have 6
    expect(filteredItems[2].students.length).toBe(3);
  });

  it('sorts by reverse students', () => {
    const filteredItems = familyService.filterFamilies(testFamilies, {sortBy:"students_des"});
    // Sorting should not change length.
    expect(filteredItems.length).toBe(3);
    // The first item should have stock 0
    expect(filteredItems[0].students.length).toBe(3);
    // The second item should have 2
    expect(filteredItems[1].students.length).toBe(2);
    // The third item should have 6
    expect(filteredItems[2].students.length).toBe(1);
  });

  it('sorts by time', () => {
    const filteredItems = familyService.filterFamilies(testFamilies, {sortBy:"time"});
    // Sorting should not change length.
    expect(filteredItems.length).toBe(3);
    // Sorts alphabetically, with numbers first.
    expect(filteredItems[0].time).toBe("1:00pm");
    expect(filteredItems[1].time).toBe("12:00pm");
    expect(filteredItems[2].time).toBe("9:00am");
  });

  it('sorts by reverse time', () => {
    const filteredItems = familyService.filterFamilies(testFamilies, {sortBy:"time_des"});
    // Sorting should not change length.
    expect(filteredItems.length).toBe(3);
    // Sorts alphabetically, with numbers first.
    expect(filteredItems[2].time).toBe("1:00pm");
    expect(filteredItems[1].time).toBe("12:00pm");
    expect(filteredItems[0].time).toBe("9:00am");
  });

  describe('When deleteFamily() is called', () => {
    it('talks to correct Endpoint', waitForAsync(() => {
      // Checking whether the item was actually deleted should happen in E2E probably
      const targetItem: Family = testFamilies[1];
      const targetId: string = targetItem._id;

      const mockedMethod = spyOn(httpClient, 'delete').and.returnValue(of(targetItem));

      familyService.deleteFamily(targetId).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(`${familyService.familyUrl}/${targetId}`);
      });
    }));
  });

  describe('When addFamily() is called', () => {
    it('talks to correct Endpoint', waitForAsync(() => {
      // Checking whether the item was actually deleted should happen in E2E probably
      const targetItem: Family = testFamilies[1]; //This will be a duplicate

      const mockedMethod = spyOn(httpClient, 'post').and.returnValue(of(targetItem));

      familyService.addFamily(targetItem).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(`${familyService.familyUrl}`, targetItem );
      });
    }));
  });

  describe('When deleteAll() is called', () => {
    it('talks to correct Endpoints', waitForAsync(() => {
      // Checking whether the item was actually deleted should happen in E2E probably
      const targetItems: Family[] = testFamilies; //This will be a duplicate

      const mockedDelete = spyOn(httpClient, 'delete').and.returnValue(of(targetItems));

      familyService.deleteAll(targetItems);

      expect(mockedDelete)
        .withContext('calls delete')
        .toHaveBeenCalledTimes(3);
    }));
  });

  // describe('When modifyMass() is called', () => {
  //   let copiedItems = [];
  //   let emptyItem: Family = {
  //     _id: undefined,
  //     name: undefined,
  //     time: undefined,
  //     students: undefined
  //   }

  //   beforeEach(() => {
  //     //Create a new array to compare to the actual testFamilies after each modification
  //     copiedItems = [];
  //     for (let i = 0; i < testFamilies.length - 1; i++) {
  //       copiedItems.push(testFamilies[i]);
  //     }
  //     //Reset empty item properties.
  //     emptyItem = {
  //       _id: undefined,
  //       name: undefined,
  //       time: undefined,
  //       students: undefined
  //     }
  //   });

  //   //Accepts a normal array, so thankfully easy to test?
  //   it('talks to correct Endpoints', waitForAsync(() => {
  //     // Checking whether the item was actually deleted should happen in E2E probably
  //     const targetItem: Family = testFamilies[1]; //This will be a duplicate

  //     const mockedAdd = spyOn(httpClient, 'post').and.returnValue(of(targetItem));
  //     const mockedDelete = spyOn(httpClient, 'delete').and.returnValue(of(targetItem));


  //     familyService.modifyMass(emptyItem,copiedItems);

  //     expect(mockedAdd)
  //       .withContext('calls add')
  //       .toHaveBeenCalledTimes(1);

  //     expect(mockedDelete)
  //       .withContext('calls delete')
  //       .toHaveBeenCalledTimes(1);

  //     //Obviously we could do more testing here...
  //     // but it at least gets us to coverage, and it works for now.
  //   }));
  // });
});
