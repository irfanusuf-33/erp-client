import { create, StateCreator } from "zustand";

import { User, PermissionsData, FetchGroupsResponse, RoleCategory, PolicyCategory, PolicyGroupsResponse, Group } from "@/types/iam.types";
import { axiosInstance } from "@/lib/axiosInstance";






export type IamSlice = {
    users: User[];

    userData: User | null;
    IamdashboardData: any;

    permissionsData: PermissionsData | null;

    group: Group | null;
    groups: Group[];

    roles: RoleCategory[];
    policies: PolicyCategory[];

    iamLoading: boolean;
    iamErrorMsg: string

    // dispatch functions   // setFunctions are not necessary because  u dont use them often 
    // it needs proper usage of ssot so that u are not calling backend api un necessarily 


    // dash
    setIamDashboardData: (data: any) => void;

    //user
    setUsers: (users: User[]) => void;
    setUserData: (data: User) => void;

    // groups
    setgroups: (groups: any[]) => void;
    setGroupData: (data: Group) => void;

    // policies 
    setPolicies: (policies: PolicyCategory[]) => void;
    

    // niche 
    setPermissionsData: (data: PermissionsData) => void;
    clearIamData: () => void;


    // reducer Functions 


    // Dash 
    fetchIamDashboard: () => Promise<any>;


    // users
    getUsers: (page?: number, limit?: number) => Promise<any>;
    toggleUserStatus: (userIds: string[]) => Promise<any>;
    fetchUserDetails: (email: string) => Promise<User>;
    updateUserDetails: (userId: string, data: any) => Promise<User>;
    searchUsers: (searchTerm: string) => Promise<User>;
    searchUsersFromHrm: (searchTerm: string) => Promise<User>;


    // role 
    createRole: (roleName: string, policies: string[]) => Promise<any>;
    fetchRoles: () => Promise<RoleCategory[] | undefined>;
    fetchCustomRoles: () => Promise<RoleCategory[]>;
    fetchPolicies: () => Promise<PolicyCategory[] | undefined>;


    // group 
    createGroup: (groupData: Group, policyIds: string[]) => Promise<any>;
    fetchGroups: (page?: number, limit?: number) => Promise<any>;
    updateGroup: (groupId: string, data: any) => Promise<any>;
    toggleGroupStatus: (groupIds: string[]) => Promise<any>;
    addUserToGroup: (groupId: string, users: string[]) => Promise<any>;
    getGroupDetails: (groupName: string) => Promise<any>;
    removeUsersFromGroup: (
        groupName: string,
        groupId: string,
        selectedUsers: string[]
    ) => Promise<any>;


    // bulk email 
    fetchEmailTemplates: () => Promise<any>;
    sendBulkEmail: (payload: any) => Promise<any>;
    saveTemplate: (templateData: any) => Promise<any>;
    fetchTemplateFeilds: () => Promise<any>

}





export const createIamSlice: StateCreator<IamSlice> = ((set, get) => ({


    // intial State
    users: [],
    userData: null,

    permissionsData: null,
    IamdashboardData: null,


    group: null,
    groups: [],

    roles: [],
    policies: [],

    iamLoading: false,      
    iamErrorMsg: "",




    setIamDashboardData: (data) => set({ IamdashboardData: data }),   // not necessary 

    fetchIamDashboard: async () => {
        try {
            set({ iamLoading: true });

            const res = await axiosInstance.get("/iam/dashboard");

            if (res.data) {
                set({ IamdashboardData: res.data });
                return res.data;
            }

            return null;
        } catch (error) {
            console.log("Error fetching iam dashboard:", error);
            return null;
        } finally {
            set({ iamLoading: false });
        }
    },


    setPermissionsData: (data) => set({ permissionsData: data }),
    clearIamData: () => set({ userData: null, permissionsData: null }),

    setUsers: (users) => set({ users: users }),
    setUserData: (data) => set({ userData: data }),

    getUsers: async (page = 1, limit = 10) => {
        try {
            set({ iamLoading: true });

            const res = await axiosInstance.get(
                `/iam/users?page=${page}&limit=${limit}`
            );

            const newUsers =
                res.data?.users ||
                res.data?.data?.users ||
                (Array.isArray(res.data) ? res.data : []);

            if (page === 1) {
                set({ users: newUsers });
            } else {
                set({ users: [...get().users, ...newUsers] });
            }

            return res.data;
        } catch (error: any) {
            console.log("Error fetching users:", error);
            set({ iamErrorMsg: error.message })
            return null;
        } finally {
            set({ iamLoading: false });
        }
    },

    toggleUserStatus: async (userIds) => {
        try {
            const res = await axiosInstance.post("/iam/users/toggle-status", {
                userIds,
            });

            if (res.data.success || res.status === 200) {
                const updated = get().users.map((user) => {
                    if (userIds.includes(user._id)) {
                        return { ...user, disabled: !user.disabled };
                    }
                    return user;
                });

                set({ users: updated });
            }

            return { success: true, ...res.data };
        } catch (error: any) {
            console.log("Error toggling user status:", error);

            return {
                success: false,
                msg:
                    error?.response?.data?.message ||
                    error?.response?.data?.msg ||
                    "Failed to update status",
            };
        }
    },

    fetchUserDetails: async (email) => {
        try {
            const res = await axiosInstance.get(`/iam/users/${email}`);
            return res.data;
        } catch (error) {
            console.log("Error fetching user details:", error);
            return null;
        }
    },

    updateUserDetails: async (userId, data) => {
        try {
            const res = await axiosInstance.put(`/iam/user/${userId}`, data);

            if (res.data.success || res.status === 200) {
                const updatedUsers = get().users.map((user) =>
                    user._id === userId ? { ...user, ...data } : user
                );

                set({ users: updatedUsers });
            }

            return res.data;
        } catch (error) {
            console.log("Error updating user:", error);
            return null;
        }
    },

    searchUsers: async (searchTerm) => {
        try {
            const res = await axiosInstance.get(
                `/iam/users/search?search=${searchTerm}`
            );

            return res.data;
        } catch (error) {
            console.log("Error searching users:", error);
            return null;
        }
    },

    searchUsersFromHrm: async (searchTerm) => {
        try {
            const res = await axiosInstance.get(
                `/hrm/employee/search?searchTerm=${searchTerm}`
            );

            return res.data;
        } catch (error) {
            console.log("Error searching users:", error);
            return null;
        }
    },


    // Groups 

    setgroups: (groups) => set({ groups: groups }),

    setGroupData: (group) => set({ group: group }),


    createGroup: async (groupData, policyIds) => {
        try {
            const formData = new FormData();

            formData.append("name", groupData.groupName);
            formData.append("description", groupData.groupDescription);
            formData.append("admin", groupData.groupAdmin);
            formData.append("code", groupData.groupCode);

            policyIds.forEach((id) => {
                formData.append("policyIds", id);
            });

            if (groupData.files?.length) {
                groupData.files.forEach((file) => {
                    formData.append(
                        "files",
                        {
                            uri: file.uri,
                            type: file.mimeType || "application/pdf",
                            name: file.name,
                        } as any
                    );
                });
            }

            const res = await axiosInstance.post("/iam/groups/create", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (res.data.success || res.status === 200) {
                const newGroup = res.data.group || res.data.data;

                if (newGroup) {
                    set({
                        groups: [
                            {
                                ...newGroup,
                                name: newGroup.name || groupData.groupName,
                                description:
                                    newGroup.description || groupData.groupDescription,
                                status: newGroup.disabled ? "Disable" : "Active",
                            },
                            ...get().groups,
                        ],
                    });
                }
            }

            return res.data;
        } catch (error: any) {
            console.log("Error creating group:", error);

            return {
                success: false,
                msg:
                    error?.response?.data?.message ||
                    error?.response?.data?.msg ||
                    "Failed to create group",
            };
        }
    },

    updateGroup: async (groupId, data) => {
        try {
            const res = await axiosInstance.put(`/iam/group/${groupId}`, data);
            return res.data;
        } catch (error: any) {
            console.log("Error updating group:", error);

            return {
                success: false,
                msg:
                    error?.response?.data?.message || "Failed to update group",
            };
        }
    },

    toggleGroupStatus: async (groupIds) => {
        try {
            const res = await axiosInstance.post("/iam/groups/disable", {
                groupIds,
            });

            if (res.data.success || res.status === 200) {
                const updated = get().groups.map((group: Group) => {
                    if (groupIds.includes(group._id)) {
                        const nextDisabled = !group.disabled;

                        return {
                            ...group,
                            disabled: nextDisabled,
                            status: nextDisabled ? "Disable" : "Active",
                        };
                    }
                    return group;
                });

                set({ groups: updated });
            }

            return { success: true, ...res.data };
        } catch (error: any) {
            console.log("Error toggling group status:", error);

            return {
                success: false,
                msg:
                    error?.response?.data?.message ||
                    error?.response?.data?.msg ||
                    "Failed to update group status",
            };
        }
    },

    fetchGroups: async (page = 1, limit = 10) => {
        try {
            const res = await axiosInstance.get(
                `/iam/groups?page=${page}&limit=${limit}`
            );

            const apiGroups: Group[] =
                res.data.data?.groups || res.data.groups || [];

            const mappedGroups = apiGroups.map((group) => ({
                ...group,
                status: group.disabled ? "Disable" : "Active",
            }));

            if (page === 1) {
                set({ groups: mappedGroups });
            } else {
                set({ groups: [...get().groups, ...mappedGroups] });
            }

            return res.data;
        } catch (error) {
            console.log("Error fetching groups:", error);
            return null;
        }
    },

    getGroupDetails: async (groupName) => {
        try {
            const res = await axiosInstance.get(`/iam/groups/${groupName}`);

            set({ group: res.data });

            return res.data;
        } catch (error) {
            console.log("Error fetching group details:", error);
            return null;
        }
    },

    addUserToGroup: async (groupId, users) => {
        try {
            const res = await axiosInstance.post("/iam/groups/assign", {
                form: {
                    groupId,
                    users,
                },
            });

            return res.data;
        } catch (error: any) {
            console.log("Error adding user to group:", error);

            return {
                success: false,
                msg: error?.response?.data?.message || "Failed to add user",
            };
        }
    },

    removeUsersFromGroup: async (groupName, groupId, selectedUsers) => {
        try {
            const res = await axiosInstance.post(
                `/iam/groups/${groupName}/delete-users`,
                {
                    group: groupId,
                    selectedUsers,
                }
            );

            return res.data;
        } catch (error: any) {
            console.log("Error removing users from group:", error);

            return {
                success: false,
                msg:
                    error?.response?.data?.message || "Failed to remove users",
            };
        }
    },







    //Bulk  Email 

    fetchEmailTemplates: async () => {
        try {
            const res = await axiosInstance.get('/iam/email-templates');
            return res.data;
        } catch (error: any) {
            console.log('Error fetching email templates:', error);

            return {
                success: false,
                msg: error?.response?.data?.message || 'Failed to fetch email templates'
            };
        }
    },

    sendBulkEmail: async (payload: any) => {
        try {
            const res = await axiosInstance.post('/iam/groups/bulk-email', payload);
            return res.data;
        } catch (error: any) {
            console.log('Error sending bulk email:', error);

            return {
                success: false,
                msg: error?.response?.data?.message || 'Failed to send bulk email'
            };
        }
    },

    saveTemplate: async (templateData: any) => {
        try {
            const res = await axiosInstance.post('/iam/email-templates', templateData);
            return res.data;
        } catch (error: any) {
            console.log('Error saving template:', error);

            return {
                success: false,
                msg: error?.response?.data?.message || 'Failed to save template'
            };
        }
    },

    fetchTemplateFeilds: async () => {
        try {
            const res = await axiosInstance.get('/account/profile-dashboard');
            return res.data;
        } catch (error: any) {
            console.log('Error fetching template fields:', error);
            return null;
        }
    },


    // policies 

    setPolicies: (policies) => set({ policies }),

    fetchPolicies: async () => {
        try {
            const res = await axiosInstance.get("/iam/policies");

            const policyGroups: PolicyGroupsResponse[] = res.data.policyGroups || [];

            const transformedPolicies: PolicyCategory[] = policyGroups.flatMap(
                (group) =>
                    Object.entries(group).map(([categoryName, policiesMap]) => ({
                        id: categoryName,
                        title: categoryName
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase()),

                        policies: Object.entries(policiesMap).map(
                            ([policyName, policy]) => ({
                                id: policyName,
                                name: policyName
                                    .replace(/_/g, " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase()),

                                description: policy.description,
                                selected: false,
                                showDescription: false,
                            })
                        ),
                    }))
            );

            set({ policies: transformedPolicies });

            return transformedPolicies;
        } catch (error) {
            console.log("Error fetching policies:", error);
        }
    },


    // roles 

    createRole: async (roleName: string, policies: string[]) => {
        try {
            const res = await axiosInstance.post("/iam/roles", {
                roles: {
                    name: roleName,
                    policyIds: policies,
                },
            });

            return res.data;
        } catch (error: any) {
            console.log("Error creating role:", error);

            return {
                success: false,
                msg:
                    error?.response?.data?.message ||
                    error?.response?.data?.msg ||
                    "Failed to create role",
            };
        }
    },

    fetchCustomRoles: async () => {
        try {
            const res = await axiosInstance.get("/iam/roles/custom");

            const apiCustomRoles: any[] = res.data.data || res.data.roles || [];

            if (apiCustomRoles.length === 0) return [];

            const transformedCustomRoles: RoleCategory[] = [
                {
                    id: "custom_roles_category",
                    title: "Custom Roles",
                    policies: apiCustomRoles.map((role) => ({
                        id: role._id || role.name,
                        name: role.name,
                        selected: false,
                        showDescription: false,
                        description: `Policies: ${Array.isArray(role.policies)
                            ? role.policies.join(", ")
                            : Array.isArray(role.policyIds)
                                ? role.policyIds.join(", ")
                                : Array.isArray(role.permissions)
                                    ? role.permissions.join(", ")
                                    : ""
                            }`,
                    })),
                },
            ];

            return transformedCustomRoles;
        } catch (error) {
            console.log("Error fetching custom roles:", error);
            return [];
        }
    },

    fetchRoles: async () => {
        try {
            const res = await axiosInstance.get("/iam/roles");

            const apiRolesArray = res.data.roles || [];
            const rolesObj = apiRolesArray[0] || {};

            const transformedRoles: RoleCategory[] = [
                {
                    id: "roles_category",
                    title: "System Roles",
                    policies: Object.keys(rolesObj).map((roleName) => ({
                        id: roleName,
                        name: roleName
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase()),
                        selected: false,
                        showDescription: false,
                        description: `Policies: ${Array.isArray(rolesObj[roleName])
                            ? rolesObj[roleName].join(", ")
                            : ""
                            }`,
                    })),
                },
            ];

            const customRoles = await get().fetchCustomRoles();

            const combinedRoles = [...transformedRoles];

            if (customRoles && customRoles.length > 0) {
                combinedRoles.push(...customRoles);
            }

            set({ roles: combinedRoles });

            return combinedRoles;
        } catch (error) {
            console.log("Error fetching roles:", error);
        }
    },






}));