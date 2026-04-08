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
import { RequiredItem } from './required_item';
import { InventoryItem } from '../inventory/inventory_item';
//import { MatTableModule, MatTableDataSource } from '@angular/material/table';
//import { InventoryCardComponent } from './inventory_card.component';
import { GradeListService } from './grade_list.service';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { School } from './school';
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
  templateUrl: 'grade_list.component.html',
  styleUrls: ['./grade_list.component.scss'],
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
  private gradeListService = inject(GradeListService);
  // snackBar the `MatSnackBar` used to display feedback
  public snackBar = inject(MatSnackBar);

  //dataSource = new MatTableDataSource<InventoryItem>([]);
  itemName = signal<string|undefined>(this.gradeListService.savedGradeListName);
  itemRequired = signal<number|undefined>(this.gradeListService.savedGradeListRequired);
  itemDesc = signal<string|undefined>(this.gradeListService.savedGradeListDesc);
  itemGrade = signal<string|undefined>(this.gradeListService.savedGradeListGrade);
  itemSchool = signal<string|undefined>(this.gradeListService.savedGradeListSchool);
  itemType = signal<string|undefined>(this.gradeListService.savedGradeListType);
  sortBy = signal<string|undefined>(this.gradeListService.savedGradeListSortBy);
  resetVisible = signal<boolean|undefined>(false);//Reset button is initially hidden.
  populateAllowed = true; //Set to false when a populate button is pressed; reset when page reloads. Prevents spamming.

  filteredTypeOptions = computed(() => {
    const input = (this.itemType() || '').toLowerCase();
    if (!input) return this.gradeListService.typeOptions;
    return this.gradeListService.typeOptions.filter(option =>
      option.label.toLowerCase().includes(input) || option.value.toLowerCase().includes(input)
    );
  });

  displayTypeLabel = (value: string | null): string => {
    if (!value) return '';
    const match = this.filteredTypeOptions().find(option => option.value === value);
    return match ? match.label : value;
  };

  filteredGradeOptions = computed(() => {
    return this.gradeListService.gradeOptions;
    // const input = (this.itemGrade() || '').toLowerCase();
    // if (!input) return this.gradeListService.gradeOptions;
    // return this.gradeListService.gradeOptions.filter(option =>
    //   option.label.toLowerCase().includes(input) || option.value.toLowerCase().includes(input)
    // );
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
  private itemRequired$ = toObservable(this.itemRequired);
  private itemDesc$ = toObservable(this.itemDesc);
  private itemGrade$ = toObservable(this.itemGrade);
  private itemSchool$ = toObservable(this.itemSchool);
  private itemType$ = toObservable(this.itemType);

  serverFilteredItems =
    toSignal(
      //Not actually doing any filtering on the server, just need to get Items.
      combineLatest([this.itemName$,this.itemRequired$,this.itemDesc$,this.itemGrade$,this.itemSchool$,this.itemType$]).pipe(
        switchMap(() =>
          this.gradeListService.getItems({}) //If we decide to filter on server, args go her
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

  serverFilteredSchools =
    toSignal(
      //Not actually doing any filtering on the server, just need to get Items.
      combineLatest([this.itemSchool$]).pipe(
        switchMap(() =>
          this.gradeListService.getSchools() //If we decide to filter on server, args go her
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


  filteredItems = computed(() => {
    const currentItems = this.serverFilteredItems();
    //Whenever we sort, we also update saved search.
    //Since this is through service, should be saved between pages.
    this.gradeListService.updateSavedSearch({
      name: this.itemName(),
      required: this.itemRequired(),
      desc: this.itemDesc(),
      grade: this.itemGrade(),
      school: this.itemSchool(),
      type: this.itemType(),
      sortby: this.sortBy()
    });
    return this.gradeListService.filterItems(currentItems, {
      name: this.itemName(),
      required: this.itemRequired(),
      desc: this.itemDesc(),
      grade: this.itemGrade(),
      school: this.itemSchool(),
      type: this.itemType(),
      sortBy: this.sortBy() //Wait is this supposed to be camelcase? Crap...
      // company: this.userCompany(),
    });
  });

  typeFilteredItems = computed(() => {
    const currentItems = this.serverFilteredItems();
    const typedArray: { header: string, items: RequiredItem[] }[] = [];
    let matchingItems = [];
    for (let i = 0; i < this.gradeListService.typeOptions.length - 1; i++) {
      matchingItems = this.gradeListService.filterItems(currentItems, {
        name: this.itemName(),
        type: this.gradeListService.typeOptions[i].value,
        required: this.itemRequired(),
        desc: this.itemDesc(),
        grade: this.itemGrade(),
        school: this.itemSchool(),
        sortBy: this.sortBy()
      })
      //Only sections that have matching items are shown.
      if (matchingItems.length > 0) {
        typedArray.push({
          header: this.gradeListService.typeOptions[i].label,
          items: matchingItems
        })
      }
    }

    return typedArray;
  })

  //Doubly nested, also needs to sort by school...
  schoolFilteredItems = computed(() => {
    const currentItems = this.serverFilteredItems();
    //Doubly nested- contains an array of school headers and grades; grades contains an array of grade_headers and items arrays.
    const schooledArray: {
      school_header: string,
      school_val: string,
      grades: {
        grade_header:string,
        grade_val:string,
        items:RequiredItem[]
      }[];
    }[] = [];

    let matchingGrades = [];
    let matchingItems = [];

    for (let s = 0; s < this.serverFilteredSchools().length; s ++) {
      matchingGrades = [];
      //Inner loop handles grades per school.
      for (let g = 0; g < this.gradeListService.gradeOptions.length; g ++) {
        //Only grades that have matching items are shown.
        //This step sorts by both the current school, and the current grade.
        //Annoyingly, it needs to go through all the items each time; even for grades with no items. (.ie, 12th)
        //If we really wanted to optimized, we probably want to first parition this into schools.
        matchingItems = this.gradeListService.filterItems(currentItems, {
          name: this.itemName(),
          type: this.itemType(),
          required: this.itemRequired(),
          desc: this.itemDesc(),
          grade: this.gradeListService.gradeOptions[g].value,
          school: this.serverFilteredSchools()[s].label, //Yes I know this is poor syntax;  label should really be the longer one...
          sortBy: this.sortBy()
        })
        if (matchingItems.length > 0) {
          matchingGrades.push({
            grade_header: this.gradeListService.gradeOptions[g].label, //This is gonna keep bugging me...
            grade_val: this.gradeListService.gradeOptions[g].value,
            items: matchingItems
          })
        }
      }
      //Only schools that have matching items are shown.
      if (matchingGrades.length > 0) {
        schooledArray.push({
          school_header: this.serverFilteredSchools()[s].value,
          school_val: this.serverFilteredSchools()[s].label,
          grades: matchingGrades
        })
      }
    }
    return schooledArray;
  })

  resetFamilies() {
    const warning = confirm("This will delete ALL grade lists. Are you sure?");
    if (warning == true) {
      this.gradeListService.deleteAll(this.filteredItems());
      this.snackBar.open(
        `Grade Lists reset. Please wait for page to reload...`,
        'OK',
        { duration: 6000 }
      );
      this.gradeListService.reloadPage();
    }
  }

  // revealReset() {
  //   // this.resetVisible = true;
  //   this.resetVisible.set(true);
  //   this.snackBar.open(
  //     `Press 'Clear all Lists' to proceed. This CANNOT be undone. `,
  //     'OK',
  //     { duration: 6000 }
  //   );
  // }

  //Helper function to autofill grade/school for per-grade addition.
  updateOrigin(school_val?: string, grade_val?: string) {
    if (school_val && grade_val) {
      this.gradeListService.originGrade = grade_val;
      this.gradeListService.originSchool = school_val;
    } else { //Reset
      this.gradeListService.originGrade = '';
      this.gradeListService.originSchool = '';
    }
  }

  populateInventory(items: RequiredItem[], school_val: string, grade_val?: string ): number {
    let popArray: RequiredItem[] = [];
    let itemCount = 0;
    let duplicateCount = 0;
    if (grade_val) {
      popArray = this.gradeListService.filterItems(items,{school:school_val,grade:grade_val});
    } else {
      popArray = this.gradeListService.filterItems(items,{school:school_val});
    }
    for (let i = 0; i < popArray.length; i ++) {
      const newItem: InventoryItem = {
        _id: '',
        name:popArray[i].name,
        type:popArray[i].type,
        location:'N/A',
        stocked:0,
        pack:popArray[i].pack,
        desc:popArray[i].desc,
      }
      //Check and Add each item. For some reason alreadyInInventory breaks shit.
      if (this.gradeListService.alreadyInInventory(popArray[i],this.gradeListService.inventoryReference())) {
        duplicateCount ++;
      } else {
        this.gradeListService.addItemToInventory(newItem).subscribe({next: () => {}}); //Removed redundant error check
        //Increment counter for final message.
        itemCount ++;
      }
    }
    //Will need to test for all 3 scenarios. =-(
    if ((duplicateCount > 0) && (itemCount == 0)) {
      this.snackBar.open(
        `All x${duplicateCount.toString()} Items already present in Inventory.`,
        'OK',
        { duration: 5000 }
      );
    } else if ((duplicateCount > 0) && (itemCount > 0)) {
      this.populateAllowed = false; //Prevents spam
      this.snackBar.open(
        `Adding x${itemCount.toString()} new Items from ${school_val}, ${grade_val} to Inventory. Please wait a moment...`,
        'OK',
        { duration: 4000 }
      );
      //Frustrating that this seems necessary. Surely there's a better way to do this?
      this.gradeListService.reloadPage();
    } else {
      this.populateAllowed = false; //Prevents spam
      this.snackBar.open(
        `Adding all x${itemCount.toString()} Items from ${school_val}, ${grade_val} to Inventory. Please wait a moment...`,
        'OK',
        { duration: 4000 }
      );
      //See above
      this.gradeListService.reloadPage();
    }
    return duplicateCount;
  }
}
