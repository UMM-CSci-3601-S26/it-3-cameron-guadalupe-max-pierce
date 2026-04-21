import { provideHttpClient } from '@angular/common/http'; //HttpParams, HttpClient
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing'; //waitForAsync
// import { of } from 'rxjs';
// import { InventoryItem } from './inventory_item';
import { ShoppingListService } from './shopping_list.service';
//import { Company } from '../company-list/company';

describe('ShoppingListService', () => {
  // A small collection of test users

  let inventoryService: ShoppingListService;
  // These are used to mock the HTTP requests so that we (a) don't have to
  // have the server running and (b) we can check exactly which HTTP
  // requests were made to ensure that we're making the correct requests.
  // let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    // Set up the mock handling of the HTTP requests
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    // Construct an instance of the service with the mock
    // HTTP client.
    // httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    inventoryService = TestBed.inject(ShoppingListService);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  describe('Updates saved search terms correctly', () => {
    //Simple as that. On E2E testing, should make sure this actually persists between pages.
    it('correctly initializes and updates saved search terms.', () => {
      //Begins with correct values.
      expect(inventoryService.savedShoppingListName).toEqual('');
      expect(inventoryService.savedShoppingListType).toEqual('');
      expect(inventoryService.savedShoppingListDesc).toEqual('');
      expect(inventoryService.savedShoppingListGrade).toEqual('');
      expect(inventoryService.savedShoppingListSchool).toEqual('');
      //We test elsewhere that the list actually calls this correctly.
      inventoryService.updateSavedSearch({
        name:'Test',
        school:'MAES',
        type:'other',
        desc:'This is a test',
        grade:'2',
        sortby:'name'
      });
      expect(inventoryService.savedShoppingListName).toEqual('Test');
      expect(inventoryService.savedShoppingListSchool).toEqual('MAES');
      expect(inventoryService.savedShoppingListType).toEqual('other');
      expect(inventoryService.savedShoppingListDesc).toEqual('This is a test');
      expect(inventoryService.savedShoppingListSortBy).toEqual('name');
      expect(inventoryService.savedShoppingListGrade).toEqual('2');
    });
  });
});
