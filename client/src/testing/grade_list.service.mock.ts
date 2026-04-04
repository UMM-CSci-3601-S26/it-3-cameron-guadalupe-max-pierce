import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { RequiredItem } from '../app/grade_list/required_item';
import { InventoryItem } from '../app/inventory/inventory_item';
import { School } from '../app/grade_list/school';
import { GradeListService } from 'src/app/grade_list/grade_list.service';

/**
 * A "mock" version of the `InventoryService` that can be used to test components
 * without having to create an actual service. It needs to be `Injectable` since
 * that's how services are typically provided to components.
 */
@Injectable({
  providedIn: AppComponent
})
export class MockGradeListService implements Pick<GradeListService, 'getItems' | 'filterItems' | 'addItem' | 'addItemToInventory' | 'deleteItem'| 'updateSavedSearch'| 'modifyMass'|'getSchools'|'reloadPage'|'alreadyInInventory'> {
  savedInventoryName = ''; //Per-session saved value for name search bar.
  savedInventoryGrade = ''; //Per-session saved value for location search bar.
  savedInventorySchool = ''; //Per-session saved value for location search bar.
  savedInventoryRequired = 0; //Per-session saved value for stocked search bar.
  savedInventoryType = ''; //Per-session saved value for type search bar.
  savedInventoryDesc = ''; //Per-session saved value for description search bar.
  savedInventorySortBy = ''; //Per-session saved value for sort-order search bar.

  static testSchools: School[] = [
    {
      "_id": "maes_id",
      "value": "Morris Area Elementary School",
      "label":"MAES"
    },
    {
      "_id": "hancock_id",
      "value": "Hancock Elementary",
      "label":"Hancock"
    },
    {
      "_id": "saint_mary's_id",
      "value": "Saint Mary's Elementary",
      "label":"Saint Mary's"
    }
  ];

  static testItems: RequiredItem[] = [
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
      required: 0,
      desc: 'standard size red plastic folder.',
      pack:1
    }
  ];
  static emptyItem: RequiredItem = {
    _id: '',
    name: '',
    type: '',
    grade: '',
    school: '',
    required: 0,
    desc: '',
    pack:1
  }

  //Probably terrible form, but best way I could figure to get the tests working.
  realService = new GradeListService;
  typeOptions = this.realService.typeOptions;
  gradeOptions = this.realService.gradeOptions;

  //For testing purposes, this is identical to the actual service. (Otherwise linting is mad about not using fields.)
  updateSavedSearch(fields: {name: string; required: number; desc: string; grade: string; school: string; type: string; sortby: string;}) {
    //Formerly checked if fields were provided; now required.
    //Defaults to empty strings and zeros.
    this.savedInventoryName = fields.name;
    this.savedInventoryRequired = fields.required;
    this.savedInventoryDesc = fields.desc;
    this.savedInventoryGrade = fields.grade;
    this.savedInventorySchool = fields.school;
    this.savedInventoryType = fields.type;
    this.savedInventorySortBy = fields.sortby;
  }

  alreadyInInventory( newItem: RequiredItem, inventory: InventoryItem[]): boolean {
    if (newItem && inventory) {
      return false;
    }
    return true;
  }

  // skipcq: JS-0105
  // It's OK that the `_filters` argument isn't used here, so we'll disable
  // this warning for just his function.
  /* eslint-disable @typescript-eslint/no-unused-vars */
  getItems(_filters: { name?: string; stocked?: number; desc?: string; location?: string; type?: string;}): Observable<RequiredItem[]> {
    return of(MockGradeListService.testItems);
  }

  reloadPage() {
    //Do nothing!
  }

  getSchools(): Observable<School[]> {
    return of(MockGradeListService.testSchools);
  }

  //Probably unessesary
  // skipcq: JS-0105
  getItemById(id: string): Observable<RequiredItem> {
    // If the specified ID is for one of the first two test users,
    // return that user, otherwise return `null` so
    // we can test illegal user requests.
    // If you need more, just add those in too.
    if (id === MockGradeListService.testItems[0]._id) {
      return of(MockGradeListService.testItems[0]);
    } else if (id === MockGradeListService.testItems[1]._id) {
      return of(MockGradeListService.testItems[1]);
    } else {
      return of(null);
    }
  }

  //Todo
  addItem(item: Partial<RequiredItem>): Observable<string> {
    // Send post request to add a new item with the item data as the body.
    // `res.id` should be the MongoDB ID of the newly added `Item`.
    return of('');
  }

  addItemToInventory(item: Partial<InventoryItem>): Observable<string> {
    // Send post request to add a new item with the item data as the body.
    // `res.id` should be the MongoDB ID of the newly added `Item`.
    return of('');
  }

  deleteItem(id: string): Observable<RequiredItem> {
    // Send post request to add a new item with the item data as the body.
    // `res.id` should be the MongoDB ID of the newly added `Item`.
    return of(MockGradeListService.emptyItem);
  }

  modifyMass(newProps:RequiredItem,oldItems:RequiredItem[]) {
    //Copied from grade_list.service for testing purposes.
    const newItems: RequiredItem[] = [];
    for (let i = 0; i < oldItems.length -1; i ++) {
      //id is never overwritten; necessary to delete and replace.
      const baseItem: RequiredItem = {
        _id:undefined,
        name:undefined,
        grade:undefined,
        school:undefined,
        desc:undefined,
        required:undefined,
        type:undefined,
        pack:undefined
      }
      //Create a new array of items, initialized as empty.
      newItems.push(baseItem);

      if (newProps.name != undefined) {
        newItems[i].name = newProps.name;
      } else {
        newItems[i].name = oldItems[i].name;
      }

      if (newProps.required != undefined) {
        newItems[i].required = newProps.required;
      } else {
        newItems[i].required = oldItems[i].required;
      }

      if (newProps.pack != undefined) {
        newItems[i].pack = newProps.pack;
      } else {
        newItems[i].pack = oldItems[i].pack;
      }

      if (newProps.grade != undefined) {
        newItems[i].grade = newProps.grade;
      } else {
        newItems[i].grade = oldItems[i].grade;
      }

      if (newProps.school != undefined) {
        newItems[i].school = newProps.school;
      } else {
        newItems[i].school = oldItems[i].school;
      }

      if (newProps.desc != undefined) {
        newItems[i].desc = newProps.desc;
      } else {
        newItems[i].desc = oldItems[i].desc;
      }

      if (newProps.type != undefined) {
        newItems[i].type = newProps.type;
      } else {
        newItems[i].type = oldItems[i].type;
      }
      this.addItem(newItems[i]).subscribe(); //Need to subscribe for changes to take effect
      this.deleteItem(oldItems[i]._id).subscribe();
    }
  }

  filterItems(items: RequiredItem[], filters: {
    name?: string;
    grade?: string;
    school?: string;
    required?: number;
    desc?: string;
    location?: string;
    type?: string;
  }): RequiredItem[] {
    return []
  }
}
