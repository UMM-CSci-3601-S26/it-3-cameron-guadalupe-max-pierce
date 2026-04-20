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
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { School } from '../grade_list/school';
import { Family } from './family';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
//import { Family } from './family';
import { Student } from './student';
import { Time } from './time';

@Component({
  selector: 'app-modify-family-survey',
  standalone: true,
  imports: [
    CommonModule,
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

  surveyFamilyLastName = '';
  surveyFamilyFirstName = '';
  surveyFamilyLastNameAlt = '';
  surveyFamilyFirstNameAlt = '';
  surveyParentEmail = '';
  surveyFamilyTime = '';

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

  surveyChildren: {
    first_name: string;
    last_name: string;
    school: string;
    grade: string;
    teacher: string;
    backpack: boolean;
    headphones: boolean;
  }[] = [
      { first_name: '', last_name: '', school: '', grade: '', teacher: '', backpack: false, headphones: false}
    ];

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
    this.surveyFamilyLastName = '';
    this.surveyFamilyFirstName = '';
    this.surveyFamilyLastNameAlt = '';
    this.surveyFamilyFirstNameAlt = '';
    this.surveyParentEmail = '';
    this.surveyFamilyTime = '';
    this.surveyChildren = [
      { first_name: '', last_name: '', school: '', grade: '', backpack: false, headphones: false, teacher: '' }
    ];
  }

  private isValidEmail(email: string): boolean {
    const normalized = email?.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return Boolean(normalized && emailPattern.test(normalized));
  }

  submitSurvey(): void {
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

    const students: Student[] = this.surveyChildren.map(c => ({
      first_name: c.first_name,
      last_name: c.last_name,
      school: c.school,
      teacher: c.teacher,
      grade: c.grade,
      backpack: c.backpack,
      headphones: c.headphones
    }));

    this.familyService.addFamily({
      first_name: this.surveyFamilyFirstName,
      last_name: this.surveyFamilyLastName,
      first_name_alt: this.surveyFamilyFirstNameAlt,
      last_name_alt: this.surveyFamilyLastNameAlt,
      time: this.surveyFamilyTime,
      email: this.surveyParentEmail,
      students
    }).subscribe({
      next: () => {
        this.snackBar.open('Survey submitted successfully!', 'OK', {
          duration: 5000
        });
        this.resetSurvey();
        this.router.navigate(['/families']);
      },
      error: (err: Error) => {
        this.snackBar.open(`Error submitting survey: ${err.message}`, 'OK', {
          duration: 5000
        });
      }
    });
  }
}
