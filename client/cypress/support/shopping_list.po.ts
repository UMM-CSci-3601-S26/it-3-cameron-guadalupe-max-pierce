export class ShoppingListPage {
  private readonly baseUrl = '/shopping_list';
  private readonly pageTitle = '.inventory-list-title';
  private readonly itemListItemsSelector = '.item-nav-list .item-list-item';

  navigateTo() {
    return cy.visit(this.baseUrl);
  }

  getItemTitle() {
    return cy.get(this.pageTitle);
  }

  getItemListItems() {
    return cy.get(this.itemListItemsSelector);
  }

  getNameInput() {
    return cy.get('[data-test=itemNameInput]');
  }

  getDescInput() {
    return cy.get('[data-test=itemDescInput]');
  }

  getTypeInput() {
    return cy.get('[data-test=itemDescSelect]');
  }

  getSchoolSelect() {
    return cy.get('[data-test=itemSchoolInput]');
  }

  getGradeSelect() {
    return cy.get('[data-test=itemGradeInput]');
  }

  getSortBySelect() {
    return cy.get('[data-test=sortBySelect]');
  }

  getSubtractRadio() {
    return cy.get('[data-test=subtractRadio]');
  }

  selectSubtractInventory(value: boolean) {
    const label = value ? 'Subtract Inventory' : 'Ignore Inventory';
    return this.getSubtractRadio().contains(label).click();
  }

}
