import { Component, signal, inject, computed, Signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap } from '@angular/router';
//import { UserRole } from './user';
import { RouterLink } from '@angular/router';
import { InventoryService } from './inventory.service';
import { InventoryItem } from './inventory_item';
import { catchError, map, switchMap } from 'rxjs/operators';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { of } from 'rxjs';

@Component({
  selector: 'app-modify-inventory-item',
  templateUrl: './modify_inventory_item.component.html',
  styleUrls: ['./modify_inventory_item.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatAutocompleteModule,
    MatButtonModule]
})

export class ModifyItemComponent {
  private inventoryService = inject(InventoryService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

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

  error = signal({ help: '', httpResponse: '', message: '' });

  private route = inject(ActivatedRoute);

  //Connect an item, such that we can display both old and new values!
  item: Signal<InventoryItem> = toSignal(
    this.route.paramMap.pipe(
      // Map the paramMap into the id
      map((paramMap: ParamMap) => paramMap.get('id')),
      // Maps the `id` string into the Observable<InventoryItem>,
      // which will emit zero or one values depending on whether there is a
      // `Item` with that ID.
      switchMap((id: string) => this.inventoryService.getItemById(id)),
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

  modifyInventoryForm = new FormGroup({
    // We allow alphanumeric input and limit the length for name.
    name: new FormControl('', Validators.compose([
      Validators.required,
      Validators.minLength(4),
      Validators.maxLength(100),
      //This is apparently uneccesary?
      // (fc) => {
      //   if (fc.value.toLowerCase() === 'abc123' || fc.value.toLowerCase() === '123abc') {
      //     return ({existingName: true}); //Why TF is this only checking two names?
      //   } else {
      //     return null;
      //   }
      // },
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
      //Validators.email,
    ])),

  });

  // We can only display one error at a time,
  // the order the messages are defined in is the order they will display in.
  readonly modifyItemValidationMessages = {
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
    return this.modifyInventoryForm.get(controlName).invalid &&
      (this.modifyInventoryForm.get(controlName).dirty || this.modifyInventoryForm.get(controlName).touched);
  }

  getErrorMessage(name: keyof typeof this.modifyItemValidationMessages): string {
    for(const {type, message} of this.modifyItemValidationMessages[name]) {
      if (this.modifyInventoryForm.get(name).hasError(type)) {
        return message;
      }
    }
    return 'Unknown error';
  }

  resetForm() {
    this.modifyInventoryForm.setValue({
      name:this.item().name,
      location:this.item().location,
      desc:this.item().desc,
      stocked:this.item().stocked,
      type:this.item().type
    },
    {
      emitEvent:true
    });
    this.snackBar.open(
      `Reset changes to ${this.item().name}`,
      'OK',
      { duration: 3000 }
    );
  }

  deleteForm() {
    this.inventoryService.deleteItem(this.item()._id).subscribe({
      next: () => { //newId
        this.snackBar.open(
          `Removed x${this.modifyInventoryForm.value.stocked} ${this.modifyInventoryForm.value.name}`,
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
    this.inventoryService.deleteItem(this.item()._id).subscribe({
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
    this.inventoryService.addItem(this.modifyInventoryForm.value).subscribe({
      next: () => { //newId
        this.snackBar.open(
          `Saved Changes to x${this.modifyInventoryForm.value.stocked} ${this.modifyInventoryForm.value.name}`,
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
