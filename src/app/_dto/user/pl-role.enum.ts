export enum PlRole {
  APP_ADMIN,
  CONTRACTOR_EDIT,
  CONTRACTOR_VIEW,
  DATA_EDIT,
  DATA_ENTRY,
  DATA_VIEW,
  IRRIGATOR,
  SHIPPER,
  TH_EDIT,
  TH_VIEW,
  USER_MANAGEMENT
}

export const PlRoleLookup = {
  APP_ADMIN: {
    display: 'App Admin',
    description: 'Allows the user to add and remove items from the shared dropdowns for the data entry forms.'
  },
  CONTRACTOR_EDIT: {
    display: 'Contractor Edit',
    description: 'Allows the user to edit any card they have access to via the contractor page. ' +
      'Combined with just the "Data Entry" role (without the "Contractor View" role), the user will be able to edit only currently open ' +
      'cards belonging to their assigned ranches. This is done from the "Contractor" tab of the application.'
  },
  CONTRACTOR_VIEW: {
    display: 'Contractor View',
    description: 'Allows the user to view all cards from all ranches via the "Contractor" tab. ' +
      'If the user also has the "Contractor Edit" role, they will be able to edit all cards on this contractor page ' +
      '(both closed and open, from all ranches) plus close/re-open and permanently delete any card.'
  },
  DATA_EDIT: {
    display: 'Data Edit',
    description: 'Allows the user to edit any card they have access to. ' +
      'Combined with just the "Data Entry" role (without the "Data View" role), the user will be able to edit only currently open cards ' +
      'belonging to their assigned ranches. This is done from the "Data" tab of the application.'
  },
  DATA_ENTRY: {
    display: 'Data Entry',
    description: 'Gives the user access to the "Entry" tab of the application. ' +
      'Once they\'re assigned to ranches, the user will be able to create and view cards belonging to those ranches.'
  },
  DATA_VIEW: {
    display: 'Data View',
    description: 'Allows the user to view all cards from all ranches via the "Data" tab. ' +
      'If the user also has the "Data Edit" role, they will be able to edit all cards (both closed and open, from all ranches) ' +
      'plus close/re-open and permanently delete any card.'
  },
  IRRIGATOR: {
    display: 'Irrigator',
    description: 'Allows the user to view the entry page. This doesn\'t allow the user to create cards, but they can open a restricted ' +
      'view of cards. This restricted view shows basic card information (Ranch name, Lot #, Acres, and the commodities), the irrigation ' +
      'section, and the comments section.'
  },
  TH_EDIT: {
    display: 'Thin & Hoe Edit',
    description: 'Allows the user to open and edit any card they have access to via the Thin & Hoe page. Allows opening a restricted' +
      ' view of cards. This restricted view shows only the Ranch, Lot Number, date created, and Thin & Hoe Sections.'
  },
  TH_VIEW: {
    display: 'Thin & Hoe View',
    description: 'Allows the user to view the Thin & Hoe page which shows all open cards belonging to their assigned ranches. If the user' +
      'also has the "Thin & Hoe Edit" role, they will be able to open and edit these cards.'
  },
  SHIPPER: {
    display: 'Shipper',
    description: 'Allows the user to view the Data page which shows cards containing the shipper ID of the current user. When opening ' +
      'a card it will not show any pre/post plant, tractor, or irrigation information. The user is able to add comments'
  },
  USER_MANAGEMENT: {
    display: 'User Management',
    description: 'Allows the user to create, edit, and delete all users from the "Users" tab of the application.'
  }
};
