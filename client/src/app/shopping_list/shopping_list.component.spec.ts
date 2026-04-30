import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http'; //HttpClient
import { provideRouter } from '@angular/router';
// import { Observable } from 'rxjs';
//import { throwError } from 'rxjs';
import { MockShoppingListService } from 'src/testing/shopping_list.service.mock';
import { ShoppingListComponent } from './shopping_list.component';
import { ShoppingListService } from './shopping_list.service';
import { RequiredItem } from '../grade_list/required_item';
import { Family } from '../families/family';
import { Student } from '../families/student';
import { InventoryItem } from '../inventory/inventory_item';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Shopping List', () => {
  let shoppingList: ShoppingListComponent;
  let fixture: ComponentFixture<ShoppingListComponent>;
  let shoppingService: ShoppingListService;
  // let httpClient: HttpClient;

  const testReqs: RequiredItem[] = [
    {
      _id: 'pencil_id',
      name: 'Yellow Pencils',
      type: 'pencil',
      grade:'1',
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
      location:'Tote #3',
      stocked: 100,
      desc: 'yellow Ticonderoga pencils',
      pack:1
    },
    {
      _id: 'eraser_id',
      name: '2-inch Eraser',
      type: 'eraser',
      location: 'Tote #4',
      stocked: 0,
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


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ShoppingListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ShoppingListService, useClass: MockShoppingListService },
        provideRouter([])
      ],
    });
  });

  beforeEach(waitForAsync(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(ShoppingListComponent);
      shoppingList = fixture.componentInstance;
      shoppingService = TestBed.inject(ShoppingListService);
      // httpClient = TestBed.inject(HttpClient);
      fixture.detectChanges();
    });
  }));

  it('should create the component', () => {
    expect(shoppingList).toBeTruthy();
  });

  it('should initialize with filtered families available', () => {
    const items = shoppingList.serverFilteredFamilies();
    expect(items).toBeDefined();
    expect(Array.isArray(items)).toBe(true);
  });

  it('should initialize with filteredSchoolOptions available', () => {
    const items = shoppingList.filteredSchoolOptions();
    expect(items).toBeDefined();
    expect(Array.isArray(items)).toBe(true);
  });

  it('should initialize with filtered inventory available', () => {
    const items = shoppingList.serverFilteredInventory();
    expect(items).toBeDefined();
    expect(Array.isArray(items)).toBe(true);
  });

  it('should initialize with filtered schools available', () => {
    const items = shoppingList.serverFilteredSchools();
    expect(items).toBeDefined();
    expect(Array.isArray(items)).toBe(true);
  });

  it('should initialize with filtered requirements available', () => {
    const items = shoppingList.serverFilteredRequirements();
    expect(items).toBeDefined();
    expect(Array.isArray(items)).toBe(true);
  });

  it('should initialize with shoppingListItems available', () => {
    const typedItems = shoppingList.shoppingListItems();
    expect(typedItems).toBeDefined();
    expect(Array.isArray(typedItems)).toBe(true);
    expect(typedItems.length).toBe(2); //???
  });

  it('should initialize with typeFilteredShoppingListItems available', () => {
    const typedItems = shoppingList.typeFilteredShoppingListItems();
    expect(typedItems).toBeDefined();
    expect(Array.isArray(typedItems)).toBe(true);
    expect(typedItems.length).toBe(0); //Test items returns an empty array.
  });

  it('displayTypeLabel returns a readable label for a known type', () => {
    expect(shoppingList.displayTypeLabel('pencils')).toBe('Pencils');
  });

  it('displayGradeLabel returns a readable label for a known grade', () => {
    expect(shoppingList.displayGradeLabel('K')).toBe('Kindergarten');
  });

  it('filteredTypeOptions filters when a type query is present', () => {
    shoppingList.itemType.set('pen');

    const items = shoppingList.filteredTypeOptions();

    expect(items.length).toBeGreaterThan(0);
    expect(items.every(option =>
      option.label.toLowerCase().includes('pen') || option.value.toLowerCase().includes('pen')
    )).toBeTrue();
  });

  it('should call updateSavedSearch() when itemName signal changes', () => {
    //const spy = spyOn(shoppingService, 'getItems').and.callThrough();
    const spy = spyOn(shoppingService, 'updateSavedSearch').and.callThrough();
    shoppingList.itemName.set('test');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
  });

  it('should correctly propogate shoppingList.', () => {
    //Calling shopping list on empty data should return an empty array.
    expect(shoppingList.calculateShoppingList([],[],[],true).length).toEqual(0);
    //Calling shopping list without students should return an empty array.
    expect(shoppingList.calculateShoppingList(testInventory,testReqs,[],true).length).toEqual(0);
    //Create a simple family
    const Bob: Student = {
      first_name:'Bob',
      last_name:'Richards',
      backpack:false,
      headphones:false,
      teacher:'Mr.Cannon',
      grade:'1',
      school:'MAES'
    }

    const Richards: Family = {
      _id:"1",
      first_name:"Pierce",
      last_name:"Richards",
      first_name_alt:'',
      last_name_alt:'',
      time:'',
      email:'',
      students:[Bob]
    };
    //Calling shopping list with a single first grade MAES student, and two requirements for that grade, should return 2 items.
    expect(shoppingList.calculateShoppingList(testInventory,testReqs,[Richards],false).length).toEqual(2);

    //Adding more students increases item counts, not # of items in list.
    expect(shoppingList.calculateShoppingList(testInventory,testReqs,[Richards,Richards],false).length).toEqual(2);

    //Subtracting inventory should remove pencils, giving us only 1 item. Erasers are also in inventory, but unstocked.
    expect(shoppingList.calculateShoppingList(testInventory,testReqs,[Richards],true).length).toEqual(1);

    //Make some new reqs
    const newReqs: RequiredItem[] = [
      {
        _id: 'backpack_id',
        name: 'Backpack',
        type: 'backpacks',
        grade:'1',
        school:'MAES',
        required: 1,
        desc: 'No wheels!!!!!!!!',
        pack:1
      },
      {
        _id: 'headphone_id',
        name: 'Headphones',
        type: 'headphones',
        grade:'1',
        school:'MAES',
        required: 1,
        desc: 'No wheels!!!!!!!!',
        pack:1
      }];

    //Backpacks and headphones are ignored for students who don't need them.
    expect(shoppingList.calculateShoppingList([],newReqs,[Richards],true).length).toEqual(0);
  });

  it('should not show error message on successful load', () => {
    expect(shoppingList.errMsg()).toBeUndefined();
  });
});
