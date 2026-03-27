export class ItemListPage {
  private readonly baseUrl = '/inventory';
  private readonly pageTitle = '.inventory-list-title';
  private readonly itemCardSelector = '.item-card';
  private readonly itemListItemsSelector = '.item-nav-list .item-list-item';
  private readonly profileButtonSelector = '[data-test=viewProfileButton]';
  private readonly addItemButtonSelector = '[data-test=addItemButton]';

  navigateTo() {
    return cy.visit(this.baseUrl);
  }

  /**
   * Gets the title of the app when visiting the `/users` page.
   *
   * @returns the value of the element with the ID `.user-list-title`
   */
  getItemTitle() {
    return cy.get(this.pageTitle);
  }

  /**
   * Get all the `app-user-card` DOM elements. This will be
   * empty if we're using the list view of the users.
   *
   * @returns an iterable (`Cypress.Chainable`) containing all
   *   the `app-user-card` DOM elements.
   */
  getItemCards() {
    return cy.get(this.itemCardSelector);
  }

  /**
   * Get all the `.user-list-item` DOM elements. This will
   * be empty if we're using the card view of the users.
   *
   * @returns an iterable (`Cypress.Chainable`) containing all
   *   the `.user-list-item` DOM elements.
   */
  getItemListItems() {
    return cy.get(this.itemListItemsSelector);
  }

  /**
   * Clicks the "view profile" button for the given user card.
   * Requires being in the "card" view.
   *
   * @param card The user card
   */
  getItemCardByIndex(index: number) {
    return this.getItemCards().eq(index);
  }

  clickListItem(index: number) {
    return this.getItemListItems().eq(index).click();
  }

  addItemButton() {
    return cy.get(this.addItemButtonSelector);
  }
}
