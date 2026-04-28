import { RequiredItem } from '../../src/app/grade_list/required_item';

export class AddRequirementPage {

  private readonly url = '/grade_list/new';
  private readonly title = 'mat-card-title';
  private readonly button = '[data-test=confirmAddItemButton]';
  private readonly snackBar = '.mat-mdc-simple-snack-bar';
  private readonly nameFieldName = 'name';
  private readonly typeFieldName = 'type';
  private readonly schoolFieldName = 'school';
  private readonly gradeFieldName = 'grade';
  private readonly requiredFieldName = 'required';
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

  getFormField(fieldName: string) {
    return cy.get(`${this.formFieldSelector} [formcontrolname=${fieldName}]`);
  }

  getSnackBar() {
    return cy.get(this.snackBar, { timeout: 10000 });
  }

  addItem(newItem: RequiredItem) {
    this.getFormField(this.nameFieldName).clear().type(newItem.name, { delay: 10 });
    cy.wait(100);
    this.getFormField(this.requiredFieldName).clear().type(newItem.required.toString(), { delay: 10 });
    cy.wait(100);
    this.getFormField(this.typeFieldName).clear().type(newItem.type.toString(), { delay: 10 });
    cy.wait(100);
    this.getFormField(this.gradeFieldName).clear().type(newItem.grade, { delay: 10 });
    cy.wait(100);
    //Can't figure this out, screw it, just use the first school.
    if (newItem.school != '') {
      this.selectMatSelectValue(this.getFormField('school'),'Morris Area Elementary School (MAES)');
      cy.wait(100);
    }
    if (newItem.desc) {
      this.getFormField('desc').clear().type(newItem.desc, { delay: 10 });
      cy.wait(100);
    }
    return this.addItemButton().click();
  }
}
