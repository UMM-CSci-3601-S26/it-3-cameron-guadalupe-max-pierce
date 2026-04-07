import { Component, inject, computed, signal, Signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { GradeListService } from './grade_list.service';
import { School } from './school';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { RequiredItem } from './required_item';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { catchError, combineLatest, of, map, switchMap, tap } from 'rxjs';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-modify-inventory-item',
  templateUrl: './modify_grade_list_item.component.html',
  styleUrls: ['./modify_grade_list_item.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule, MatButtonModule, MatAutocompleteModule]
})
export class ModifyRequirementComponent {
  public gradeService = inject(GradeListService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private finished = false;

  typeInput = signal<string>('');
  gradeInput = signal<string>('');

  errMsg = signal<string | undefined>(undefined);
  // localOriginSchool = this.gradeService.originSchool; //See grade service
  // localOriginGrade = this.gradeService.originGrade;
  schoolInput = signal<string>('');

  filteredTypeOptions = computed(() => {
    const input = (this.typeInput() || '').toLowerCase();
    if (!input) return this.gradeService.typeOptions;
    return this.gradeService.typeOptions.filter(option =>
      option.label.toLowerCase().includes(input) || option.value.toLowerCase().includes(input)
    );
  });

  filteredGradeOptions = computed(() => {
    //const input = (this.gradeInput() || '').toLowerCase();
    return this.gradeService.gradeOptions
    // if (!input) return this.gradeService.gradeOptions;
    // return this.gradeService.gradeOptions.filter(option =>
    //   option.label.toLowerCase().includes(input) || option.value.toLowerCase().includes(input)
    // );
  });


  //Get schools from the database to allow for autofill and limiting inputs.
  private schoolInput$ = toObservable(this.schoolInput);

  serverFilteredSchools =
    toSignal(
      //Not actually doing any filtering on the server, just need to get Items.
      combineLatest([this.schoolInput$]).pipe(
        switchMap(() =>
          this.gradeService.getSchools()
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

  filteredSchoolOptions = computed(() => {
    return this.serverFilteredSchools();
    // const input = (this.schoolInput() || '').toLowerCase();
    // if (!input) return this.serverFilteredSchools();
    // return this.serverFilteredSchools(); //No filtering, short list.
  });

  //All that work, and turns out it was simpler to just put in a dropdown menu...
  // schoolRegex = computed(() => {
  //   let expression = '^(';
  //   if (this.serverFilteredSchools() != undefined) {
  //     for (let i = 0; i < this.serverFilteredSchools().length; i++) {
  //       expression = expression.concat(this.serverFilteredSchools()[i].label.replace("'","\\'")); //Doesn't actually work?
  //       if (i < this.serverFilteredSchools().length - 1) { //Last one doesn't need a '|'
  //         expression = expression.concat('|');
  //       }
  //     }
  //   }
  //   expression = expression.concat(')$');
  //   return expression;
  // });

  displayTypeLabel = (value: string | null): string => {
    if (!value) return '';
    const match = this.gradeService.typeOptions.find(option => option.value === value);
    return match ? match.label : value;
  };

  //Necessary?
  // displaySchoolLabel = (value: string | null): string => {
  //   if (!value) return '';
  //   const match = this.filteredSchoolOptions().find(option => option.value === value);
  //   return match ? match.label : value;
  // };

  error = signal({ help: '', httpResponse: '', message: '' });

  private route = inject(ActivatedRoute);

  //Connect an item, such that we can display both old and new values!
  item: Signal<RequiredItem> = toSignal(
    this.route.paramMap.pipe(
      // Map the paramMap into the id
      map((paramMap: ParamMap) => paramMap.get('id')),
      // Maps the `id` string into the Observable<InventoryItem>,
      // which will emit zero or one values depending on whether there is a
      // `Item` with that ID.
      switchMap((id: string) => this.gradeService.getItemById(id)),
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

  modifyRequirementForm = new FormGroup({
    // We allow alphanumeric input and limit the length for name.
    name: new FormControl('', Validators.compose([
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100),
    ])),

    required: new FormControl<number>(null, Validators.compose([
      Validators.required,
      Validators.min(1),
      Validators.max(9999),
      Validators.pattern('^[0-9]+$')
    ])),

    pack: new FormControl<number>(1, Validators.compose([ //Defaults to 1
      Validators.required,
      Validators.min(1),
      Validators.max(999),
      Validators.pattern('^[0-9]+$')
    ])),

    desc: new FormControl(''),

    type: new FormControl('', Validators.compose([
      Validators.required,
      Validators.pattern(this.gradeService.typeOptions.map(option => option.value).join('|'))
    ])),

    grade: new FormControl('', Validators.compose([
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(2),
      Validators.pattern('^(P|K|1|2|3|4|5|6|7|8|9|10|11|12)$')
    ])),

    school: new FormControl('', Validators.compose([
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100),
      //'^(MAES|Hancock|Saint Mary\'s)$'
      //'^(MAES|Hancock|Saint Mary)$'
      //TODO, fix this! No clue why it isn't working, literally returns the same value.
      //Validators.pattern(this.schoolRegex())
      //Validators.pattern('^(Hancock|Saint Mary|MAES)$')
    ])),
  });


  // We can only display one error at a time,
  // the order the messages are defined in is the order they will display in.
  readonly addItemValidationMessages = {
    name: [
      {type: 'required', message: 'Name is required!'},
      {type: 'minlength', message: 'Name must be at least 4 characters long!'},
      {type: 'maxlength', message: 'Name cannot be more than 100 characters long. Use the description!'},
      {type: 'existingName', message: 'Name has already been taken, update existing item?'}
    ],

    required: [
      {type: 'required', message: 'Required # is required!'},
      {type: 'min', message: 'Required must be at least 1. No imaginary pencils allowed.'},
      {type: 'max', message: 'Required may not be greater than 9999. Teacher needs to calm down'},
      {type: 'pattern', message: 'Required must be a whole number! Half a pencil is not a thing.'}
    ],

    pack: [
      {type: 'required', message: 'Pack # is required!'},
      {type: 'min', message: 'Pack # must be at least 1. No Air guitars allowed.'},
      {type: 'max', message: 'Pack # may not be greater than 999. Too many colors.'},
      {type: 'pattern', message: 'Pack # must be a whole number! Half a pencil is not a thing.'}
    ],

    type: [
      {type: 'required', message: 'Type is required!'},
      {type: 'pattern', message: 'Type must be selected from the dropdown.'}
    ],

    grade: [
      {type: 'required', message: 'Grade is required!'},
      {type: 'minlength', message: 'Grade must be a number 1-12, P, or K.'},
      {type: 'maxlength', message: 'Grade must be a number 1-12, P, or K.'},
      {type: 'pattern', message: 'Grade must be a number 1-12, P, or K.'}
    ],

    school: [
      {type: 'pattern', message: 'Must match an existing school.'},
      {type: 'required', message: 'School is required!'},
      {type: 'minlength', message: 'School length must be > 3'},
      {type: 'maxlength', message: 'School name cannot be > 400. What a mouthful!'},
    ],
  };

  formControlHasError(controlName: string): boolean {
    return this.modifyRequirementForm.get(controlName).invalid &&
      (this.modifyRequirementForm.get(controlName).dirty || this.modifyRequirementForm.get(controlName).touched);
  }

  getErrorMessage(name: keyof typeof this.addItemValidationMessages): string {
    for(const {type, message} of this.addItemValidationMessages[name]) {
      if (this.modifyRequirementForm.get(name).hasError(type)) {
        return message;
      }
    }
    return 'Unknown error';
  }

  resetForm() {
    this.modifyRequirementForm.setValue({
      name:this.item().name,
      school:this.item().school,
      grade:this.item().grade,
      desc:this.item().desc,
      required:this.item().required,
      type:this.item().type,
      pack:this.item().pack
    },
    {
      emitEvent:true
    });
    this.snackBar.open(
      `Reset changes to ${this.item().name} ${this.item().desc}`,
      'OK',
      { duration: 3000 }
    );
  }

  deleteForm() {
    this.gradeService.deleteItem(this.item()._id).subscribe({
      next: () => { //newId
        this.snackBar.open(
          `Removed ${this.modifyRequirementForm.value.name}`,
          null,
          { duration: 3000 }
        );
        this.router.navigate(['/inventory']);
      },
      error: err => {
        if (err.status === 400) {
          this.snackBar.open(
            `Tried to delete an illegal item – Error Code: ${err.status}\nMessage: ${err.message}`,
            'OK',
            { duration: 5000 }
          );
        } else if (err.status === 500) {
          this.snackBar.open(
            `The server failed to process your request to delete a item. Is the server up? – Error Code: ${err.status}\nMessage: ${err.message}`,
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

  submitForm() {
    //Delete original item and add the new item specified in the form.
    this.gradeService.deleteItem(this.item()._id).subscribe({
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
    this.gradeService.addItem(this.modifyRequirementForm.value).subscribe({
      next: () => { //newId
        this.snackBar.open(
          `Saved Changes to ${this.modifyRequirementForm.value.name}`,
          null,
          { duration: 3000 }
        );
        this.router.navigate(['/inventory']);
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
