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

export interface Student {
  firstName: string;
  lastName: string;
  school: string;
  grade: string;
  backpack: boolean;
}

export interface Family {
  name: string;
  email: string;
  students: Student[];
}


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

  errMsg = signal('');

  surveyFamilyLastName = '';
  surveyParentEmail = '';


  serverFilteredSchools = signal(
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
    )
  );

  filteredSchoolOptions = computed(() => {
    return this.serverFilteredSchools();
    // const input = (this.schoolInput() || '').toLowerCase();
    // if (!input) return this.serverFilteredSchools();
    // return this.serverFilteredSchools(); //No filtering, short list.
  });


  surveyChildren: {
    firstName: string;
    lastName: string;
    school: string;
    grade: string;
    backpackNeeded: string;
  }[] = [
      { firstName: '', lastName: '', school: '', grade: '', backpackNeeded: '' }
    ];

  addChild(): void {
    this.surveyChildren.push({
      firstName: '',
      lastName: '',
      school: '',
      grade: '',
      backpackNeeded: ''
    });
  }

  removeChild(index: number): void {
    if (this.surveyChildren.length > 1) {
      this.surveyChildren.splice(index, 1);
    }
  }

  resetSurvey(): void {
    this.surveyFamilyLastName = '';
    this.surveyParentEmail = '';
    this.surveyChildren = [
      { firstName: '', lastName: '', school: '', grade: '', backpackNeeded: '' }
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
      !this.surveyParentEmail ||
      !this.isValidEmail(this.surveyParentEmail) ||
      this.surveyChildren.some(
        c => !c.firstName || !c.lastName || !c.school || !c.grade
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
      firstName: c.firstName,
      lastName: c.lastName,
      school: c.school,
      grade: c.grade,
      backpack: c.backpackNeeded === 'yes'
    }));

    this.familyService.addFamily({
      name: this.surveyFamilyLastName,
      email: this.surveyParentEmail,
      students
    }).subscribe({
      next: () => {
        this.snackBar.open('Family added successfully!', 'OK', {
          duration: 5000
        });
        this.resetSurvey();
        this.router.navigate(['/families']);
      },
      error: (err: Error) => {
        this.snackBar.open(`Error adding family: ${err.message}`, 'OK', {
          duration: 5000
        });
      }
    });
  }

}
