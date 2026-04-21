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
import { RouterLink } from '@angular/router';
import { catchError, combineLatest, of, switchMap, tap } from 'rxjs';
import { RequiredItem } from '../grade_list/required_item';
import { InventoryItem } from '../inventory/inventory_item';
import { Family } from '../families/family';
import { School } from '../grade_list/school';
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
    // MatTableModule,
    //InventoryCardComponent,
    MatListModule,
    RouterLink,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule
  ],
})
export class GradeListComponent {
  private shoppingService = inject(ShoppingListService);
  // snackBar the `MatSnackBar` used to display feedback
  public snackBar = inject(MatSnackBar);

  //dataSource = new MatTableDataSource<InventoryItem>([]);
  itemName = signal<string|undefined>(this.shoppingService.savedShoppingListName);
  itemDesc = signal<string|undefined>(this.shoppingService.savedShoppingListDesc);
  itemGrade = signal<string|undefined>(this.shoppingService.savedShoppingListGrade);
  itemSchool = signal<string|undefined>(this.shoppingService.savedShoppingListSchool);
  itemType = signal<string|undefined>(this.shoppingService.savedShoppingListType);
  sortBy = signal<string|undefined>(this.shoppingService.savedShoppingListSortBy);

  filteredTypeOptions = computed(() => {
    const input = (this.itemType() || '').toLowerCase();
    if (!input) return this.shoppingService.inventoryService.typeOptions;
    return this.shoppingService.inventoryService.typeOptions.filter(option =>
      option.label.toLowerCase().includes(input) || option.value.toLowerCase().includes(input)
    );
  });

  displayTypeLabel = (value: string | null): string => {
    if (!value) return '';
    const match = this.filteredTypeOptions().find(option => option.value === value);
    return match ? match.label : value;
  };

  filteredGradeOptions = computed(() => {
    return this.shoppingService.gradeService.gradeOptions;
  });

  displayGradeLabel = (value: string | null): string => {
    if (!value) return '';
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
          this.shoppingService.gradeService.getSchools() //If we decide to filter on server, args go her
        ),
        catchError((err) => {
          if (!(err.error instanceof ErrorEvent)) {
            this.errMsg.set(
              `Problem contacting the server – Error Code: ${err.status}\nMessage: ${err.message}`
            );
          }
          this.snackBar.open(this.errMsg(), 'OK', { duration: 6000 });
          return of<School[]>([]);
        }),
        tap(() => {
        })
      )
    );

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
              `Problem contacting the server – Error Code: ${err.status}\nMessage: ${err.message}`
            );
          }
          this.snackBar.open(this.errMsg(), 'OK', { duration: 6000 });
          return of<InventoryItem[]>([]);
        }),
        tap(() => {
        })
      )
    );

  //Basically identical
  serverFilteredRequirements =
    toSignal(
      //Not actually doing any filtering on the server, just need to get Items.
      combineLatest([this.itemName$,this.itemDesc$,this.itemGrade$,this.itemSchool$,this.itemType$]).pipe(
        switchMap(() =>
          this.shoppingService.gradeService.getItems({}) //If we decide to filter on server, args go her
        ),
        catchError((err) => {
          if (!(err.error instanceof ErrorEvent)) {
            this.errMsg.set(
              `Problem contacting the server – Error Code: ${err.status}\nMessage: ${err.message}`
            );
          }
          this.snackBar.open(this.errMsg(), 'OK', { duration: 6000 });
          return of<RequiredItem[]>([]);
        }),
        tap(() => {
        })
      )
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
              `Problem contacting the server – Error Code: ${err.status}\nMessage: ${err.message}`
            );
          }
          this.snackBar.open(this.errMsg(), 'OK', { duration: 6000 });
          return of<Family[]>([]);
        }),
        tap(() => {
        })
      )
    );

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
    const currentInventory = this.serverFilteredInventory();
    const runningTotal: RequiredItem[] = []; //Running total of requirements based on student grade reqs.
    const finalList: RequiredItem[] = []; //The running total, after inventory filtering.
    const currentFamilies = this.serverFilteredFamilies();
    let gradeReqs: RequiredItem[] = []; //Requirements for each individual student.
    let index = -1;
    //For every student...
    for (let i = 0; i < currentFamilies.length; i ++) {
      for (let s = 0; s < currentFamilies[i].students.length; s ++) {
        //Get all required items for the current student.
        gradeReqs = this.shoppingService.gradeService.filterItems(
          this.serverFilteredRequirements(),
          {grade:currentFamilies[i].students[s].grade, school:currentFamilies[i].students[s].school,}
        );
        //For every requirement of every student...
        for (let r = 0; r < gradeReqs.length; r ++) {
          if (((gradeReqs[r].type !== "backpacks") || (currentFamilies[i].students[s].backpack))
          && ((gradeReqs[r].type !== "headphones") || (currentFamilies[i].students[s].headphones))) {
            //Backpacks and headphones are only counted if the current student requires one.
            index = this.shoppingService.alreadyInReqs(gradeReqs[r], runningTotal);
            if (index == -1) {//Add a new item to the running total...
              runningTotal.push(gradeReqs[r]);
            } else {//or increase requirement for existing item.
              runningTotal[index].required += gradeReqs[r].required;
            }
          }
        }
      }
    }
    //We should now have an array with all the requirements, with correct quantities.
    // Now we subtract our current stock from the requirements.
    for (let i = 0; i < runningTotal.length; i ++) {
      index = this.shoppingService.alreadyInInventory(runningTotal[i],currentInventory);
      if (index == -1) { //If no matching items in inventory, add to shopping list unchanged.
        finalList.push(runningTotal[i]);
      } else { //Otherwise if the inventory has matching items...
        if (currentInventory[index].stocked < runningTotal[i].required) {
          //Push those items, but ONLY if there will still be some items required.
          runningTotal[i].required -= currentInventory[index].stocked;
          finalList.push(runningTotal[i]);
        }
      }
    }

    return finalList;
  });
}
