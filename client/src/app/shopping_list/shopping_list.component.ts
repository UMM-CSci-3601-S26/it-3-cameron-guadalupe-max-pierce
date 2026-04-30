import { Component, computed, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { combineLatest, catchError, of, switchMap, tap } from 'rxjs';
import { RequiredItem } from '../grade_list/required_item';
import { InventoryItem } from '../inventory/inventory_item';
import { Family } from '../families/family';
// import { School } from '../grade_list/school';
//import { MatTableModule, MatTableDataSource } from '@angular/material/table';
//import { InventoryCardComponent } from './inventory_card.component';
import { ShoppingListService } from './shopping_list.service';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatToolbar } from '@angular/material/toolbar';

/**
 * A component that displays a list of users, either as a grid
 * of cards or as a vertical list.
 *
 * The component supports local filtering by name and/or company,
 * and remote filtering (i.e., filtering by the server) by
 * role and/or age. These choices are fairly arbitrary here,
 * but in "real" projects you want to think about where it
 * makes the most sense to do the filtering.
 */
@Component({
  selector: 'app-grade-list-component',
  templateUrl: 'shopping_list.component.html',
  styleUrls: ['./shopping_list.component.scss'],
  providers: [],
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatRadioModule,
    MatToolbar,
    //MatTableModule,
    //InventoryCardComponent,
    MatListModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule
  ],
})
export class ShoppingListComponent {
  public shoppingService = inject(ShoppingListService);
  // snackBar the `MatSnackBar` used to display feedback
  public snackBar = inject(MatSnackBar);

  //dataSource = new MatTableDataSource<InventoryItem>([]);
  itemName = signal<string|undefined>(this.shoppingService.savedShoppingListName);
  itemDesc = signal<string|undefined>(this.shoppingService.savedShoppingListDesc);
  itemGrade = signal<string|undefined>(this.shoppingService.savedShoppingListGrade);
  itemSchool = signal<string|undefined>(this.shoppingService.savedShoppingListSchool);
  itemType = signal<string|undefined>(this.shoppingService.savedShoppingListType);
  sortBy = signal<string|undefined>(this.shoppingService.savedShoppingListSortBy);
  subtractInventory = signal<boolean|undefined>(this.shoppingService.savedSubtractInventory);

  filteredTypeOptions = computed(() => {
    const input = (this.itemType() || '').toLowerCase();
    const typeOptions = this.shoppingService.inventoryService.typeOptions();
    if (!input) return typeOptions;
    return typeOptions.filter(option =>
      option.label.toLowerCase().includes(input) || option.value.toLowerCase().includes(input)
    );
  });

  displayTypeLabel = (value: string | null): string => {
    if (!value) return '';
    const match = this.filteredTypeOptions().find(option => option.value === value);
    return match ? match.label : value;
  };

  filteredGradeOptions = computed(() => {
    return this.shoppingService.gradeListService.gradeOptions;
  });

  displayGradeLabel = (value: string | null): string => {
    // if (!value) return '';
    const match = this.filteredGradeOptions().find(option => option.value === value);
    return match ? match.label : value;
  };

  //Can't figure out how to get label search working for an observable?

  errMsg = signal<string | undefined>(undefined);

  //Do we still need to define observables just to make sure items are retrieved when values change?
  //Even if we're not doing filtering on the server?
  private itemName$ = toObservable(this.itemName);
  private itemDesc$ = toObservable(this.itemDesc);
  private itemGrade$ = toObservable(this.itemGrade);
  private itemSchool$ = toObservable(this.itemSchool);
  private itemType$ = toObservable(this.itemType);

  serverFilteredSchools =
    toSignal(
      //Not actually doing any filtering on the server, just need to get Items.
      combineLatest([this.itemSchool$]).pipe(
        switchMap(() =>
          this.shoppingService.gradeListService.getSchools() //If we decide to filter on server, args go her
        ),
        catchError((err) => {
          if (!(err.error instanceof ErrorEvent)) {
            this.errMsg.set(
              `Problem contacting the server - Error Code: ${err.status}\nMessage: ${err.message}`
            );
          }
          this.snackBar.open(this.errMsg(), 'OK', { duration: 6000 });
          return of([]);
        }),
        tap(() => {
        })
      ),
      { initialValue: [] }
    );

  filteredSchoolOptions = computed(() => {
    return this.serverFilteredSchools();
  });

  serverFilteredInventory =
    toSignal(
      //Not actually doing any filtering on the server, just need to get Items.
      combineLatest([this.itemName$,this.itemDesc$,this.itemGrade$,this.itemSchool$,this.itemType$]).pipe(
        switchMap(() =>
          this.shoppingService.inventoryService.getItems({}) //If we decide to filter on server, args go her
        ),
        catchError((err) => {
          if (!(err.error instanceof ErrorEvent)) {
            this.errMsg.set(
              `Problem contacting the server - Error Code: ${err.status}\nMessage: ${err.message}`
            );
          }
          this.snackBar.open(this.errMsg(), 'OK', { duration: 6000 });
          return of([]);
        }),
        tap(() => {
        })
      ),
      { initialValue: [] }
    );

  //Basically identical
  serverFilteredRequirements =
    toSignal(
      //Not actually doing any filtering on the server, just need to get Items.
      combineLatest([this.itemName$,this.itemDesc$,this.itemGrade$,this.itemSchool$,this.itemType$]).pipe(
        switchMap(() =>
          this.shoppingService.gradeListService.getItems({}) //If we decide to filter on server, args go her
        ),
        catchError((err) => {
          if (!(err.error instanceof ErrorEvent)) {
            this.errMsg.set(
              `Problem contacting the server - Error Code: ${err.status}\nMessage: ${err.message}`
            );
          }
          this.snackBar.open(this.errMsg(), 'OK', { duration: 6000 });
          return of([]);
        }),
        tap(() => {
        })
      ),
      { initialValue: [] }
    );

  serverFilteredFamilies =
    toSignal(
      //Not actually doing any filtering on the server, just need to get Items.
      combineLatest([this.itemName$,this.itemDesc$,this.itemGrade$,this.itemSchool$,this.itemType$]).pipe(
        switchMap(() =>
          this.shoppingService.familyService.getFamilies({}) //If we decide to filter on server, args go her
        ),
        catchError((err) => {
          if (!(err.error instanceof ErrorEvent)) {
            this.errMsg.set(
              `Problem contacting the server - Error Code: ${err.status}\nMessage: ${err.message}`
            );
          }
          this.snackBar.open(this.errMsg(), 'OK', { duration: 6000 });
          return of([]);
        }),
        tap(() => {
        })
      ),
      { initialValue: [] }
    );

  calculateShoppingList = (inventory: InventoryItem[], requirements: RequiredItem[], families: Family[], subtractInventory: boolean): RequiredItem[] => {
    const runningTotal: RequiredItem[] = []; //Running total of requirements based on student grade reqs.
    let finalList: RequiredItem[] = []; //The running total, after inventory filtering.
    let gradeReqs: RequiredItem[] = []; //Requirements for each individual student.
    let index = -1;
    //For every student...
    for (let i = 0; i < families.length; i ++) {
      for (let s = 0; s < families[i].students.length; s ++) {
        //if school and grade filters are provided, only consider students with matching school and grade.
        if (((this.itemSchool() == '') || (families[i].students[s].school.toLowerCase().indexOf(this.itemSchool().toLowerCase()) !== -1))
        && ((this.itemGrade() == '') || (families[i].students[s].grade.toLowerCase().indexOf(this.itemGrade().toLowerCase()) !== -1))) {
          //Get all required items for the current student.
          gradeReqs = this.shoppingService.gradeListService.filterItems(requirements, {grade:families[i].students[s].grade, school:families[i].students[s].school,});
          //For every requirement of every student...
          for (let r = 0; r < gradeReqs.length; r ++) {
            if (((gradeReqs[r].type !== "backpacks") || (families[i].students[s].backpack))
            && ((gradeReqs[r].type !== "headphones") || (families[i].students[s].headphones))) {
              //Backpacks and headphones are only counted if the current student requires one.
              index = this.shoppingService.alreadyInReqs(gradeReqs[r], runningTotal);
              if (index == -1) {//Add a new item to the running total...
                runningTotal.push({ //We need to CREATE a new required item, otherwise successive calls update the same set of items.
                  name: gradeReqs[r].name,
                  type: gradeReqs[r].type,
                  desc: gradeReqs[r].desc,
                  grade:'', //No longer relevant
                  school:'',
                  required: gradeReqs[r].required,
                  pack: gradeReqs[r].pack,
                  _id:undefined,
                });
              } else {//or increase requirement for existing item.
                runningTotal[index].required += gradeReqs[r].required;
              }
            }
          }
        }
      }
    }
    //We should now have an array with all the requirements, with correct quantities.
    // Now we subtract our current stock from the requirements.
    if (subtractInventory) {
      for (let i = 0; i < runningTotal.length; i ++) {
        index = this.shoppingService.alreadyInInventory(runningTotal[i],inventory);
        if (index == -1) { //If no matching items in inventory, add to shopping list unchanged.
          finalList.push(runningTotal[i]);
        } else { //Otherwise if the inventory has matching items...
          if (inventory[index].stocked < runningTotal[i].required) {
            //Push those items, but ONLY if there will still be some items required.
            runningTotal[i].required -= inventory[index].stocked;
            finalList.push(runningTotal[i]);
          }
        }
      }
    } else {
      finalList = runningTotal;
    }

    return finalList;
  };


  shoppingListItems = computed(() => {
    //Whenever we sort, we also update saved search.
    this.shoppingService.updateSavedSearch({
      name: this.itemName(),
      desc: this.itemDesc(),
      grade: this.itemGrade(),
      school: this.itemSchool(),
      type: this.itemType(),
      sortby: this.sortBy()
    });

    const shoppingList = this.calculateShoppingList(
      this.serverFilteredInventory() ?? [],
      this.serverFilteredRequirements() ?? [],
      this.serverFilteredFamilies() ?? [],
      this.subtractInventory()
    );

    return this.shoppingService.gradeListService.filterItems(shoppingList, {name:this.itemName(), type:this.itemType(), sortBy:this.sortBy(), desc:this.itemDesc()});
  });

  typeFilteredShoppingListItems = computed(() => {
    const currentItems = this.shoppingListItems();
    const typedArray: { header: string, items: RequiredItem[] }[] = [];
    let matchingItems = [];
    for (let i = 0; i < this.shoppingService.gradeListService.typeOptions().length - 1; i++) {
      matchingItems = this.shoppingService.gradeListService.filterItems(currentItems, {
        name: this.itemName(),
        type: this.shoppingService.gradeListService.typeOptions()[i].value,
        required: 0,
        desc: this.itemDesc(),
        grade: this.itemGrade(),
        school: this.itemSchool(),
        sortBy: this.sortBy()
      })
      //Only sections that have matching items are shown.
      if (matchingItems.length > 0) {
        typedArray.push({
          header: this.shoppingService.gradeListService.typeOptions()[i].label,
          items: matchingItems
        })
      }
    }

    return typedArray;
  })

}
