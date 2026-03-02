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
      desc: 'yellow Ticonderoga pencils'
    },
    {
      _id: 'eraser_id',
      name: '2-inch Eraser',
      type: 'eraser',
      location: 'Tote #4',
      stocked: 2,
      desc: '2-inch rubber eraser'
    },
    {
      _id: 'folder_id',
      name: 'Red Plastic Folder',
      type: 'folder',
      location: 'Tote #2',
      stocked: 0,
      desc: 'standard size red plastic folder.'
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

  describe('When getItems() is called with no parameters', () => {
    it('calls `api/inventory`', waitForAsync(() => {
      // Mock the `httpClient.get()` method, so that instead of making an HTTP request,
      // it just returns our test data.
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testItems));

      // Call `userService.getUsers()` and confirm that the correct call has
      // been made with the correct arguments.
      //
      // We have to `subscribe()` to the `Observable` returned by `getUsers()`.
      // The `users` argument in the function is the array of Users returned by
      // the call to `getUsers()`.
      inventoryService.getItems().subscribe(() => {
        // The mocked method (`httpClient.get()`) should have been called
        // exactly one time.
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        // The mocked method should have been called with two arguments:
        //   * the appropriate URL ('/api/users' defined in the `UserService`)
        //   * An options object containing an empty `HttpParams`
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
    it('calls api/users/id with the correct ID', waitForAsync(() => {
      // We're just picking a Item "at random" from our little
      // set of Items up at the top.
      const targetUser: InventoryItem = testItems[1];
      const targetId: string = targetUser._id;

      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(targetUser));

      inventoryService.getItemById(targetId).subscribe(() => {
        // The `User` returned by `getUserById()` should be targetUser, but
        // we don't bother with an `expect` here since we don't care what was returned.
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

    it('filters by location and type', () => {
      const itemLocation = 'Tote #2';
      const itemType = 'folder';
      const filters = { location: itemLocation, type: itemType };
      const filteredItems = inventoryService.filterItems(testItems, filters);
      // There should be just one user with these properties.
      expect(filteredItems.length).toBe(1);
      // Every returned user should have _both_ these properties.
      filteredItems.forEach(item => {
        expect(item.location.indexOf(itemLocation)).toBeGreaterThanOrEqual(0);
        expect(item.type.indexOf(itemType)).toBeGreaterThanOrEqual(0);
      });
    });
  });

  // describe('Adding a user using `addUser()`', () => {
  //   it('talks to the right endpoint and is called once', waitForAsync(() => {
  //     const user_id = 'pat_id';
  //     const expected_http_response = { id: user_id } ;

  //     // Mock the `httpClient.addUser()` method, so that instead of making an HTTP request,
  //     // it just returns our expected HTTP response.
  //     const mockedMethod = spyOn(httpClient, 'post')
  //       .and
  //       .returnValue(of(expected_http_response));

  //     userService.addUser(testUsers[1]).subscribe((new_user_id) => {
  //       expect(new_user_id).toBe(user_id);
  //       expect(mockedMethod)
  //         .withContext('one call')
  //         .toHaveBeenCalledTimes(1);
  //       expect(mockedMethod)
  //         .withContext('talks to the correct endpoint')
  //         .toHaveBeenCalledWith(userService.userUrl, testUsers[1]);
  //     });
  //   }));
  // });
});
