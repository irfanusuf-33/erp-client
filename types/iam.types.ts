export interface User {
  _id: string;
  fName: string;
  lName: string;
  email: string;
  username: string;
  disabled: boolean;
  groups: string[];
  policies: string[];
  lastLogin: string;
  passwordAge: string;
  updatedAt: string;
}



export type TabType = 'policies' | 'groups' | 'roles';


export type PermissionsData = Record<TabType, PolicyCategory[]>;


export interface GroupData {
    groupName: string;
    groupAdmin: string;
    groupCode: string;
    groupDescription: string;
    files?: any[];
}


export interface Policy {
  id: string;
  name: string;
  description?: string;
  selected: boolean;
  showDescription?: boolean;
}

export interface PolicyCategory {
  id: string;
  title: string;
  policies: Policy[];
}


export interface RoleCategory {
  id: string;
  title: string;
  policies: Policy[];
}


export interface PersonalDetails {
  firstName: string;
  lastName: string;
}

export interface ContactDetails {
  email: string;
}

export interface Employee {
  _id: string;
  personalDetails: PersonalDetails;
  contactDetails: ContactDetails;
}

export interface EmployeeSearchResult {
  success: boolean;
  employees: Employee[];
}




// dtos 


export interface PolicyResponse {
  permissions: string[];
  description?: string;
}

export interface PolicyGroupsResponse {
  [key: string]: { [key: string]: PolicyResponse };
}


export interface EmployeeSearchResult {
  success: boolean;
  employees: Employee[];
}


export interface FetchGroupsResponse {
    _id: string;
    name: string;
    description?: string;
    disabled?: boolean;
}
