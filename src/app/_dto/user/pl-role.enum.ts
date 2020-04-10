export enum PlRole {
  APP_ADMIN,
  CONTRACTOR_EDIT,
  CONTRACTOR_VIEW,
  DATA_EDIT,
  DATA_ENTRY,
  DATA_VIEW,
  // SHIPPER,
  USER_MANAGEMENT
}

export const PlRoleLookup = {
  APP_ADMIN: {
    style: 'badge-warning',
    description: 'Allows the user to add and remove items from the shared dropdowns for the data entry forms.'
  },
  CONTRACTOR_EDIT: {
    style: 'badge-dark',
    description: 'Allows the user to edit any card they have access to via the contractor page. ' +
      'Combined with just the "Data Entry" role (without the "Contractor View" role), the user will be able to edit only currently open ' +
      'cards belonging to their assigned ranches. This is done from the "Contractor" tab of the application.'
  },
  CONTRACTOR_VIEW: {
    style: 'badge-light',
    description: 'Allows the user to view all cards from all ranches via the "Contractor" tab. ' +
      'If the user also has the "Contractor Edit" role, they will be able to edit all cards on this contractor page ' +
      '(both closed and open, from all ranches) plus close/re-open and permanently delete any card.'
  },
  DATA_EDIT: {
    style: 'badge-primary',
    description: 'Allows the user to edit any card they have access to. ' +
      'Combined with just the "Data Entry" role (without the "Data View" role), the user will be able to edit only currently open cards ' +
      'belonging to their assigned ranches. This is done from the "Data" tab of the application.'
  },
  DATA_ENTRY: {
    style: 'badge-success',
    description: 'Gives the user access to the "Entry" tab of the application. ' +
      'Once they\'re assigned to ranches, the user will be able to create and view cards belonging to those ranches.'
  },
  DATA_VIEW: {
    style: 'badge-info',
    description: 'Allows the user to view all cards from all ranches via the "Data" tab. ' +
      'If the user also has the "Data Edit" role, they will be able to edit all cards (both closed and open, from all ranches) ' +
      'plus close/re-open and permanently delete any card.'
  },
  // SHIPPER: {
  //   style: 'badge-secondary',
  //   description: 'Allows the user to view the Data page which shows cards containing the shipper ID of the current user. When opening ' +
  //     'a card it will not show any pre/post plant, tractor, or irrigation information. The user is able to add comments'
  // },
  USER_MANAGEMENT: {
    style: 'badge-danger',
    description: 'Allows the user to create, edit, and delete all users from the "Users" tab of the application.'
  }
};
