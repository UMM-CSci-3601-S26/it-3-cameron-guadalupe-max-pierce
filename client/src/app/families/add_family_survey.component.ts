import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FamilyService } from './family.service';
import { catchError } from 'rxjs/internal/operators/catchError';
import { of } from 'rxjs';
import { School } from '../grade_list/school';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { toSignal } from '@angular/core/rxjs-interop';
//import { Family } from './family';
import { Student } from './student';
import { Time } from './time';

@Component({
  selector: 'app-add-family-survey',
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
  templateUrl: './add_family_survey.component.html',
  styleUrls: ['./add_family_survey.component.scss']
})
export class AddFamilySurveyComponent {
  private familyService = inject(FamilyService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private schoolInput = signal('');

  filteredGradeOptions = computed(() => {
    return this.familyService.gradeOptions;
  });

  errMsg = signal('');

  surveyFamilyLastName = '';
  surveyFamilyFirstName = '';
  surveyFamilyLastNameAlt = '';
  surveyFamilyFirstNameAlt = '';
  surveyParentEmail = '';
  surveyParentPhone = '';
  surveyFamilyTime = '';
  espanol = false; //If true, spanish version is used.


  schoolOptions = toSignal(
    this.familyService.getSchools().pipe(
      catchError((err) => {
        if (!(err.error instanceof ErrorEvent)) {
          this.errMsg.set(
            `Problem contacting the server – Error Code: ${err.status}\nMessage: ${err.message}`
          );
        }
        this.snackBar.open(this.errMsg(), 'OK', { duration: 6000 });
        return of<School[]>([]);
      })
    ),
    { initialValue: [] }
  );

  serverFilteredTimes = toSignal(
    this.familyService.getTimes().pipe(
      catchError((err) => {
        if (!(err.error instanceof ErrorEvent)) {
          this.errMsg.set(
            `Problem contacting the server – Error Code: ${err.status}\nMessage: ${err.message}`
          );
        }
        this.snackBar.open(this.errMsg(), 'OK', { duration: 6000 });
        return of<Time[]>([]);
      })
    ),
    { initialValue: [] }
  );

  filteredTimeOptions = computed(() => {
    return this.serverFilteredTimes();
  });

  filteredSchoolOptions = computed(() => {
    return this.schoolOptions();
  });

  gradeOptions = this.familyService.gradeOptions;


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
    this.surveyParentPhone = '';
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

  private isValidPhone(phone: string): boolean {
    const normalized = phone?.trim();
    const phonePattern =/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/g
    return Boolean(normalized && phonePattern.test(normalized));
  }

  //We should really be using proper validators for this, but whatever...
  submitSurvey(): void {
    if (
      !this.surveyFamilyLastName ||
      !this.surveyFamilyFirstName ||
      !this.surveyParentEmail ||
      !this.isValidEmail(this.surveyParentEmail) ||
      !this.isValidPhone(this.surveyParentPhone) ||
      this.surveyChildren.some(
        c => !c.first_name || !c.last_name || !c.school || !c.grade
      )
    ) {
      if (!this.surveyParentEmail || !this.isValidEmail(this.surveyParentEmail)) {
        if (this.espanol) {
          this.snackBar.open(
            'Por favor, introduce una dirección de correo electrónico válida',
            'OK',
            {
              duration: 5000
            }
          );
        } else {
          this.snackBar.open(
            'Please enter a valid email address',
            'OK',
            {
              duration: 5000
            }
          );
        }
      } else if (!this.surveyParentPhone || !this.isValidPhone(this.surveyParentPhone)) {
        if (this.espanol) {
          this.snackBar.open(
            'Por favor, ingrese un número de teléfono válido.',
            'OK',
            {
              duration: 5000
            }
          );
        } else {
          this.snackBar.open(
            'Please enter a valid phone number',
            'OK',
            {
              duration: 5000
            }
          );
        }
      } else {
        if (this.espanol) {
          this.snackBar.open(
            'Por favor, complete toda la información requerida.',
            'OK',
            {
              duration: 5000
            }
          );
        } else {
          this.snackBar.open(
            'Please fill in all required fields',
            'OK',
            {
              duration: 5000
            }
          );
        }
      }
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
      phone: this.surveyParentPhone,
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
