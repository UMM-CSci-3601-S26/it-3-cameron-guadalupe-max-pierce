import { Component, computed, inject, signal, Signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Router } from '@angular/router';
import { FamilyService } from './family.service';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of, combineLatest, tap } from 'rxjs';
import { RouterLink } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { School } from '../grade_list/school';
import { Family } from './family';
//import { Location } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
//import { Family } from './family';
import { Student } from './student';
import { Time } from './time';

//How TF is the add family survey validating this???

@Component({
  selector: 'app-modify-family-survey',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatRadioModule,
    MatButtonModule
  ],
  templateUrl: './modify_family_survey.component.html',
  styleUrls: ['./modify_family_survey.component.scss']
})
export class ModifyFamilySurveyComponent {
  private familyService = inject(FamilyService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private schoolInput = signal('');
  private timeInput = signal('');

  filteredGradeOptions = computed(() => {
    return this.familyService.gradeOptions;
  });

  errMsg = signal('');

  //Good lord, why aren't these form controls? Syncing these is a nuisance...
  surveyFamilyLastName = '';
  surveyFamilyFirstName = '';
  surveyFamilyLastNameAlt = '';
  surveyFamilyFirstNameAlt = '';
  surveyParentEmail = '';
  surveyFamilyTime = '';
  initialized = false;
  surveyChildren: Student[] = [];

  //Get schools from the database to allow for autofill and limiting inputs.
  private schoolInput$ = toObservable(this.schoolInput);
  private timeInput$ = toObservable(this.timeInput);

  serverFilteredSchools =
    toSignal(
      //Not actually doing any filtering on the server, just need to get Items.
      combineLatest([this.schoolInput$]).pipe(
        switchMap(() =>
          this.familyService.getSchools()
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

  serverFilteredTimes =
    toSignal(
      //Not actually doing any filtering on the server, just need to get Items.
      combineLatest([this.timeInput$]).pipe(
        switchMap(() =>
          this.familyService.getTimes()
        ),
        catchError((err) => {
          if (!(err.error instanceof ErrorEvent)) {
            this.errMsg.set(
              `Problem contacting the server – Error Code: ${err.status}\nMessage: ${err.message}`
            );
          }
          this.snackBar.open(this.errMsg(), 'OK', { duration: 6000 });
          return of<Time[]>([]);
        }),
        tap(() => {
        })
      )
    );

  filteredTimeOptions = computed(() => {
    return this.serverFilteredTimes();
  });

  filteredSchoolOptions = computed(() => {
    return this.serverFilteredSchools();
  });

  gradeOptions = this.familyService.gradeOptions;

  error = signal({ help: '', httpResponse: '', message: '' });

  private route = inject(ActivatedRoute);

  family: Signal<Family> = toSignal(
    this.route.paramMap.pipe(
      // Map the paramMap into the id
      map((paramMap: ParamMap) => paramMap.get('id')),
      // Maps the `id` string into the Observable<InventoryItem>,
      // which will emit zero or one values depending on whether there is a
      // `Item` with that ID.
      switchMap((id: string) => this.familyService.getFamilyById(id)),
      catchError((_err) => {
        this.error.set({
          help: 'There was a problem loading the item – try again.',
          httpResponse: _err.message,
          message: _err.error?.title,
        });
        return of();
      })
    )
  );

  //All the following stupid BS is necessary because we aren't using fricking form controls and family isn't initialized properly...
  // surveyChildren: Student[] = this.family().students;

  constructor() {
    this.initFamily();
  }

  initFamily() {
    if (this.family() != undefined) {
      this.surveyFamilyFirstName = this.family().first_name;
      this.surveyFamilyLastName = this.family().last_name;
      this. surveyFamilyLastNameAlt = this.family().last_name_alt;
      this.surveyFamilyFirstNameAlt = this.family().first_name_alt;
      this.surveyParentEmail = this.family().email;
      this.surveyFamilyTime = this.family().time;
      this.surveyChildren = this.family().students;
      this.initialized = true;
    } else {
      setTimeout(() => {
        this.initFamily();
      }, 200); //This is probably a horrible way of doing this...
    }
  }

  addChild(): void {
    this.surveyChildren.push({
      first_name: '',
      last_name: this.surveyFamilyLastName,
      school: '',
      grade: '',
      teacher: '',
      backpack: false,
      headphones: false,
    });
  }

  removeChild(index: number): void {
    if (this.surveyChildren.length > 1) {
      this.surveyChildren.splice(index, 1);
    }
  }

  resetSurvey(): void {
    this.surveyFamilyLastName = this.family().last_name;
    this.surveyFamilyFirstName = this.family().first_name;
    this.surveyFamilyLastNameAlt = this.family().last_name_alt;
    this.surveyFamilyFirstNameAlt = this.family().first_name_alt;
    this.surveyParentEmail = this.family().email;
    this.surveyFamilyTime = this.family().time;
    this.surveyChildren = this.family().students;
  }

  private isValidEmail(email: string): boolean {
    const normalized = email?.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return Boolean(normalized && emailPattern.test(normalized));
  }

  submitSurvey() {
    if (
      !this.surveyFamilyLastName ||
      !this.surveyFamilyFirstName ||
      !this.surveyParentEmail ||
      !this.isValidEmail(this.surveyParentEmail) ||
      this.surveyChildren.some(
        c => !c.first_name || !c.last_name || !c.school || !c.grade
      )
    ) {
      this.snackBar.open(
        !this.surveyParentEmail || !this.isValidEmail(this.surveyParentEmail)
          ? 'Please enter a valid parent email address'
          : 'Please fill in all required fields',
        'OK',
        {
          duration: 5000
        }
      );
      return;
    }
    //If still running, Delete original item and add the new item specified in the form.
    this.familyService.deleteFamily(this.family()._id).subscribe({
      error: err => {
        if (err.status === 400) {
          this.snackBar.open(
            `Tried to change an illegal item – Error Code: ${err.status}\nMessage: ${err.message}`,
            'OK',
            { duration: 5000 }
          );
        } else if (err.status === 500) {
          this.snackBar.open(
            `The server failed to process your request to change a item. Is the server up? – Error Code: ${err.status}\nMessage: ${err.message}`,
            'OK',
            { duration: 5000 }
          );
        } else {
          this.snackBar.open(
            `An unexpected error occurred – Error Code: ${err.status}\nMessage: ${err.message}`,
            'OK',
            { duration: 5000 }
          );
        }
      },
    });
    //...Then add the new item if there wasn't an error deleting.
    this.familyService.addFamily(
      {
        first_name:this.surveyFamilyFirstName,
        last_name:this.surveyFamilyLastName,
        first_name_alt:this.surveyFamilyFirstNameAlt,
        last_name_alt:this.surveyFamilyLastNameAlt,
        time:this.surveyFamilyTime,
        email:this.surveyParentEmail,
        students:this.surveyChildren
      }

    ).subscribe({
      next: () => { //newId
        this.snackBar.open(
          `Saved Changes to ${this.surveyFamilyLastName}`,
          null,
          { duration: 3000 }
        );
        this.router.navigate(['/families']);
      },
      error: err => {
        if (err.status === 400) {
          this.snackBar.open(
            `Tried to add an illegal new item – Error Code: ${err.status}\nMessage: ${err.message}`,
            'OK',
            { duration: 5000 }
          );
        } else if (err.status === 500) {
          this.snackBar.open(
            `The server failed to process your request to add a new item. Is the server up? – Error Code: ${err.status}\nMessage: ${err.message}`,
            'OK',
            { duration: 5000 }
          );
        } else {
          this.snackBar.open(
            `An unexpected error occurred – Error Code: ${err.status}\nMessage: ${err.message}`,
            'OK',
            { duration: 5000 }
          );
        }
      },
    });
  }
}
