import { HttpClient, HttpParams, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing'; //HttpTestingController
import { TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
// import { Observable } from 'rxjs';
import { RequiredItem } from './required_item';
import { School } from './school';
import { InventoryItem } from '../inventory/inventory_item';
import { GradeListService } from './grade_list.service';
// import { provideRouter } from '@angular/router';
//import { Company } from '../company-list/company';

describe('GradeListService', () => {
  // A small collection of test items
  const testItems: RequiredItem[] = [
    {
      _id: 'pencil_id',
      name: 'Yellow Pencils',
      type: 'pencil',
      grade:'K',
      school:'MAES',
      required: 6,
      desc: 'yellow Ticonderoga pencils',
      pack:1
    },
    {
      _id: 'eraser_id',
      name: '2-inch Eraser',
      type: 'eraser',
      grade:'1',
      school:'MAES',
      required: 2,
      desc: '2-inch rubber eraser',
      pack:1
    },
    {
      _id: '1',
      name: 'Red Plastic Folder',
      type: 'folder',
      grade:'3',
      school:'Hancock',
      required: 1,
      desc: 'standard size red plastic folder.',
      pack:1
    }
  ];

  const testInventory: InventoryItem[] = [
    {
      _id: 'pencil_id',
      name: 'Yellow Pencils',
      type: 'pencil',
      location: 'Tote #3',
      stocked: 6,
      desc: 'yellow Ticonderoga pencils',
      pack:1
    },
    {
      _id: 'eraser_id',
      name: '2-inch Eraser',
      type: 'eraser',
      location: 'Tote #4',
      stocked: 2,
      desc: '2-inch rubber eraser',
      pack:1
    },
    {
      _id: 'folder_id',
      name: 'Red Plastic Folder',
      type: 'folder',
      location: 'Tote #2',
      stocked: 0,
      desc: 'standard size red plastic folder.',
      pack:1
    }
  ];

  const testSchools: School[] = [
    {
      _id:'',
      label:'MAES',
      value:'Morris Area Elementary School'
    },
    {
      _id:'',
      label:'Hancock',
      value:'Hancock Elementary School'
    }
  ];

  let gradeService: GradeListService;
  // These are used to mock the HTTP requests so that we (a) don't have to
  // have the server running and (b) we can check exactly which HTTP
  // requests were made to ensure that we're making the correct requests.
  let httpClient: HttpClient;
  //let httpTestingController: HttpTestingController;
  beforeEach(() => {
    // Set up the mock handling of the HTTP requests
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    // Construct an instance of the service with the mock
    // HTTP client.
    httpClient = TestBed.inject(HttpClient);
    //httpTestingController = TestBed.inject(HttpTestingController);
    gradeService = TestBed.inject(GradeListService);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    //httpTestingController.verify();
  });

  describe('Updates saved search terms correctly', () => {
    //On E2E testing, should make sure this actually persists between pages.
    it('correctly initializes and updates saved search terms.', () => {
      //Begins with correct values.
      expect(gradeService.savedGradeListName).toEqual('');
      expect(gradeService.savedGradeListGrade).toEqual('');
      expect(gradeService.savedGradeListSchool).toEqual('');
      expect(gradeService.savedGradeListType).toEqual('');
      expect(gradeService.savedGradeListDesc).toEqual('');
      expect(gradeService.savedGradeListSortBy).toEqual('school');
      expect(gradeService.savedGradeListRequired).toEqual(0);

      //We test elsewhere that the list actually calls this correctly.
      gradeService.updateSavedSearch({
        name:'Test',
        school:'Hogwarts',
        grade:'P',
        type:'other',
        desc:'This is a test',
        required:2,
        sortby:'name'
      });
      expect(gradeService.savedGradeListName).toEqual('Test');
      expect(gradeService.savedGradeListGrade).toEqual('P');
      expect(gradeService.savedGradeListSchool).toEqual('Hogwarts');
      expect(gradeService.savedGradeListType).toEqual('other');
      expect(gradeService.savedGradeListDesc).toEqual('This is a test');
      expect(gradeService.savedGradeListSortBy).toEqual('name');
      expect(gradeService.savedGradeListRequired).toEqual(2);
    });
  });

  describe('When getItems() is called with no parameters', () => {
    it('calls `api/grade_list`', waitForAsync(() => {
      // Mock the `httpClient.get()` method, so that instead of making an HTTP request,
      // it just returns our test data.
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testItems));

      gradeService.getItems().subscribe(() => {
        // The mocked method (`httpClient.get()`) should have been called
        // exactly one time.
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(gradeService.gradeListUrl, { params: new HttpParams() });
      });
    }));
  });

  describe('When getItems() is called with parameters, it correctly forms the HTTP request (Javalin/Server filtering)', () => {
    it('correctly calls api/grade_list with filter parameter \'Pencil\'', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testItems));

      gradeService.getItems({ name: 'pencil' }).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(gradeService.gradeListUrl, { params: new HttpParams().set('name', 'pencil') });
      });
    });

    it('correctly calls api/grade_list with filter parameter \'required\'', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testItems));

      gradeService.getItems({ required: 25 }).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(gradeService.gradeListUrl, { params: new HttpParams().set('required', '25') });
      });
    });

    it('correctly calls api/grade_list with multiple filter parameters', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testItems));

      gradeService.getItems({ name: 'pencil', type: 'pencil', required: 37, desc:'yellow', grade:'2', school:'MAES' }).subscribe(() => {
        const [url, options] = mockedMethod.calls.argsFor(0);
        const calledHttpParams: HttpParams = (options.params) as HttpParams;
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(url)
          .withContext('talks to the correct endpoint')
          .toEqual(gradeService.gradeListUrl);
        expect(calledHttpParams.keys().length)
          .withContext('should have 6 params')
          .toEqual(6);
        expect(calledHttpParams.get('name'))
          .withContext('name of item')
          .toEqual('pencil');
        expect(calledHttpParams.get('type'))
          .withContext('type of pencil')
          .toEqual('pencil');
        expect(calledHttpParams.get('school'))
          .withContext('MAES')
          .toEqual('MAES');
        expect(calledHttpParams.get('required'))
          .withContext('37 required')
          .toEqual('37');
        expect(calledHttpParams.get('desc'))
          .withContext('desc contains yellow')
          .toEqual('yellow');
        expect(calledHttpParams.get('grade'))
          .withContext('for grade 2')
          .toEqual('2');
      });
    });
  });

  describe('When getItemsFromInventory() is called with no parameters', () => {
    it('calls `api/inventory`', waitForAsync(() => {
      // Mock the `httpClient.get()` method, so that instead of making an HTTP request,
      // it just returns our test data.
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testInventory));

      gradeService.getItemsFromInventory().subscribe(() => {
        // The mocked method (`httpClient.get()`) should have been called
        // exactly one time.
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(gradeService.inventoryUrl, { params: new HttpParams() });
      });
    }));
  });

  describe('When getItems() is called with parameters, it correctly forms the HTTP request (Javalin/Server filtering)', () => {
    it('correctly calls api/inventory with filter parameter \'Pencil\'', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testInventory));

      gradeService.getItemsFromInventory({ name: 'pencil' }).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(gradeService.inventoryUrl, { params: new HttpParams().set('name', 'pencil') });
      });
    });

    it('correctly calls api/inventory with filter parameter \'stocked\'', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testItems));

      gradeService.getItemsFromInventory({ stocked: 25 }).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(gradeService.inventoryUrl, { params: new HttpParams().set('stocked', '25') });
      });
    });

    it('correctly calls api/inventory with multiple filter parameters', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testItems));

      gradeService.getItemsFromInventory({ name: 'pencil', type: 'pencil', stocked: 37, desc:'yellow', location:'Tote #3' }).subscribe(() => {
        const [url, options] = mockedMethod.calls.argsFor(0);
        const calledHttpParams: HttpParams = (options.params) as HttpParams;
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(url)
          .withContext('talks to the correct endpoint')
          .toEqual(gradeService.inventoryUrl);
        expect(calledHttpParams.keys().length)
          .withContext('should have 5 params')
          .toEqual(5);
        expect(calledHttpParams.get('name'))
          .withContext('name of item')
          .toEqual('pencil');
        expect(calledHttpParams.get('type'))
          .withContext('type of pencil')
          .toEqual('pencil');
        expect(calledHttpParams.get('stocked'))
          .withContext('37 stocked')
          .toEqual('37');
        expect(calledHttpParams.get('desc'))
          .withContext('desc contains yellow')
          .toEqual('yellow');
        expect(calledHttpParams.get('location'))
          .withContext('in Tote #3')
          .toEqual('Tote #3');
      });
    });
  });

  describe('When getSchools() is called with no parameters', () => {
    it('calls `api/schools`', waitForAsync(() => {
      // Mock the `httpClient.get()` method, so that instead of making an HTTP request,
      // it just returns our test data.
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testSchools));

      gradeService.getSchools().subscribe(() => {
        // The mocked method (`httpClient.get()`) should have been called
        // exactly one time.
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(gradeService.schoolUrl);
      });
    }));
  });

  describe('When getItemById() is given an ID', () => {
    it('calls api/inventory/id with the correct ID', waitForAsync(() => {
      // We're just picking a Item "at random" from our little
      // set of Items up at the top.
      const targetUser: RequiredItem = testItems[1];
      const targetId: string = targetUser._id;

      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(targetUser));

      gradeService.getItemById(targetId).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(`${gradeService.gradeListUrl}/${targetId}`);
      });
    }));
  });

  describe('Filtering on the client using `filterItems()` (Angular/Client filtering)', () => {
    it('filters by name', () => {
      const itemName = 'o';
      const filteredItems = gradeService.filterItems(testItems, { name: itemName });
      // There should be two items with an 'o' in their
      // name: Yellow Pencils, and Red Plastic Folder
      expect(filteredItems.length).toBe(2);
      // Every returned user's name should contain an 'o'.
      filteredItems.forEach(item => {
        expect(item.name.indexOf(itemName)).toBeGreaterThanOrEqual(0);
      });
    });

    it('filters by desc', () => {
      const itemDesc = 'Ticonderoga';
      const filteredItems = gradeService.filterItems(testItems, { desc: itemDesc });
      // Only the pencils are from Ticonderoga
      expect(filteredItems.length).toBe(1);
      // Every returned item's name should contain an 'Ticonderoga'.
      filteredItems.forEach(item => {
        expect(item.desc.indexOf(itemDesc)).toBeGreaterThanOrEqual(0);
      });
    });

    it('filters by school', () => {
      const itemSchool = 'MAES';
      const filteredItems = gradeService.filterItems(testItems, { school: itemSchool });
      expect(filteredItems.length).toBe(2);
      filteredItems.forEach(item => {
        expect(item.school.indexOf(itemSchool)).toBeGreaterThanOrEqual(0);
      });
    });

    it('filters by required', () => {
      const itemRequired = 2;
      const filteredItems = gradeService.filterItems(testItems, { required: itemRequired });
      // Two of the provided items have a stock >= 2.
      expect(filteredItems.length).toBe(2);
      // Every returned item's stock should be >= 2
      filteredItems.forEach(item => {
        expect(item.required).toBeGreaterThanOrEqual(2);
      });
    });

    it('filters by grade and type', () => {
      const itemGrade = 'K';
      const itemType = 'pencil';
      const filters = { grade: itemGrade, type: itemType };
      const filteredItems = gradeService.filterItems(testItems, filters);
      // There should be just one item with these properties.
      expect(filteredItems.length).toBe(1);
      // Every returned item should have _both_ these properties.
      filteredItems.forEach(item => {
        expect(item.grade.indexOf(itemGrade)).toBeGreaterThanOrEqual(0);
        expect(item.type.indexOf(itemType)).toBeGreaterThanOrEqual(0);
      });
    });
  });

  it('sorts by required', () => {
    const filteredItems = gradeService.filterItems(testItems, {sortBy:"quantity"});
    // Sorting should not change length.
    expect(filteredItems.length).toBe(3);
    // The first item should have stock 0
    expect(filteredItems[0].required).toBe(1);
    // The second item should have 2
    expect(filteredItems[1].required).toBe(2);
    // The third item should have 6
    expect(filteredItems[2].required).toBe(6);
  });

  it('sorts by reverse quantity', () => {
    const filteredItems = gradeService.filterItems(testItems, {sortBy:"quantity_des"});
    // Sorting should not change length.
    expect(filteredItems.length).toBe(3);
    // The first item should have stock 0
    expect(filteredItems[2].required).toBe(1);
    // The second item should have 2
    expect(filteredItems[1].required).toBe(2);
    // The third item should have 6
    expect(filteredItems[0].required).toBe(6);
  });

  it('sorts by name', () => {
    const filteredItems = gradeService.filterItems(testItems, {sortBy:"name"});
    // Sorting should not change length.
    expect(filteredItems.length).toBe(3);
    // Sorts alphabetically, with numbers first.
    expect(filteredItems[0].name).toBe("2-inch Eraser");
    expect(filteredItems[1].name).toBe("Red Plastic Folder");
    expect(filteredItems[2].name).toBe("Yellow Pencils");
  });

  it('sorts by reverse name', () => {
    const filteredItems = gradeService.filterItems(testItems, {sortBy:"name_des"});
    // Sorting should not change length.
    expect(filteredItems.length).toBe(3);
    // Sorts alphabetically, with numbers first.
    expect(filteredItems[2].name).toBe("2-inch Eraser");
    expect(filteredItems[1].name).toBe("Red Plastic Folder");
    expect(filteredItems[0].name).toBe("Yellow Pencils");
  });

  describe('When deleteItem() is called', () => {
    it('talks to correct Endpoint', waitForAsync(() => {
      // Checking whether the item was actually deleted should happen in E2E probably
      const targetItem: RequiredItem = testItems[1];
      const targetId: string = targetItem._id;

      const mockedMethod = spyOn(httpClient, 'delete').and.returnValue(of(targetItem));

      gradeService.deleteItem(targetId).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(`${gradeService.gradeListUrl}/${targetId}`);
      });
    }));
  });

  describe('When addItem() is called', () => {
    it('talks to correct Endpoint', waitForAsync(() => {
      // Checking whether the item was actually deleted should happen in E2E probably
      const targetItem: RequiredItem = testItems[1]; //This will be a duplicate

      const mockedMethod = spyOn(httpClient, 'post').and.returnValue(of(targetItem));

      gradeService.addItem(targetItem).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(`${gradeService.gradeListUrl}`, targetItem );
      });
    }));
  });

  describe('When addItemToInventory() is called', () => {
    it('talks to correct Endpoint', waitForAsync(() => {
      // Checking whether the item was actually deleted should happen in E2E probably
      const targetItem: RequiredItem = testItems[1];

      const mockedMethod = spyOn(httpClient, 'post').and.returnValue(of(targetItem));

      gradeService.addItemToInventory(targetItem).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(`${gradeService.inventoryUrl}`, targetItem );
      });
    }));
    it('does not allow duplicate items', waitForAsync(() => {
      const targetItem: RequiredItem = testItems[1];
      //const mockedMethod = spyOn(httpClient, 'post').and.returnValue(of(targetItem));
      expect(gradeService.alreadyInInventory(targetItem,testInventory)).toBeTrue();
    }));
    it('allows new items to be added', waitForAsync(() => {
      const targetItem: RequiredItem = {
        _id:undefined,
        name:'Test',
        desc:'This is a test',
        grade:'2',
        school:'MAES',
        required:2,
        type:'other',
        pack:1
      }
      //const mockedMethod = spyOn(httpClient, 'post').and.returnValue(of(targetItem));
      expect(gradeService.alreadyInInventory(targetItem,testInventory)).toBeFalse();
    }));
  });

  describe('When modifyMass() is called', () => {
    let copiedItems = [];
    let copiedItemsIDless = [];
    let emptyItem: RequiredItem = {
      _id: undefined,
      name: undefined,
      type: undefined,
      grade: undefined,
      school: undefined,
      required: undefined,
      desc: undefined,
      pack:undefined
    }

    beforeEach(() => {
      //Create a new array to compare to the actual testItems after each modification
      copiedItems = [];
      copiedItemsIDless = [];
      for (let i = 0; i < testItems.length - 1; i++) {
        copiedItems.push(testItems[i]);
        testItems[i]._id = undefined;
        copiedItemsIDless.push(testItems[i]); //Used to test mass modification
      }
      //Reset empty item properties.
      emptyItem = {
        _id: undefined,
        name: undefined,
        type: undefined,
        grade: undefined,
        school: undefined,
        required: undefined,
        desc: undefined,
        pack: undefined
      }
    });

    //Accepts a normal array, so thankfully easy to test?
    it('talks to correct Endpoints', waitForAsync(() => {
      // Checking whether the item was actually deleted should happen in E2E probably
      const targetItem: RequiredItem = testItems[1]; //This will be a duplicate

      const mockedAdd = spyOn(httpClient, 'post').and.returnValue(of(targetItem));
      const mockedDelete = spyOn(httpClient, 'delete').and.returnValue(of(targetItem));


      gradeService.modifyMass(emptyItem,copiedItems);

      //This is still called even with no parameters.
      //Not ideal, but we shouldn't ever be calling it without parameters anyways.

      expect(mockedAdd)
        .withContext('calls add')
        //Way to add multiple call checks? Every item should be called.
        .toHaveBeenCalledWith(`${gradeService.gradeListUrl}`, copiedItemsIDless[0]);

      expect(mockedDelete)
        .withContext('calls delete')
        .toHaveBeenCalledTimes(1);

      //Obviously we could do more testing here...
      // but it at least gets us to coverage, and it works for now.
    }));
    it('works correctly when provided parameters', waitForAsync(() => {
      // Checking whether the item was actually deleted should happen in E2E probably
      const targetItem: RequiredItem = testItems[1]; //This will be a duplicate
      const overrideItem: RequiredItem = testItems[2]; //Item to override properties.
      const overrideItemIDless: RequiredItem = {
        _id: undefined,
        name: testItems[2].name,
        type: testItems[2].type,
        grade: testItems[2].grade,
        school: testItems[2].school,
        required: testItems[2].required,
        desc: testItems[2].desc,
        pack: testItems[2].pack
      }

      const mockedAdd = spyOn(httpClient, 'post').and.returnValue(of(targetItem));
      const mockedDelete = spyOn(httpClient, 'delete').and.returnValue(of(targetItem));


      gradeService.modifyMass(overrideItem,copiedItems);

      //This is still called even with no parameters.
      //Not ideal, but we shouldn't ever be calling it without parameters anyways.

      expect(mockedAdd)
        .withContext('calls add')
        //Way to add multiple call checks? Every item should be called.
        .toHaveBeenCalledWith(`${gradeService.gradeListUrl}`, overrideItemIDless);

      expect(mockedDelete)
        .withContext('calls delete')
        .toHaveBeenCalledTimes(1);

      //Obviously we could do more testing here...
      // but it at least gets us to coverage, and it works for now.
    }));
  });
});
