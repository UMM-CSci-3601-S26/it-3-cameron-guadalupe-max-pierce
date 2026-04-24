import { provideHttpClient } from '@angular/common/http'; //HttpParams, HttpClient
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing'; //waitForAsync
// import { of } from 'rxjs';
import { InventoryItem } from '../inventory/inventory_item';
import { RequiredItem } from '../grade_list/required_item';
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

  describe('Checks for existing items.', () => {
    //Simple as that. On E2E testing, should make sure this actually persists between pages.
    it('Checks for duplicate requirements.', () => {
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

      expect(inventoryService.alreadyInReqs(testItems[1],testItems)).toEqual(1);

      const newItem = {
        _id: '4',
        name: 'Green Plastic Folder',
        type: 'folder',
        grade:'3',
        school:'Hancock',
        required: 1,
        desc: 'standard size red plastic folder.',
        pack:1
      }

      expect(inventoryService.alreadyInReqs(newItem,testItems)).toEqual(-1);
    });

    it('Checks for duplicate inventory.', () => {
      const testInventory: InventoryItem[] = [
        {
          _id: 'pencil_id',
          name: 'Yellow Pencils',
          type: 'pencil',
          stocked: 6,
          location:'',
          desc: 'yellow Ticonderoga pencils',
          pack:1
        },
        {
          _id: 'eraser_id',
          name: '2-inch Eraser',
          type: 'eraser',
          stocked: 2,
          location:'',
          desc: '2-inch rubber eraser',
          pack:1
        },
        {
          _id: '1',
          name: 'Red Plastic Folder',
          type: 'folder',
          location:'',
          stocked: 1,
          desc: 'standard size red plastic folder.',
          pack:1
        }
      ];

      const existingItem: RequiredItem = {
        _id:testInventory[1]._id,
        name:testInventory[1].name,
        type:testInventory[1].type,
        required:testInventory[1].stocked,
        grade:'',
        school:'',
        desc:testInventory[1].desc,
        pack:testInventory[1].pack,
      }

      expect(inventoryService.alreadyInInventory(existingItem,testInventory)).toEqual(1);

      const newInventory = {
        _id: '4',
        name: 'Green Plastic Folder',
        type: 'folder',
        grade:'3',
        school:'Hancock',
        required: 1,
        desc: 'standard size red plastic folder.',
        pack:1
      }

      expect(inventoryService.alreadyInInventory(newInventory,testInventory)).toEqual(-1);
    });
  });
});
