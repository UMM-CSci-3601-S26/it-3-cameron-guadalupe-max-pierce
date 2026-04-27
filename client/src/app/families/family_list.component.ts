import { Component, computed, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterLink } from '@angular/router';
import { catchError, combineLatest, of, switchMap, tap } from 'rxjs';
import { Family } from './family';
import { Student } from './student';
import { School } from '../grade_list/school';
import { RequiredItem } from '../grade_list/required_item';
//import { MatTableModule, MatTableDataSource } from '@angular/material/table';
//import { InventoryCardComponent } from './inventory_card.component';
import { FamilyService } from './family.service';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import jsPDF from 'jspdf';
//import { MatToolbar } from '@angular/material/toolbar';

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
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatRadioModule,
    MatCheckboxModule,
    //MatToolbar,
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
  public familyService = inject(FamilyService);
  // snackBar the `MatSnackBar` used to display feedback
  private snackBar = inject(MatSnackBar);

  itemName = signal<string|undefined>(this.familyService.savedFamilyName);
  itemGrade = signal<string|undefined>(this.familyService.savedFamilyGrade);
  itemSchool = signal<string|undefined>(this.familyService.savedFamilySchool);
  itemStudents = signal<number|undefined>(this.familyService.savedFamilyStudents);
  itemTime = signal<string|undefined>(this.familyService.savedFamilyTime);
  sortBy = signal<string|undefined>(this.familyService.savedFamilySortBy); //When undefined, sorts by name.
  //resetVisible = signal<boolean|undefined>(false);//Reset button is initially hidden.


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

  serverFilteredFamilies =
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
      combineLatest([this.itemName$,this.itemGrade$,this.itemSchool$,this.itemStudents$,this.itemTime$]).pipe(
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

  serverFilteredItems =
    toSignal(
      //Not actually doing any filtering on the server, just need to get Items.
      combineLatest([this.itemName$,this.itemGrade$,this.itemSchool$,this.itemStudents$,this.itemTime$]).pipe(
        switchMap(() =>
          this.familyService.getItems() //If we decide to filter on server, args go her
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

  filteredSchoolOptions = computed(() => {
    return this.serverFilteredSchools();
  });

  gradeReqs = computed(() => {
    return this.serverFilteredItems();
  })


  filteredFamilies = computed(() => {
    const currentItems = this.serverFilteredFamilies();
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
    const currentItems = this.serverFilteredFamilies();
    const typedArray: { header: string, grade_total: number, value: string, families: Family[] }[] = [];
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
          value: this.familyService.gradeOptions[g].value,
          grade_total: totalStudents,
          families: matchingFamilies
        })
      }
    }
    return typedArray;
  })

  schoolFilteredFamilies = computed(() => {
    const currentItems = this.serverFilteredFamilies();
    const typedArray: { header: string, school_total: number, value: string, families: Family[] }[] = [];
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
          value: this.serverFilteredSchools()[i].label,
          header: this.serverFilteredSchools()[i].value,
          school_total: totalStudents,
          families: matchingFamilies
        })
      }
    }
    return typedArray;
  })

  gradeAndSchoolFilteredFamilies = computed(() => {
    //Currently, if a family has students in multiple schools, they can get counted for grades from each school...
    //Even when they actually have no matching students for that slot.
    const currentItems = this.serverFilteredFamilies();
    const schooledArray: {
          school_header: string,
          school_total:number,
          school_value:string,
          grades: {
            grade_value:string,
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
            grade_value: this.familyService.gradeOptions[g].value,
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
          grades: matchingGrades,
          school_value: this.serverFilteredSchools()[s].label
        })
      }
    }
    return schooledArray;
  })

  // revealReset() {
  //   this.resetVisible.set(true);
  //   this.snackBar.open(
  //     `Press 'Clear all Families' to proceed. This CANNOT be undone. `,
  //     'OK',
  //     { duration: 6000 }
  //   );
  // }

  //Not a great way to test this since it reloads the page...
  resetStudents() {
    const warning = confirm("This will delete ALL families. Are you sure?");
    if (warning == true) {
      this.familyService.deleteAll(this.serverFilteredFamilies());
      this.snackBar.open(
        `Family List reset. Please wait for page to reload...`,
        'OK',
        { duration: 6000 }
      );
      this.familyService.reloadPage();
    }
  }
  //Line variable, tracks current PDF position, resets when called.
  private line = 0;

  //Helper function to determine when to do page breaks
  lineBreak(document: jsPDF, line_height: number, start_pos:number) {
    if ((this.line*line_height) + start_pos >= document.internal.pageSize.getHeight() - 14) {
      document.addPage();
      this.line = 1;
      return true;
    } else {
      this.line ++;
      return false;
    }
  }

  //Template courtesy of feawsted
  exportPDF(family_id) {
    this.familyService.getFamilyById(family_id).subscribe({
      error: (err) => {
        this.snackBar.open(`Failed to load checklist: ${err.message}`, 'OK', { duration: 6000 });
      },
      next: (family) => {
        this.snackBar.open(`Generating ${family.last_name} checklist, please wait...`, 'OK', { duration: 4000 });
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 14;
        const stuMargin = 6; //Additional margin for student subsections.
        const itemMargin = 6; //Additional margin for item sub-subsections.
        const checkSize = 4;
        const lineHeight = 6;
        const startPos = 18;
        this.line = 1;

        // Header block
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`${family.last_name} Checklist`, margin, startPos-3);

        //Line
        doc.line(margin, startPos, pageWidth - margin, startPos);

        //General family info
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Primary Pickup Person - ${family.first_name} ${family.last_name}`, margin, startPos+lineHeight);
        this.lineBreak(doc,lineHeight,startPos);
        if (family.first_name_alt != '') {
          doc.text(`Alternate Pickup Person - ${family.first_name_alt} ${family.last_name_alt}`, margin, startPos+(lineHeight*this.line));
          this.lineBreak(doc,lineHeight,startPos);
        }
        doc.text(`Contact Info - ${family.phone} - ${family.email}`, margin, startPos+(lineHeight*this.line));
        this.lineBreak(doc,lineHeight,startPos);
        doc.text(`Pickup Time - ${family.time}`, margin, startPos+(lineHeight*this.line));
        this.lineBreak(doc,lineHeight,startPos);

        //Line #2
        doc.line(margin, startPos+(lineHeight*this.line), pageWidth - margin, startPos+(lineHeight*this.line));
        this.lineBreak(doc,lineHeight,startPos);

        //Student subsections
        for (let s = 0; s < family.students.length; s ++) {
          const studentReqs = this.getStudentRequirements(family.students[s]);
          doc.setFont('helvetica', 'bold');
          doc.text(`Student #${s+1} - ${family.students[s].first_name} ${family.students[s].last_name}`, margin + stuMargin, startPos+(lineHeight*this.line));
          doc.setFont('helvetica', 'normal');
          this.lineBreak(doc,lineHeight,startPos);
          if ((family.students[s].teacher == '') || (family.students[s].teacher == undefined)) {
            doc.text(`${family.students[s].school} - ${this.familyService.getGradeLabel(family.students[s].grade)} - ${studentReqs.length} items`, margin + stuMargin, startPos+(lineHeight*this.line));
          } else {
            doc.text(`${family.students[s].school} - ${family.students[s].teacher}'s ${this.familyService.getGradeLabel(family.students[s].grade)} class - ${studentReqs.length} items`, margin + stuMargin, startPos+(lineHeight*this.line));
          }
          this.lineBreak(doc,lineHeight,startPos);

          //Requirements per student
          doc.setFont('helvetica', 'italic');
          for (let r = 0; r < studentReqs.length; r ++) {
            //Checkbox
            doc.rect(margin + stuMargin + itemMargin - (checkSize+1), startPos+(lineHeight*this.line) - checkSize + 1, checkSize, checkSize);
            //Requirement
            let itemString = '';
            if (studentReqs[r].required > 1) {
              itemString = itemString.concat(`x${studentReqs[r].required} ${studentReqs[r].name}`);
            } else {
              itemString = itemString.concat(`${studentReqs[r].name}`);
            }

            if (studentReqs[r].desc != '') {
              itemString = itemString.concat(` - ${studentReqs[r].desc}`);
            }

            if (studentReqs[r].pack > 1) {
              itemString = itemString.concat(` - ${studentReqs[r].pack} ct.`);
            }

            doc.text(itemString, margin + stuMargin + itemMargin, startPos+(lineHeight*this.line));
            this.lineBreak(doc,lineHeight,startPos);
          }
          doc.setFont('helvetica', 'normal');

          //Student break
          doc.line(margin + stuMargin, startPos+(lineHeight*this.line), pageWidth - margin, startPos+(lineHeight*this.line));
          this.lineBreak(doc,lineHeight,startPos);
        }
        //Save and export
        doc.save(family.last_name.concat(' Checklist.pdf'));
      }
    });
  }

  getStudentRequirements(student:Student) {
    //Get all required items for the current student, based on grade and school.
    const gradeReqs = this.familyService.filterItems(this.gradeReqs(),student);
    const runningTotal: RequiredItem[] = [];
    //For every requirement of every student...
    for (let r = 0; r < gradeReqs.length; r ++) {
      if (((gradeReqs[r].type !== "backpacks") || (student.backpack))
      && ((gradeReqs[r].type !== "headphones") || (student.headphones))) {
        //Backpacks and headphones are only counted if the current student requires one.
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
      }
    }
    return runningTotal;
  }

  exportToCSV() {
    const header = ['First Name', 'Last Name', 'Time', 'Students'];
    const rows = this.serverFilteredFamilies().map(family => [
      family.first_name,
      family.last_name,
      family.time,
      family.students.map(s => `${s.first_name} (${s.grade} at ${s.school})`).join('; ')
    ]);

    const csvContent = [header, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "families.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);


  }
}
