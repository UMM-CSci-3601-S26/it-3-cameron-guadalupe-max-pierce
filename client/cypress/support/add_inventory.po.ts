import { InventoryItem } from '../../src/app/inventory/inventory_item';

export class AddItemPage {

  private readonly url = '/inventory/new';
  private readonly title = 'mat-card-title';
  private readonly button = '[data-test=confirmAddItemButton]';
  private readonly snackBar = '.mat-mdc-simple-snack-bar';
  private readonly nameFieldName = 'name';
  private readonly locationFieldName = 'location';
  private readonly typeFieldName = 'type';
  private readonly stockedFieldName = 'stocked';
  private readonly formFieldSelector = 'mat-form-field';
  private readonly dropDownSelector = 'mat-option';

  navigateTo() {
    return cy.visit(this.url);
  }

  getTitle() {
    return cy.get(this.title);
  }

  addItemButton() {
    return cy.get(this.button);
  }

  selectMatSelectValue(select: Cypress.Chainable, value: string) {
    select.click();
    return cy.get('mat-option').contains(value).click();
  }

  selectAutocompleteValue(input: Cypress.Chainable, label: string) {
    input.click().type(label, { delay: 50 });
    cy.wait(200);
    cy.get('mat-autocomplete-panel', { timeout: 3000 }).should('be.visible');
    return cy.get('mat-autocomplete-panel').find('mat-option').contains(label).click();
  }

  private getTypeLabel(value: string): string {
    const options = [
      { value: 'pencils', label: 'Pencils' },
      { value: 'colored_pencils', label: 'Colored Pencils' },
      { value: 'sharpeners', label: 'Sharpeners' },
      { value: 'markers', label: 'Markers' },
      { value: 'highlighters', label: 'Highlighters' },
      { value: 'dry_erase_markers', label: 'Dry-Erase Markers' },
      { value: 'crayons', label: 'Crayons' },
      { value: 'pens', label: 'Pens' },
      { value: 'erasers', label: 'Erasers' },
      { value: 'folders', label: 'Folders' },
      { value: 'binders', label: 'Binders' },
      { value: 'notebooks', label: 'Notebooks' },
      { value: 'glue', label: 'Glue' },
    ];
    const match = options.find(option => option.value === value);
    return match ? match.label : value;
  }

  getFormField(fieldName: string) {
    return cy.get(`${this.formFieldSelector} [formcontrolname=${fieldName}]`);
  }

  getSnackBar() {
    // Since snackBars are often shown in response to errors,
    // we'll add a timeout of 10 seconds to help increase the likelihood that
    // the snackbar becomes visible before we might fail because it
    // hasn't (yet) appeared.
    return cy.get(this.snackBar, { timeout: 10000 });
  }

  addItem(newItem: InventoryItem) {
    this.getFormField(this.nameFieldName).type(newItem.name, { delay: 10 });
    cy.wait(100);
    this.getFormField(this.stockedFieldName).type(newItem.stocked.toString(), { delay: 10 });
    cy.wait(100);
    if (newItem.type) {
      this.getFormField(this.typeFieldName).type(newItem.type, { delay: 10 });
      cy.wait(100);
    }
    if (newItem.location) {
      this.getFormField(this.locationFieldName).type(newItem.location, { delay: 10 });
      cy.wait(100);
    }
    if (newItem.desc) {
      this.getFormField('desc').type(newItem.desc, { delay: 10 });
      cy.wait(100);
    }
    return this.addItemButton().click();
  }
}
