import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
// import { Observable } from 'rxjs';
//import { throwError } from 'rxjs';
import { MockShoppingListService } from 'src/testing/shopping_list.service.mock';
import { ShoppingListComponent } from './shopping_list.component';
import { ShoppingListService } from './shopping_list.service';
import { RequiredItem } from '../grade_list/required_item';
// import { Family } from '../families/family';
import { InventoryItem } from '../inventory/inventory_item';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Shopping List', () => {
  let shoppingList: ShoppingListComponent;
  let fixture: ComponentFixture<ShoppingListComponent>;
  let shoppingService: ShoppingListService;
  let httpClient: HttpClient;

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
      httpClient = TestBed.inject(HttpClient);
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
    expect(typedItems.length).toBe(0); //Test items returns an empty array.
  });

  it('should initialize with typeFilteredShoppingListItems available', () => {
    const typedItems = shoppingList.typeFilteredShoppingListItems();
    expect(typedItems).toBeDefined();
    expect(Array.isArray(typedItems)).toBe(true);
    expect(typedItems.length).toBe(0); //Test items returns an empty array.
  });

  it('should call updateSavedSearch() when itemName signal changes', () => {
    //const spy = spyOn(shoppingService, 'getItems').and.callThrough();
    const spy = spyOn(shoppingService, 'updateSavedSearch').and.callThrough();
    shoppingList.itemName.set('test');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
  });

  it('should correctly propogate shoppingList.', () => {

  });

  it('should not show error message on successful load', () => {
    expect(shoppingList.errMsg()).toBeUndefined();
  });
});
