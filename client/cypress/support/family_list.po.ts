export class FamilyListPage {
  private readonly baseUrl = '/families';
  private readonly pageTitle = '.family-list-title';
  private readonly itemCardSelector = '.item-card';
  private readonly itemListItemsSelector = '.item-nav-list .sub-sub-section-card';
  // private readonly itemCheckboxSelector = 'mat-checkbox';
  // private readonly profileButtonSelector = '[data-test=viewProfileButton]';
  private readonly addFamilyButtonSelector = '[data-test=addFamilyButton]';
  private readonly relocateSelectedButtonSelector = '[data-test=relocateSelectedButton]';
  private readonly exportCSVButtonSelector = '[data-test=exportCSVButton]';
  private readonly formFieldSelector = 'input-field';

  navigateTo() {
    return cy.visit(this.baseUrl);
  }

  /**
   * Gets the title of the app when visiting the `/families` page.
   *
   * @returns the value of the element with the ID `.user-list-title`
   * ...This is kind of a stupid test, ngl
   */
  getItemTitle() {
    return cy.get(this.pageTitle);
  }

  selectMatSelectValue(select: Cypress.Chainable, value: string) {
    select.click();
    cy.wait(100);
    return cy.get('mat-option').contains(value).click();
  }

  getFormField(fieldName: string) {
    return cy.get(`${this.formFieldSelector} [formcontrolname=${fieldName}]`);
  }

  getItemListItems() {
    return cy.get(this.itemListItemsSelector);
  }

  clickListItem(index: number) {
    return this.getItemListItems().eq(index).click();
  }

  addFamilyButton() {
    return cy.get(this.addFamilyButtonSelector);
  }

  exportCSVButton() {
    return cy.get(this.exportCSVButtonSelector);
  }
}
