import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
// import { Observable } from 'rxjs';
//import { throwError } from 'rxjs';
import { MockShoppingListService } from 'src/testing/shopping_list.service.mock';
import { ShoppingListComponent } from './shopping_list.component';
import { ShoppingListService } from './shopping_list.service';
// import { RequiredItem } from '../grade_list/required_item';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Shopping List', () => {
  let shoppingList: ShoppingListComponent;
  let fixture: ComponentFixture<ShoppingListComponent>;
  let shoppingService: ShoppingListService;

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

  it('should call updateSavedSearch() when itemName signal changes', () => {
    //const spy = spyOn(shoppingService, 'getItems').and.callThrough();
    const spy = spyOn(shoppingService, 'updateSavedSearch').and.callThrough();
    shoppingList.itemName.set('test');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
  });

  it('should not show error message on successful load', () => {
    expect(shoppingList.errMsg()).toBeUndefined();
  });
});
