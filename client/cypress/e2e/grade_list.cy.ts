import { GradeListPage } from '../support/grade_list.po';

const page = new GradeListPage();

describe('Grade Req list', () => {

  before(() => {
    cy.task('seed:database');
  });

  beforeEach(() => {
    page.navigateTo();
  });

  it('Should have the correct title', () => {
    page.getItemTitle().should('have.text', 'GRADE REQUIREMENTS');
  });

  it('Should show requirements in list view', () => {
    page.getItemListItems().should('have.length', 147);
  });

  it('Should type something in the name filter and return seventeen items', () => {
    cy.get('[data-test=itemNameInput]').clear().type('Pencil');

    page.getItemListItems().should('have.length', 17);

    page.getItemListItems().first().find('.item-list-name').should('contain.text', 'Pencil');
  });

  it('Should type partial in the type filter and return pencil items', () => {
    cy.get('[data-test=itemDescSelect]').clear().type('pe');

    page.getItemListItems().should('have.length', 17);

    page.getItemListItems().each(el => {
      cy.wrap(el).find('.item-list-name').should('contain.text', 'Pen');
    });
  });

  it('Should type something in the description filter and return matching items', () => {
    cy.get('[data-test=itemDescInput]').clear().type('Yellow');

    page.getItemListItems().should('have.length', 13);
    page.getItemListItems().first().find('.item-list-desc').should('contain.text', 'Yellow');
  });

  it('Should click item and go to the right URL', () => {
    page.getItemListItems().first().click();

    cy.url().should('match', /\/grade_list\/[0-9a-fA-F]{24}$/);

    cy.contains('Back to Grade List', { timeout: 10000 }).should('exist');
  });

  it('Should click add item and go to the right URL', () => {
    page.addItemButton().click();

    cy.url().should(url => expect(url.endsWith('/grade_list/new')).to.be.true);

    cy.get('.add-item-title').should('have.text', 'New Requirement');
  });

});

