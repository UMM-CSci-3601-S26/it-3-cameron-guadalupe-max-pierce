// import { HttpClient } from '@angular/common/http'; //HttpParams
import { Injectable } from '@angular/core'; //inject
// import { Observable } from 'rxjs'; //forkJoin, of
// import { map, switchMap } from 'rxjs/operators';
// import { environment } from '../../environments/environment';
// import { InventoryItem } from '../inventory/inventory_item';
// import { Family } from '../families/family';
// import { Student } from '../families/student';
import { RequiredItem } from '../grade_list/required_item';
import { InventoryItem } from '../inventory/inventory_item';
import { InventoryService } from '../inventory/inventory.service';
import { FamilyService } from '../families/family.service';
import { GradeListService } from '../grade_list/grade_list.service';
//import { Company } from '../company-list/company';
//import { Signal } from '@angular/core/rxjs-interop';

/**
 * Service that provides the interface for getting information
 * about `Users` from the server.
 */
@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {

  savedShoppingListName = ''; //Per-session saved value for name search bar.
  savedShoppingListGrade = ''; //Per-session saved value for grade search bar.
  savedShoppingListSchool = ''; //Per-session saved value for school search bar.
  savedShoppingListType = ''; //Per-session saved value for type search bar.
  savedShoppingListDesc = ''; //Per-session saved value for description search bar.
  savedShoppingListSortBy = ''; //Per-session saved value for sort-order search bar.

  inventoryService = new InventoryService;
  typeOptions = this.inventoryService.typeOptions;

  familyService = new FamilyService
  gradeOptions = this.familyService.gradeOptions;
  schoolOptions = this.familyService.getSchools();

  gradeService = new GradeListService;

  //Borrowed and lightly modified from grade list service.
  //Now returns an index instead of true or false. -1 is not found.
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

  /**
   * @param fields a map that specifies which search terms to save
  */
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
