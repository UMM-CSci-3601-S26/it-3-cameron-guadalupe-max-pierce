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
  selector: 'app-family-list-component',
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
    return this.familyService.gradeOptions;
    // const input = (this.itemGrade() || '').toLowerCase();
    // if (!input) return this.familyService.gradeOptions;
    // return this.familyService.gradeOptions.filter(option =>
    //   option.label.toLowerCase().includes(input) || option.value.toLowerCase().includes(input)
    // );
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
    const typedArray: { header: string, grade_total: number, families: Family[] }[] = [];
    let matchingFamilies = [];
    let totalStudents = 0;
    for (let g = 0; g < this.familyService.gradeOptions.length; g++) {
      totalStudents = 0;
      matchingFamilies = this.familyService.filterFamilies(currentItems, {
        name: this.itemName(),
        grade: this.familyService.gradeOptions[g].value,
        school: this.itemSchool(),
        students: this.itemStudents(),
        time: this.itemTime(),
        sortBy: this.sortBy()
      })
      //Count how many of each family's students are actually in the current grade
      //This is necessary because a family is listed if ANY of their students match the grade.
      //Otherwise, a family with multiple students in the same grade would only count as one.
      for (let f = 0; f < matchingFamilies.length; f ++) {
        for (let s = 0; s < matchingFamilies[f].students.length; s ++) {
          if (matchingFamilies[f].students[s].grade == this.familyService.gradeOptions[g].value) {
            totalStudents ++;
          }
        }
      }

      //Only sections that have matching items are shown.
      if (matchingFamilies.length > 0) {
        typedArray.push({
          header: this.familyService.gradeOptions[g].label,
          grade_total: totalStudents,
          families: matchingFamilies
        })
      }
    }
    return typedArray;
  })

  schoolFilteredFamilies = computed(() => {
    const currentItems = this.serverFilteredItems();
    const typedArray: { header: string, school_total: number, families: Family[] }[] = [];
    let matchingFamilies = [];
    let totalStudents = 0;
    for (let i = 0; i < this.serverFilteredSchools().length; i++) {
      totalStudents = 0;
      matchingFamilies = this.familyService.filterFamilies(currentItems, {
        name: this.itemName(),
        grade: this.itemGrade(),
        school: this.serverFilteredSchools()[i].label, //still dumb, see grade_list
        students: this.itemStudents(),
        time: this.itemTime(),
        sortBy: this.sortBy()
      })
      //Count how many of each family's students are actually in the current school
      //Same thing as above
      for (let f = 0; f < matchingFamilies.length; f ++) {
        for (let s = 0; s < matchingFamilies[f].students.length; s ++) {
          if (matchingFamilies[f].students[s].school == this.serverFilteredSchools()[i].label) {
            totalStudents ++;
          }
        }
      }

      //Only sections that have matching items are shown.
      if (matchingFamilies.length > 0) {
        typedArray.push({
          header: this.serverFilteredSchools()[i].value,
          school_total: totalStudents,
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
          school_total:number,
          grades: {
            grade_total:number,
            grade_header:string,
            families:Family[]
          }[];
        }[] = [];
    let  matchingGrades = [];
    let matchingFamilies = [];
    let schoolTotal = 0;
    let gradeTotal = 0;

    for (let s = 0; s < this.serverFilteredSchools().length; s ++) {
      schoolTotal = 0;
      matchingGrades = [];
      //Inner loop handles grades per school.
      for (let g = 0; g < this.familyService.gradeOptions.length; g ++) {
        gradeTotal = 0;
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
        //Some families may match grade, but not school. Only students w/ both properties are counted.
        for (let f = 0; f < matchingFamilies.length; f ++) {
          for (let c = 0; c < matchingFamilies[f].students.length; c ++) {
            if (matchingFamilies[f].students[c].school == this.serverFilteredSchools()[s].label
            && matchingFamilies[f].students[c].grade == this.familyService.gradeOptions[g].value) {
              gradeTotal ++;
            }
          }
        }

        if (gradeTotal > 0) {
          schoolTotal += gradeTotal; //School total is the sum of all grades.
          matchingGrades.push({
            grade_header: this.familyService.gradeOptions[g].label,
            grade_total: gradeTotal,
            families: matchingFamilies
          })
        }
      }
      //Only schools that have matching items are shown.
      if (schoolTotal > 0) {
        schooledArray.push({
          school_header: this.serverFilteredSchools()[s].value,
          school_total: schoolTotal,
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
