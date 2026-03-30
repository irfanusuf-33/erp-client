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
  roles?: string[];
  mfa?: object | null;
  mfaEnabled?: boolean;
}

export interface SearchUser {
    _id: string;
    fName: string;
    lName: string;
    email: string;
}


export type TabType = 'policies' | 'groups' | 'roles';


export type PermissionsData = Record<TabType, PolicyCategory[]>;


export interface Group {
  _id : string;
    groupName: string;
    groupAdmin: string;
    groupCode: string;
    groupDescription: string;
    files?: any[];
    disabled : boolean
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


export interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  groupData: { _id: string; name: string; description: string } | null;
  setGroupData: React.Dispatch<React.SetStateAction<{ _id: string; name: string; description: string } | null>>;
}


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

export interface IamGroupsProps {
  selectionMode?: boolean;
  selectedGroups?: string[];
  onToggleGroup?: (groupName: string) => void;
}

export type IamGroupRow = {
  _id: string;
  groupName: string;
  groupDescription?: string;
  disabled?: boolean;
  createdByUser?: { username: string };
  [key: string]: any;
};

export type IamUserRow = {
  _id: string;
  fName?: string;
  lName?: string;
  email: string;
  passwordAge?: string;
  lastLogin?: string;
  disabled?: boolean;
  [key: string]: any;
};

export type CustomRole = {
  _id: string;
  name: string;
  policies: string[];
  [key: string]: any;
};

export interface RolesTableProps {
  selectedPermissions: string[];
  onTogglePermission: (id: string) => void;
}

export type InsightsAlertsItem = { title: string; description: string; type: string };

export interface IamInsightsAlertsProps {
  alerts?: InsightsAlertsItem[];
  insights?: InsightsAlertsItem[];
}

export interface IamResourcesProps {
  details?: { totalUsers?: number; totalGroups?: number; policy?: number; roles?: number };
}

export interface IamUserAccessOverviewProps {
  details?: { activeUsersCount: number; totalUsers: number };
}

export interface IamUsersByTypeProps {
  userRolesCount?: Record<string, number>;
}

export interface IamUserRolesDashboardProps {
  searchTerm?: string;
  selectedRoles?: string[];
  onToggleRole?: (roleId: string) => void;
  selectedPermissions?: string[];
  onTogglePermission?: (permId: string) => void;
  selectionEnabled?: boolean;
}

export interface IamStepProps {
  setView: (v: number) => void;
  formData: any;
}

export interface IamStepWithSetProps extends IamStepProps {
  setFormData: (fn: any) => void;
}

export interface AddUserToGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  onUserAdded?: (users: string[]) => void;
}

export interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (role: any) => void;
  allPolicies: any[];
}

export interface EditUserPoliciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignedPolicies: { module?: string; name: string; description: string; policies?: { name: string; description: string }[] }[];
  allPolicies: any[];
  handler: (policies: string[]) => void;
  loader: boolean;
}

export interface SendBulkEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (subject: string, template: string) => void;
}

export interface PolicyItem {
  id: string;
  label: string;
  description: string;
  checked: boolean;
}

export interface PolicyGroup {
  id: string;
  title: string;
  items: PolicyItem[];
  isExpanded: boolean;
}
