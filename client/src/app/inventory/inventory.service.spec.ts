import { HttpClient, HttpParams, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { InventoryItem } from './inventory_item';
import { InventoryService } from './inventory.service';
//import { Company } from '../company-list/company';

describe('InventoryService', () => {
  // A small collection of test users
  const testItems: InventoryItem[] = [
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

  let inventoryService: InventoryService;
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
    inventoryService = TestBed.inject(InventoryService);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  describe('Updates saved search terms correctly', () => {
    //Simple as that. On E2E testing, should make sure this actually persists between pages.
    it('correctly initializes and updates saved search terms.', () => {
      //Begins with correct values.
      expect(inventoryService.savedInventoryName).toEqual('');
      expect(inventoryService.savedInventoryLocation).toEqual('');
      expect(inventoryService.savedInventoryType).toEqual('');
      expect(inventoryService.savedInventoryDesc).toEqual('');
      expect(inventoryService.savedInventorySortBy).toEqual('');
      expect(inventoryService.savedInventoryStocked).toEqual(0);
      //We test elsewhere that the list actually calls this correctly.
      inventoryService.updateSavedSearch({
        name:'Test',
        location:'Over There',
        type:'other',
        desc:'This is a test',
        stocked:2,
        sortby:'name'
      });
      expect(inventoryService.savedInventoryName).toEqual('Test');
      expect(inventoryService.savedInventoryLocation).toEqual('Over There');
      expect(inventoryService.savedInventoryType).toEqual('other');
      expect(inventoryService.savedInventoryDesc).toEqual('This is a test');
      expect(inventoryService.savedInventorySortBy).toEqual('name');
      expect(inventoryService.savedInventoryStocked).toEqual(2);
    });
  });

  describe('When getItems() is called with no parameters', () => {
    it('calls `api/inventory`', waitForAsync(() => {
      // Mock the `httpClient.get()` method, so that instead of making an HTTP request,
      // it just returns our test data.
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testItems));

      inventoryService.getItems().subscribe(() => {
        // The mocked method (`httpClient.get()`) should have been called
        // exactly one time.
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(inventoryService.inventoryUrl, { params: new HttpParams() });
      });
    }));
  });

  describe('When getItems() is called with parameters, it correctly forms the HTTP request (Javalin/Server filtering)', () => {
    it('correctly calls api/users with filter parameter \'Pencil\'', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testItems));

      inventoryService.getItems({ name: 'pencil' }).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(inventoryService.inventoryUrl, { params: new HttpParams().set('name', 'pencil') });
      });
    });

    it('correctly calls api/inventory with filter parameter \'stocked\'', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testItems));

      inventoryService.getItems({ stocked: 25 }).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(inventoryService.inventoryUrl, { params: new HttpParams().set('stocked', '25') });
      });
    });

    it('correctly calls api/users with multiple filter parameters', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testItems));

      inventoryService.getItems({ name: 'pencil', type: 'pencil', stocked: 37, desc:'yellow', location:'tote' }).subscribe(() => {
        const [url, options] = mockedMethod.calls.argsFor(0);
        const calledHttpParams: HttpParams = (options.params) as HttpParams;
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(url)
          .withContext('talks to the correct endpoint')
          .toEqual(inventoryService.inventoryUrl);
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
          .withContext('located in a tote')
          .toEqual('tote');
      });
    });
  });

  describe('When getItemById() is given an ID', () => {
    it('calls api/inventory/id with the correct ID', waitForAsync(() => {
      // We're just picking a Item "at random" from our little
      // set of Items up at the top.
      const targetUser: InventoryItem = testItems[1];
      const targetId: string = targetUser._id;

      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(targetUser));

      inventoryService.getItemById(targetId).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(`${inventoryService.inventoryUrl}/${targetId}`);
      });
    }));
  });

  describe('Filtering on the client using `filterItems()` (Angular/Client filtering)', () => {
    it('filters by name', () => {
      const itemName = 'o';
      const filteredItems = inventoryService.filterItems(testItems, { name: itemName });
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
      const filteredItems = inventoryService.filterItems(testItems, { desc: itemDesc });
      // Only the pencils are from Ticonderoga
      expect(filteredItems.length).toBe(1);
      // Every returned item's name should contain an 'Ticonderoga'.
      filteredItems.forEach(item => {
        expect(item.desc.indexOf(itemDesc)).toBeGreaterThanOrEqual(0);
      });
    });

    it('filters by quantity', () => {
      const itemStocked = 1;
      const filteredItems = inventoryService.filterItems(testItems, { stocked: itemStocked });
      // Two of the provided items have a stock >= 1.
      expect(filteredItems.length).toBe(2);
      // Every returned item's stock should be >= 1
      filteredItems.forEach(item => {
        expect(item.stocked).toBeGreaterThanOrEqual(1);
      });
    });

    it('filters by location and type', () => {
      const itemLocation = 'Tote #2';
      const itemType = 'folder';
      const filters = { location: itemLocation, type: itemType };
      const filteredItems = inventoryService.filterItems(testItems, filters);
      // There should be just one item with these properties.
      expect(filteredItems.length).toBe(1);
      // Every returned item should have _both_ these properties.
      filteredItems.forEach(item => {
        expect(item.location.indexOf(itemLocation)).toBeGreaterThanOrEqual(0);
        expect(item.type.indexOf(itemType)).toBeGreaterThanOrEqual(0);
      });
    });
  });

  it('sorts by location', () => {
    const filteredItems = inventoryService.filterItems(testItems, {sortBy:"location"});
    // Sorting should not change length.
    expect(filteredItems.length).toBe(3);
    // The first item should be from Tote #2
    expect(filteredItems[0].location).toBe("Tote #2");
    // The second item should be from Tote #3
    expect(filteredItems[1].location).toBe("Tote #3");
    // The third item should be from Tote #4
    expect(filteredItems[2].location).toBe("Tote #4");
  });

  it('sorts by reverse location', () => {
    const filteredItems = inventoryService.filterItems(testItems, {sortBy:"location_des"});
    // Sorting should not change length.
    expect(filteredItems.length).toBe(3);
    // The first item should be from Tote #2
    expect(filteredItems[0].location).toBe("Tote #4");
    // The second item should be from Tote #3
    expect(filteredItems[1].location).toBe("Tote #3");
    // The third item should be from Tote #4
    expect(filteredItems[2].location).toBe("Tote #2");
  });

  it('sorts by quantity', () => {
    const filteredItems = inventoryService.filterItems(testItems, {sortBy:"quantity"});
    // Sorting should not change length.
    expect(filteredItems.length).toBe(3);
    // The first item should have stock 0
    expect(filteredItems[0].stocked).toBe(0);
    // The second item should have 2
    expect(filteredItems[1].stocked).toBe(2);
    // The third item should have 6
    expect(filteredItems[2].stocked).toBe(6);
  });

  it('sorts by reverse quantity', () => {
    const filteredItems = inventoryService.filterItems(testItems, {sortBy:"quantity_des"});
    // Sorting should not change length.
    expect(filteredItems.length).toBe(3);
    // The first item should have stock 0
    expect(filteredItems[2].stocked).toBe(0);
    // The second item should have 2
    expect(filteredItems[1].stocked).toBe(2);
    // The third item should have 6
    expect(filteredItems[0].stocked).toBe(6);
  });

  it('sorts by name', () => {
    const filteredItems = inventoryService.filterItems(testItems, {sortBy:"name"});
    // Sorting should not change length.
    expect(filteredItems.length).toBe(3);
    // Sorts alphabetically, with numbers first.
    expect(filteredItems[0].name).toBe("2-inch Eraser");
    expect(filteredItems[1].name).toBe("Red Plastic Folder");
    expect(filteredItems[2].name).toBe("Yellow Pencils");
  });

  it('sorts by reverse name', () => {
    const filteredItems = inventoryService.filterItems(testItems, {sortBy:"name_des"});
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
      const targetItem: InventoryItem = testItems[1];
      const targetId: string = targetItem._id;

      const mockedMethod = spyOn(httpClient, 'delete').and.returnValue(of(targetItem));

      inventoryService.deleteItem(targetId).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(`${inventoryService.inventoryUrl}/${targetId}`);
      });
    }));
  });

  describe('When addItem() is called', () => {
    it('talks to correct Endpoint', waitForAsync(() => {
      // Checking whether the item was actually deleted should happen in E2E probably
      const targetItem: InventoryItem = testItems[1]; //This will be a duplicate

      const mockedMethod = spyOn(httpClient, 'post').and.returnValue(of(targetItem));

      inventoryService.addItem(targetItem).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(`${inventoryService.inventoryUrl}`, targetItem );
      });
    }));
  });

  describe('When modifyMass() is called', () => {
    it('completes immediately when there are no items', waitForAsync(() => {
      let completed = false;

      inventoryService.modifyMass({} as InventoryItem, []).subscribe({
        complete: () => {
          completed = true;
        }
      });

      expect(completed).toBeTrue();
    }));

    it('adds then deletes every item in the list provided', waitForAsync(() => {
      const addSpy = spyOn(inventoryService, 'addItem').and.returnValue(of('new_id'));
      const deleteSpy = spyOn(inventoryService, 'deleteItem').and.returnValue(of(testItems[0]));
      let completed = false;

      inventoryService.modifyMass({ location: 'Shelf A' } as InventoryItem, testItems).subscribe({
        complete: () => {
          completed = true;
        }
      });

      expect(addSpy).toHaveBeenCalledTimes(testItems.length);
      expect(deleteSpy).toHaveBeenCalledTimes(testItems.length);
      expect(addSpy.calls.argsFor(0)[0]).toEqual(jasmine.objectContaining({ location: 'Shelf A' }));
      expect(deleteSpy).toHaveBeenCalledWith(testItems[0]._id);
      expect(deleteSpy).toHaveBeenCalledWith(testItems[1]._id);
      expect(deleteSpy).toHaveBeenCalledWith(testItems[2]._id);
      expect(completed).toBeTrue();
    }));

    it('keeps values the same when a field is undefined', waitForAsync(() => {
      const addSpy = spyOn(inventoryService, 'addItem').and.returnValue(of('new_id'));
      spyOn(inventoryService, 'deleteItem').and.returnValue(of(testItems[0]));

      inventoryService.modifyMass({ location: 'Shelf Z' } as InventoryItem, [testItems[0]]).subscribe();

      const payload = addSpy.calls.mostRecent().args[0] as Partial<InventoryItem>;
      expect(payload.name).toBe(testItems[0].name);
      expect(payload.location).toBe('Shelf Z');
      expect(payload.type).toBe(testItems[0].type);
      expect(payload.desc).toBe(testItems[0].desc);
      expect(payload.stocked).toBe(testItems[0].stocked);
      expect(payload.pack).toBe(testItems[0].pack);
    }));
  });

  describe('When updateItem() is called', () => {
    it('sends a PUT to the correct endpoint with the update payload', waitForAsync(() => {
      const targetItem: InventoryItem = testItems[0];
      const updatedPayload: Partial<InventoryItem> = {
        ...targetItem,
        stocked: targetItem.stocked + 1
      };

      const mockedMethod = spyOn(httpClient, 'put').and.returnValue(of(void 0));

      inventoryService.updateItem(updatedPayload).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint with payload')
          .toHaveBeenCalledWith(`${inventoryService.inventoryUrl}/${targetItem._id}`, updatedPayload);
      });
    }));
  });

  describe('When deleteAll() is called', () => {
    it('talks to correct Endpoints', waitForAsync(() => {
      // Checking whether the item was actually deleted should happen in E2E probably
      const targetItems: InventoryItem[] = testItems; //This will be a duplicate

      const mockedDelete = spyOn(httpClient, 'delete').and.returnValue(of(targetItems));

      inventoryService.deleteAll(targetItems);

      expect(mockedDelete)
        .withContext('calls delete')
        .toHaveBeenCalledTimes(3);
    }));
  });
});
