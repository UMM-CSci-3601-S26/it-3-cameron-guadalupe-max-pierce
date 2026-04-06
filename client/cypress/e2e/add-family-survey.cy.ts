describe('Backpack Need Survey', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200/families/survey');
  });

  it('fills out the survey form and submits', () => {
    cy.intercept('POST', '**/api/families', { statusCode: 201, body: { id: 'abc123' } }).as('addFamily');

    // Family info
    cy.get('input[name="familyLastName"]').type('Smith');
    cy.get('input[name="parentEmail"]').type('parent@example.com');

    // First child
    cy.get('input[name="childFirstName0"]').type('John');
    cy.get('input[name="childLastName0"]').type('Smith');
    cy.get('input[name="school0"]').type('Lincoln Elementary');
    cy.get('.child-form').first().find('mat-select').click();
    cy.get('mat-option').contains('3').click();
    cy.get('mat-radio-button[value="yes"]').first().click();

    // Add second child
    cy.contains('Add Another Child').click();
    cy.get('input[name="childFirstName1"]').type('Emma');
    cy.get('input[name="childLastName1"]').type('Smith');
    cy.get('input[name="school1"]').type('Lincoln Elementary');
    cy.get('.child-form').eq(1).find('mat-select').click();
    cy.get('mat-option').contains('1').click();
    cy.get('mat-radio-button[value="no"]').last().click();

    // Submit
    cy.get('button[type="submit"]').click();
    cy.wait('@addFamily');

    // Confirm redirect to families page after successful submit
    cy.url().should('include', '/families');
  });

  it('can add and remove a child', () => {
    cy.contains('Add Another Child').click();
    cy.get('.child-form').should('have.length', 2);
    cy.get('.child-form button').contains('Remove Child').last().click();
    cy.get('.child-form').should('have.length', 1);
  });
});
