import { BloodAlert, UserRole } from './types';

export const MOCK_ALERTS: BloodAlert[] = [
  {
    id: '1',
    bloodType: 'O',
    rhesus: '+',
    hospitalName: 'Hôpital Central',
    location: 'Yaoundé, Cameroun',
    timePosted: '1h',
    urgency: 'HIGH',
    bloodBankId: 'bank_1',
    alertDate: '2023-10-26T10:00:00Z',
    bankName: 'Hôpital Central',
    bankLocation: 'Yaoundé'
  },
  {
    id: '2',
    bloodType: 'A',
    rhesus: '+',
    hospitalName: 'Hôpital Général',
    location: 'Douala, Cameroun',
    timePosted: '3h',
    urgency: 'MEDIUM',
    bloodBankId: 'bank_2',
    alertDate: '2023-10-26T08:00:00Z',
    bankName: 'Hôpital Général',
    bankLocation: 'Douala'
  },
  {
    id: '3',
    bloodType: 'B',
    rhesus: '-',
    hospitalName: 'Centre Mère et Enfant',
    location: 'Yaoundé, Cameroun',
    timePosted: '5h',
    urgency: 'HIGH',
    bloodBankId: 'bank_1',
    alertDate: '2023-10-26T06:00:00Z',
    bankName: 'Centre Mère et Enfant',
    bankLocation: 'Yaoundé'
  }
];

export const MOCK_USER = {
  name: "Janet Tamwa",
  email: "janet.tamwa@example.com",
  phone: "+237 6 56 14 65 18",
  role: UserRole.DONOR,
  bloodType: "AB+",
  age: 23,
  location: "Yaoundé",
  lastDonation: "10/10/25"
};