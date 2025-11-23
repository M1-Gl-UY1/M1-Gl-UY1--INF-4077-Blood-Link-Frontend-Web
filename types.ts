export enum UserRole {
  DONOR = 'provider',
  DOCTOR = 'doctor',
  BLOOD_BANK = 'bank'
}

export enum AppView {
  SPLASH = 'SPLASH',
  LOGIN = 'LOGIN',
  REGISTER_ROLE_SELECT = 'REGISTER_ROLE_SELECT',
  REGISTER_FORM = 'REGISTER_FORM',
  DASHBOARD = 'DASHBOARD',
  PROFILE = 'PROFILE',
  MEDICAL_FOLDER = 'MEDICAL_FOLDER',
  ALERT_DETAILS = 'ALERT_DETAILS',
  REQUEST_DETAILS = 'REQUEST_DETAILS'
}

export interface BloodAlert {
  id: string;
  bloodType: string;
  rhesus: string;
  hospitalName: string;
  location: string;
  timePosted: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  
  bloodBankId: string;
  alertDate: any;
  createdAt?: any;
  updatedAt?: any;
  
  bankName?: string;
  bankLocation?: string;
  doctorId?: string | null;
  doctorName?: string | null;
  initiatedBy?: 'bank' | 'doctor';
  message?: string;
  notificationsFailedCount?: number;
  notificationsSent?: number;
  originalRequestId?: string | null;
  responseCount?: number;
  status?: string;
}

export interface BloodRequest {
  id: string;
  bloodType: string;
  rhesus: '+' | '-';
  doctorName: string;
  doctorId: string;
  location: string;
  requestDate: any;
  status: 'pending' | 'accepted' | 'rejected';
  timePosted: string;
  validatedAt?: any;
  validatedByBankId?: string;
}

export interface UserProfile {
  uid: string;
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  bloodType?: string;
  rhesus?: string;
  phone?: string;
  location?: string;
  age?: number;
  dateBirth?: string;
  lastGive?: string;
  sex?: 'M' | 'F';
  speciality?: string;
  grade?: string;
  bloodBagCount?: number;
}

export interface DonorResponse {
  id: string;
  providerId: string;
  donorName: string;
  phoneNumber: string;
  bloodGroup: string;
  rhesus: string;
  responseDate: any;
  status: string;
}