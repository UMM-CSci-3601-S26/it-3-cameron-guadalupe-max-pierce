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
import { Family } from './family';
import { School } from '../grade_list/school';
//import { MatTableModule, MatTableDataSource } from '@angular/material/table';
//import { InventoryCardComponent } from './inventory_card.component';
import { FamilyService } from './family.service';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

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
  selector: 'app-inventory-list-component',
  templateUrl: 'family_list.component.html',
  styleUrls: ['./family_list.component.scss'],
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
    // MatTableModule,
    //InventoryCardComponent,
    MatListModule,
    RouterLink,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule
  ],
})
export class FamilyListComponent {
  private familyService = inject(FamilyService);
  // snackBar the `MatSnackBar` used to display feedback
  private snackBar = inject(MatSnackBar);

  itemName = signal<string|undefined>(this.familyService.savedFamilyName);
  itemGrade = signal<string|undefined>(this.familyService.savedFamilyGrade);
  itemSchool = signal<string|undefined>(this.familyService.savedFamilySchool);
  itemStudents = signal<number|undefined>(this.familyService.savedFamilyStudents);
  itemTime = signal<string|undefined>(this.familyService.savedFamilyTime);
  sortBy = signal<string|undefined>(this.familyService.savedFamilySortBy); //When undefined, sorts by name.
  resetVisible = signal<boolean|undefined>(false);//Reset button is initially hidden.

  filteredGradeOptions = computed(() => {
    const input = (this.itemGrade() || '').toLowerCase();
    if (!input) return this.familyService.gradeOptions;
    return this.familyService.gradeOptions.filter(option =>
      option.label.toLowerCase().includes(input) || option.value.toLowerCase().includes(input)
    );
  });

  //Still not sure what this is doing.
  displayTypeLabel = (value: string | null): string => {
    if (!value) return '';
    const match = this.filteredGradeOptions().find(option => option.value === value);
    return match ? match.label : value;
  };

  errMsg = signal<string | undefined>(undefined);


  //Do we still need to define observables just to make sure items are retrieved when values change?
  //Even if we're not doing filtering on the server?
  private itemName$ = toObservable(this.itemName);
  private itemGrade$ = toObservable(this.itemGrade);
  private itemSchool$ = toObservable(this.itemSchool);
  private itemStudents$ = toObservable(this.itemStudents);
  private itemTime$ = toObservable(this.itemTime);

  serverFilteredItems =
    toSignal(
      //Not actually doing any filtering on the server, just need to get Items.
      combineLatest([this.itemName$,this.itemGrade$,this.itemSchool$,this.itemStudents$,this.itemTime$]).pipe(
        switchMap(() =>
          this.familyService.getFamilies({}) //If we decide to filter on server, args go her
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

  serverFilteredSchools =
    toSignal(
      //Not actually doing any filtering on the server, just need to get Items.
      combineLatest([this.itemSchool$]).pipe(
        switchMap(() =>
          this.familyService.getSchools() //If we decide to filter on server, args go her
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


  filteredFamilies = computed(() => {
    const currentItems = this.serverFilteredItems();
    //Whenever we sort, we also update saved search.
    //Since this is through service, should be saved between pages.
    this.familyService.updateSavedSearch({
      name: this.itemName(),
      grade: this.itemGrade(),
      school: this.itemSchool(),
      students: this.itemStudents(),
      time: this.itemTime(),
      sortby: this.sortBy()
    });
    return this.familyService.filterFamilies(currentItems, {
      name: this.itemName(),
      grade: this.itemGrade(),
      school: this.itemSchool(),
      students: this.itemStudents(),
      time: this.itemTime(),
      sortBy: this.sortBy()
    });
  });

  gradeFilteredFamilies = computed(() => {
    const currentItems = this.serverFilteredItems();
    const typedArray: { header: string, families: Family[] }[] = [];
    let matchingFamilies = [];
    for (let i = 0; i < this.familyService.gradeOptions.length - 1; i++) {
      matchingFamilies = this.familyService.filterFamilies(currentItems, {
        name: this.itemName(),
        grade: this.familyService.gradeOptions[i].value,
        school: this.itemSchool(),
        students: this.itemStudents(),
        time: this.itemTime(),
        sortBy: this.sortBy()
      })
      //Only sections that have matching items are shown.
      if (matchingFamilies.length > 0) {
        typedArray.push({
          header: this.familyService.gradeOptions[i].label,
          families: matchingFamilies
        })
      }
    }
    return typedArray;
  })

  schoolFilteredFamilies = computed(() => {
    const currentItems = this.serverFilteredItems();
    const typedArray: { header: string, families: Family[] }[] = [];
    let matchingFamilies = [];
    for (let i = 0; i < this.serverFilteredSchools().length - 1; i++) {
      matchingFamilies = this.familyService.filterFamilies(currentItems, {
        name: this.itemName(),
        grade: this.itemGrade(),
        school: this.serverFilteredSchools()[i].label, //still dumb, see grade_list
        students: this.itemStudents(),
        time: this.itemTime(),
        sortBy: this.sortBy()
      })
      //Only sections that have matching items are shown.
      if (matchingFamilies.length > 0) {
        typedArray.push({
          header: this.serverFilteredSchools()[i].value,
          families: matchingFamilies
        })
      }
    }
    return typedArray;
  })

  gradeAndSchoolFilteredFamilies = computed(() => {
    const currentItems = this.serverFilteredItems();
    const schooledArray: {
          school_header: string,
          grades: {
            grade_header:string,
            families:Family[]
          }[];
        }[] = [];
    const matchingGrades = [];
    let matchingFamilies = [];

    for (let s = 0; s < this.serverFilteredSchools().length - 1; s ++) {
      //Inner loop handles grades per school.
      for (let g = 0; g < this.familyService.gradeOptions.length - 1; g ++) {
        //Only grades that have matching items are shown.
        //This step sorts by both the current school, and the current grade.
        //Annoyingly, it needs to go through all the items each time; even for grades with no items. (.ie, 12th)
        //If we really wanted to optimized, we probably want to first parition this into schools.
        matchingFamilies = this.familyService.filterFamilies(currentItems, {
          name: this.itemName(),
          time: this.itemTime(),
          grade: this.familyService.gradeOptions[g].value,
          school: this.serverFilteredSchools()[s].label, //Yes I know this is poor syntax;  label should really be the longer one...
          sortBy: this.sortBy()
        })
        if (matchingFamilies.length > 0) {
          matchingGrades.push({
            grade_header: this.familyService.gradeOptions[g].label,
            families: matchingFamilies
          })
        }
      }
      //Only schools that have matching items are shown.
      if (matchingGrades.length > 0) {
        schooledArray.push({
          school_header: this.serverFilteredSchools()[s].value,
          grades: matchingGrades
        })
      }
    }
    return schooledArray;
  })

  revealReset() {
    this.resetVisible.set(true);
    this.snackBar.open(
      `Press 'Clear all Families' to proceed. This CANNOT be undone. `,
      'OK',
      { duration: 6000 }
    );
  }

  //Not relevant for families? Will still want a clear all families button.
  // resetLocations() {
  //   const tempItem: InventoryItem = {
  //     _id:undefined,
  //     location:"N/A",
  //     stocked:undefined,
  //     name:undefined,
  //     type:undefined,
  //     desc:undefined
  //   }
  //   this.familyService.modifyMass(tempItem,this.filteredItems());
  //   //TODO, We need to update something, such that the page doesn't need manual reloading...
  //   this.snackBar.open(
  //     `Locations reset. Please reload this page to see your changes. `,
  //     'OK',
  //     { duration: 6000 }
  //   );
  // }
}
