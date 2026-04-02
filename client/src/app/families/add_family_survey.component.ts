import { Component, inject } from '@angular/core';
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
import { Student } from './student';
import { Family } from './family';

@Component({
  selector: 'app-backpack-survey',
  standalone: true,
  imports: [
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
export class BackpackSurveyComponent {
  private familyService = inject(FamilyService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  // Model properties
  surveyFamilyLastName: string = '';
  surveyChildFirstName: string = '';
  surveySchool: string = '';
  surveyGrade: string = '';
  surveyBackpackNeeded: string = '';

  submitSurvey() {
    // Validate that required fields are filled
    if (!this.surveyFamilyLastName || !this.surveySchool || !this.surveyGrade) {
      this.snackBar.open('Please fill in all required fields', 'OK', { duration: 5000 });
      return;
    }

    // Create a new student with the survey data
    const newStudent: Student = {
      grade: this.surveyGrade,
      school: this.surveySchool,
      backpack: this.surveyBackpackNeeded === 'yes'
    };

    // Create a new family with the student
    const newFamily: Partial<Family> = {
      name: this.surveyFamilyLastName,
      students: [newStudent]
    };

    // Add the family to the backend
    this.familyService.addFamily(newFamily).subscribe({
      next: () => {
        this.snackBar.open('Family added successfully!', 'OK', { duration: 5000 });
        this.resetSurvey();
        // Navigate to family list
        this.router.navigate(['/families']);
      },
      error: (err) => {
        this.snackBar.open(`Error adding family: ${err.message}`, 'OK', { duration: 5000 });
      }
    });
  }

  resetSurvey() {
    this.surveyFamilyLastName = '';
    this.surveyChildFirstName = '';
    this.surveySchool = '';
    this.surveyGrade = '';
    this.surveyBackpackNeeded = '';
  }
}
