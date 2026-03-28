import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
//import { Observable } from 'rxjs';
import { MockFamilyService } from 'src/testing/family.service.mock';
//import { InventoryItem } from './inventory_item';
// import { UserCardComponent } from './user-card.component';
import { FamilyListComponent } from './family_list.component';
import { FamilyService } from './family.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Family list', () => {
  let familyList: FamilyListComponent;
  let fixture: ComponentFixture<FamilyListComponent>;
  let inventoryService: FamilyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FamilyListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: FamilyService, useClass: MockFamilyService },
        provideRouter([])
      ],
    });
  });

  beforeEach(waitForAsync(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(FamilyListComponent);
      familyList = fixture.componentInstance;
      inventoryService = TestBed.inject(FamilyService);
      fixture.detectChanges();
    });
  }));

  it('should create the component', () => {
    expect(familyList).toBeTruthy();
  });

  it('should initialize with serverFilteredItems available', () => {
    const items = familyList.serverFilteredItems();
    expect(items).toBeDefined();
    expect(Array.isArray(items)).toBe(true);
  });

  it('should initialize with filteredFamilies available', () => {
    const items = familyList.filteredFamilies();
    expect(items).toBeDefined();
    expect(Array.isArray(items)).toBe(true);
  });

  it('should initialize with gradeFilteredFamilies available', () => {
    const typedItems = familyList.gradeFilteredFamilies();
    expect(typedItems).toBeDefined();
    expect(Array.isArray(typedItems)).toBe(true);
  });

  it('should call getFamilies() and updateSavedSearch() when familyName signal changes', () => {
    const spy = spyOn(inventoryService, 'getFamilies').and.callThrough();
    const doubleAgent = spyOn(inventoryService, 'updateSavedSearch').and.callThrough();
    familyList.itemName.set('test');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith({  }); //Since we're not filtering on server, no arguements should be passed.
    expect(doubleAgent).toHaveBeenCalled();
  });

  it('should not show error message on successful load', () => {
    expect(familyList.errMsg()).toBeUndefined();
  });

  it("correctly handles the 'Family Reset' button", () => {
    expect(familyList.resetVisible()).toEqual(false);
    familyList.revealReset();
    expect(familyList.resetVisible()).toEqual(true);
  });
});
