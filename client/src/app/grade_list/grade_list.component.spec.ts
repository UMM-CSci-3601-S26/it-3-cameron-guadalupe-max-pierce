import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
//import { Observable } from 'rxjs';
import { MockGradeListService } from 'src/testing/grade_list.service.mock';
//import { InventoryItem } from './inventory_item';
// import { UserCardComponent } from './user-card.component';
import { GradeListComponent } from './grade_list.component';
import { GradeListService } from './grade_list.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Grade List', () => {
  let gradeList: GradeListComponent;
  let fixture: ComponentFixture<GradeListComponent>;
  let inventoryService: GradeListService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GradeListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: GradeListService, useClass: MockGradeListService },
        provideRouter([])
      ],
    });
  });

  beforeEach(waitForAsync(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(GradeListComponent);
      gradeList = fixture.componentInstance;
      inventoryService = TestBed.inject(GradeListService);
      fixture.detectChanges();
    });
  }));

  it('should create the component', () => {
    expect(gradeList).toBeTruthy();
  });

  it('should initialize with serverFilteredItems available', () => {
    const items = gradeList.serverFilteredItems();
    expect(items).toBeDefined();
    expect(Array.isArray(items)).toBe(true);
  });

  it('should initialize with filteredItems available', () => {
    const items = gradeList.filteredItems();
    expect(items).toBeDefined();
    expect(Array.isArray(items)).toBe(true);
  });

  it('should initialize with typeFilteredItems available', () => {
    const typedItems = gradeList.typeFilteredItems();
    expect(typedItems).toBeDefined();
    expect(Array.isArray(typedItems)).toBe(true);
  });

  it('should initialize with schoolFilteredItems available', () => {
    const schoolItems = gradeList.schoolFilteredItems();
    expect(schoolItems).toBeDefined();
    expect(Array.isArray(schoolItems)).toBe(true);
  });

  it('should call getItems() and updateSavedSearch() when itemName signal changes', () => {
    const spy = spyOn(inventoryService, 'getItems').and.callThrough();
    const doubleAgent = spyOn(inventoryService, 'updateSavedSearch').and.callThrough();
    gradeList.itemName.set('test');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith({  }); //Since we're not filtering on server, no arguements should be passed.
    expect(doubleAgent).toHaveBeenCalled();
  });

  it('should not show error message on successful load', () => {
    expect(gradeList.errMsg()).toBeUndefined();
  });

  it("correctly handles the 'Location Reset' button", () => {
    expect(gradeList.resetVisible()).toEqual(false);
    gradeList.revealReset();
    expect(gradeList.resetVisible()).toEqual(true);
  });

  //Irrellevant; eventually add a test for clearing the grade list.
  // it("calls the service with correct parameters for location reset", () => {
  //   const spy = spyOn(inventoryService, 'modifyMass').and.callThrough();
  //   const originalItems = gradeList.filteredItems();
  //   gradeList.resetLocations();
  //   fixture.detectChanges();
  //   expect(spy).toHaveBeenCalledOnceWith(
  //     {
  //       _id:undefined,
  //       location:"N/A",
  //       stocked:undefined,
  //       name:undefined,
  //       type:undefined,
  //       desc:undefined
  //     },
  //     originalItems
  //   );
  // });
});
