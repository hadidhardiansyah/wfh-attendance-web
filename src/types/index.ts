export interface User {
  nik?: string;
  id: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  photoUrl?: string;
  role: "employee" | "admin";
  isActive?: boolean;
  suspendReason?: string | null;
  department?: any;
  division?: any;
  employmentStatus?: "intern" | "contract" | "permanent";
  createdAt?: string;
  updatedAt?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface Attendance {
  id: string;
  user?: User;
  date: string;
  checkIn?: string;
  checkOut?: string;
  createdAt?: string;
  status?: string;
  workHours?: number;
  checkInReason?: string;
  checkOutReason?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export interface AttendanceStatus {
  date: string;
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  checkIn: string | null;
  checkOut: string | null;
  status: string | null;
  workHours: number | null;
  checkInReason?: string | null;
  checkOutReason?: string | null;
  workStartTime?: string;
  workEndTime?: string;
  toleranceMinutes?: number;
}

export interface Notification {
  id: string;
  type: "PROFILE_UPDATED";
  message: string;
  userName: string;
  changedFields: string[];
  timestamp: string;
  read: boolean;
}
