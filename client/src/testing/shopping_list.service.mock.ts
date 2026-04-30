import { Injectable } from '@angular/core';
// import { Observable, forkJoin, of, switchMap } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { RequiredItem } from '../app/grade_list/required_item';
import { InventoryItem } from '../app/inventory/inventory_item';
import { ShoppingListService } from 'src/app/shopping_list/shopping_list.service';
import { MockInventoryService } from './inventory.service.mock';
import { MockFamilyService } from './family.service.mock';
import { MockGradeListService } from './grade_list.service.mock';

/**
 * A "mock" version of the `InventoryService` that can be used to test components
 * without having to create an actual service. It needs to be `Injectable` since
 * that's how services are typically provided to components.
 */
@Injectable({
  providedIn: AppComponent
})
export class MockShoppingListService implements Pick<ShoppingListService, 'updateSavedSearch' | 'alreadyInReqs' | 'alreadyInInventory'> {
  savedShoppingListName = ''; //Per-session saved value for name search bar.
  savedShoppingListSchool = ''; //Per-session saved value for location search bar.
  savedShoppingListGrade = ''; //Per-session saved value for stocked search bar.
  savedShoppingListType = ''; //Per-session saved value for type search bar.
  savedShoppingListDesc = ''; //Per-session saved value for description search bar.
  savedShoppingListSortBy = ''; //Per-session saved value for sort-order search bar.

  inventoryService = new MockInventoryService;
  typeOptions = this.inventoryService.typeOptions;

  familyService = new MockFamilyService
  gradeOptions = this.familyService.gradeOptions;
  schoolOptions = this.familyService.getSchools();

  gradeService = new MockGradeListService;
  gradeListService = this.gradeService;

  //Identical
  alreadyInReqs( newItem: RequiredItem, inventory: RequiredItem[]): number {
    const filteredItems = inventory;
    let retVal = -1;
    //let returnMessage = '';
    for (let i = 0; i < filteredItems.length; i ++) {
      //returnMessage = returnMessage.concat(" ~ ", filteredItems[i].name.toLowerCase());
      if ((filteredItems[i].name.toLowerCase().indexOf(newItem.name.toLowerCase()) !== -1)
      && (filteredItems[i].desc.toLowerCase().indexOf(newItem.desc.toLowerCase()) !== -1)
      && (filteredItems[i].type.toLowerCase().indexOf(newItem.type.toLowerCase()) !== -1)
      && (filteredItems[i].pack == newItem.pack)) {
        retVal = i;
      }
    }
    return retVal;
  }

  //Same, but for inventory
  alreadyInInventory( newItem: RequiredItem, inventory: InventoryItem[]): number {
    const filteredItems = inventory;//this.inventoryReference();
    let retVal = -1;
    //Works, but only if the page is reloaded after each press...
    for (let i = 0; i < filteredItems.length; i ++) {
      if ((filteredItems[i].name.toLowerCase().indexOf(newItem.name.toLowerCase()) !== -1)
      && (filteredItems[i].desc.toLowerCase().indexOf(newItem.desc.toLowerCase()) !== -1)
      && (filteredItems[i].type.toLowerCase().indexOf(newItem.type.toLowerCase()) !== -1)
      && (filteredItems[i].pack == newItem.pack)) {
        retVal = i;
      }
    }
    return retVal;
  }

  //For testing purposes, this is identical to the actual service. (Otherwise linting is mad about not using fields.)
  updateSavedSearch(fields: {name: string; type: string; desc: string; school: string; grade: string; sortby: string; }) {
    //Formerly checked if fields were provided; now required.
    //Defaults to empty strings and zeros.
    this.savedShoppingListName = fields.name;
    this.savedShoppingListType = fields.type;
    this.savedShoppingListDesc = fields.desc;
    this.savedShoppingListGrade = fields.grade;
    this.savedShoppingListSchool= fields.school;
    this.savedShoppingListSortBy = fields.sortby;
  }
}
