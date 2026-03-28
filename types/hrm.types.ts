// types/hrm.types.ts

// ─── Shared ────────────────────────────────────────────────────────────────────

export type LeaveStatus = "Pending" | "Approved" | "Rejected";

export type ApplicationStatus =
  | "Applied"
  | "Under Review"
  | "Interview Scheduled"
  | "Selected"
  | "Rejected";

export type EmploymentType = "Full-time" | "Part-time" | "Contract";

export type JobStatus = "Open" | "Closed" | "Draft";

// ─── Dashboard ─────────────────────────────────────────────────────────────────
export interface Alert {
  message: string;
  time: string;
}
export interface DashboardStats {
  totalEmployees: number;
  activeSessions: number;
  leavesRaised: number;
  checkouts: number;
  employeeGrowth: string;
  sessionsOnlinePercent: number;
  leavesPending: number;
}

export interface Holiday {
  _id: string;
  name: string;
  date: string;
}

export interface HrmEvent {
  _id: string;
  title: string;
  date: string;
  time: string;
}

export interface HrmAlert {
  _id: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface Announcement {
  _id: string;
  text: string;
  createdAt: string;
}

// ─── Employee ──────────────────────────────────────────────────────────────────

export interface Employee {
  _id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  joiningDate: string;
  status: "Active" | "Inactive";
  avatar?: string;
  disabled?: boolean;
}

export interface EmployeeDetails extends Employee {
  personalDetails: {
    dateOfBirth: string;
    gender: string;
    maritalStatus: string;
    nationality: string;
  };
  addressDetails: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  bankDetails: {
    accountNumber: string;
    bankName: string;
    ifscCode: string;
  };
  contactDetails: {
    emergencyContactName: string;
    emergencyContactPhone: string;
    relationship: string;
  };
  organizationalDetails: {
    employeeId: string;
    reportingManager: string;
    workLocation: string;
    employmentType: EmploymentType;
  };
}

export interface CreateEmployeePayload {
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  joiningDate: string;
  personalDetails: EmployeeDetails["personalDetails"];
  addressDetails: EmployeeDetails["addressDetails"];
  bankDetails: EmployeeDetails["bankDetails"];
  contactDetails: EmployeeDetails["contactDetails"];
  organizationalDetails: EmployeeDetails["organizationalDetails"];
}

// ─── Leave ─────────────────────────────────────────────────────────────────────

export interface LeaveBalance {
  _id: string;
  name: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}

export interface Leave {
  _id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  reviewedBy?: string;
  reviewNote?: string;
}

export interface ApplyLeavePayload {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
}

// ─── Jobs ──────────────────────────────────────────────────────────────────────

export interface JobTemplate {
  _id: string;
  title: string;
  department: string;
  description: string;
  requirements: string[];
  createdAt: string;
}

export interface JobListing {
  _id: string;
  title: string;
  department: string;
  location: string;
  type: EmploymentType | "Internship";
  description: string;
  requirements: string[];
  postedDate: string;
  closingDate: string;
  status: JobStatus;
  applicantCount: number;
}

export interface JobApplication {
  _id: string;
  jobId: string;
  jobTitle: string;
  applicantName: string;
  applicantEmail: string;
  appliedDate: string;
  status: ApplicationStatus;
  resumeUrl?: string;
  coverLetter?: string;
}

// ─── Attendance ────────────────────────────────────────────────────────────────

export interface AttendanceRecord {
  _id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: "Present" | "Absent" | "Late" | "Half Day";
}

export interface CheckInPayload {
  employeeId: string;
  location?: string;
}
// types/hrm.types.ts
export interface Attendance {
  _id: string;
  name: string;
  session: string;
  tasks: string[];           // ← was string, should be string[]
  totalHours: string;
  breaks: string[];
  status: "In a meeting" | "On call" | "Working" | "On Break";
  arrival: "On Time" | "Late" | "Early Out" | "NA";  // ← added "Early Out"
}