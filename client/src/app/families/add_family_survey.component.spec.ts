import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { BackpackSurveyComponent } from './add_family_survey.component';
import { FamilyService } from './family.service';

describe('BackpackSurveyComponent', () => {
  let component: BackpackSurveyComponent;
  let fixture: ComponentFixture<BackpackSurveyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BackpackSurveyComponent,
        FormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatRadioModule,
        MatButtonModule,
        MatSnackBarModule,
        RouterTestingModule
      ],
      providers: [FamilyService]
    }).compileComponents();

    fixture = TestBed.createComponent(BackpackSurveyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset the form when resetSurvey is called', () => {
    component.surveyFamilyLastName = 'Smith';
    component.resetSurvey();
    expect(component.surveyFamilyLastName).toBe('');
  });
});
