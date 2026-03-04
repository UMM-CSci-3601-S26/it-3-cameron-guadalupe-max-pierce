import { Component, inject, computed, signal } from '@angular/core';
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
import { InventoryService } from './inventory.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@Component({
  selector: 'app-add-inventory-item',
  templateUrl: './add_inventory_item.component.html',
  styleUrls: ['./add_inventory_item.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule, MatButtonModule, MatAutocompleteModule]
})
export class AddItemComponent {
  private inventoryService = inject(InventoryService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private finished = false;

  typeInput = signal<string>('');

  filteredTypeOptions = computed(() => {
    const input = (this.typeInput() || '').toLowerCase();
    if (!input) return this.inventoryService.typeOptions;
    return this.inventoryService.typeOptions.filter(option =>
      option.label.toLowerCase().includes(input) || option.value.toLowerCase().includes(input)
    );
  });

  displayTypeLabel = (value: string | null): string => {
    if (!value) return '';
    const match = this.inventoryService.typeOptions.find(option => option.value === value);
    return match ? match.label : value;
  };

  addInventoryForm = new FormGroup({
    // We allow alphanumeric input and limit the length for name.
    name: new FormControl('', Validators.compose([
      Validators.required,
      Validators.minLength(4),
      Validators.maxLength(100),
      (fc) => {
        if (fc.value.toLowerCase() === 'abc123' || fc.value.toLowerCase() === '123abc') {
          return ({existingName: true});
        } else {
          return null;
        }
      },
    ])),

    // Since this is for a company, we need workers to be old enough to work, and probably not older than 200.
    stocked: new FormControl<number>(null, Validators.compose([
      Validators.required,
      Validators.min(0),
      Validators.max(9999),
      // In the HTML, we set type="number" on this field. That guarantees that the value of this field is numeric,
      // but not that it's a whole number. (The user could still type -27.3232, for example.) So, we also need
      // to include this pattern.
      Validators.pattern('^[0-9]+$')
    ])),

    desc: new FormControl(''),

    type: new FormControl('', Validators.compose([
      Validators.required,
      Validators.pattern(this.inventoryService.typeOptions.map(option => option.value).join('|'))
    ])),

    location: new FormControl('', Validators.compose([
      Validators.required,
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

    stocked: [
      {type: 'required', message: 'Stocked is required!'},
      {type: 'min', message: 'Stocked must be at least 0. No pencil debt allowed.'},
      {type: 'max', message: 'Stocked may not be greater than 9999. Why are you counting these?'},
      {type: 'pattern', message: 'Stocked must be a whole number! Half a pencil is not a thing.'}
    ],

    type: [
      {type: 'required', message: 'Type is required!'},
      {type: 'pattern', message: 'Type must be selected from the dropdown.'}
    ],

    location: [
      { type: 'required', message: 'Location is required!' },
    ]
  };

  formControlHasError(controlName: string): boolean {
    return this.addInventoryForm.get(controlName).invalid &&
      (this.addInventoryForm.get(controlName).dirty || this.addInventoryForm.get(controlName).touched);
  }

  getErrorMessage(name: keyof typeof this.addItemValidationMessages): string {
    for(const {type, message} of this.addItemValidationMessages[name]) {
      if (this.addInventoryForm.get(name).hasError(type)) {
        return message;
      }
    }
    return 'Unknown error';
  }

  submitForm() {
    if (this.finished) { //Ensures form is only submitted once!
      this.snackBar.open(
        `Loading. Hold your horses!`,
        null,
        { duration: 2000 }
      );
    } else {
      this.finished = true;
      this.inventoryService.addItem(this.addInventoryForm.value).subscribe({
        next: () => { //newId
          this.snackBar.open(
            `Added x${this.addInventoryForm.value.stocked} ${this.addInventoryForm.value.name}`,
            null,
            { duration: 2000 }
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
}
