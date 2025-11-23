import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile as updateAuthProfile 
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  deleteDoc,
  Timestamp,
  orderBy,
  arrayUnion,
  increment
} from "firebase/firestore/lite";
import { UserRole, UserProfile, BloodAlert, BloodRequest, DonorResponse } from '../types';

const COLLECTIONS = {
  PROVIDERS: 'providers',
  DOCTORS: 'doctors',
  BLOOD_BANKS: 'bloodBanks', 
  BLOOD_REQUESTS: 'bloodRequests',
  ALERTS: 'alerts',
  ALERT_RESPONSES: 'alertResponses'
};

export const firebaseService = {
  register: async (data: any) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      await updateAuthProfile(user, { displayName: data.username });

      let birthDateTimestamp = null;
      if (data.dateBirth) {
          const d = new Date(data.dateBirth);
          if (!isNaN(d.getTime())) {
              birthDateTimestamp = Timestamp.fromDate(d);
          }
      }

      const basePayload = {
        uid: user.uid,
        username: data.username,
        email: data.email,
        role: data.role,
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        name: data.username,
        phoneNumber: data.phone || null,
        location: data.location || null,
      };

      let collectionName = '';
      let specificPayload = {};

      if (data.role === UserRole.DONOR) {
        collectionName = COLLECTIONS.PROVIDERS;
        specificPayload = {
            bloodGroup: data.bloodGroup || null,
            rhesus: data.rhesus || null,
            sexe: data.sexe || null,
            dateBirth: birthDateTimestamp,
            isAvailable: true
        };
      } else if (data.role === UserRole.DOCTOR) {
        collectionName = COLLECTIONS.DOCTORS;
        specificPayload = {
            speciality: 'General',
            grade: 'Doctor'
        };
      } else if (data.role === UserRole.BLOOD_BANK) {
        collectionName = COLLECTIONS.BLOOD_BANKS;
        specificPayload = {
            bloodBagCount: 0
        };
      }

      await setDoc(doc(db, collectionName, user.uid), {
        ...basePayload,
        ...specificPayload
      });

      return user;
    } catch (error: any) {
      console.error("Firebase Registration Error:", error);
      let message = "Erreur lors de l'inscription.";
      
      if (error.code === 'auth/email-already-in-use') {
          message = "Cette adresse email est déjà associée à un compte.";
      } else if (error.code === 'auth/weak-password') {
          message = "Le mot de passe est trop faible (6 caractères minimum).";
      } else if (error.code === 'auth/invalid-email') {
          message = "Le format de l'adresse email est invalide.";
      } else if (error.code === 'auth/network-request-failed') {
          message = "Erreur de connexion réseau.";
      }

      throw new Error(message);
    }
  },

  login: async (email: string, pass: string) => {
    try {
        return await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
        console.error("Firebase Login Error:", error);
        let message = "Erreur lors de la connexion.";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            message = "Email ou mot de passe incorrect.";
        } else if (error.code === 'auth/too-many-requests') {
            message = "Trop de tentatives échouées. Veuillez réessayer plus tard.";
        } else if (error.code === 'auth/invalid-email') {
            message = "Le format de l'adresse email est invalide.";
        }
        throw new Error(message);
    }
  },

  logout: async () => {
    return signOut(auth);
  },

  getUserProfile: async (uid: string): Promise<UserProfile | null> => {
    const collections = [COLLECTIONS.PROVIDERS, COLLECTIONS.DOCTORS, COLLECTIONS.BLOOD_BANKS];
    
    for (const col of collections) {
        const docRef = doc(db, col, uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            
            return {
                uid: data.uid,
                id: docSnap.id,
                name: data.name || data.username,
                email: data.email,
                role: data.role as UserRole,
                phone: data.phoneNumber,
                location: data.location,
                bloodType: data.bloodGroup,
                rhesus: data.rhesus,
                dateBirth: data.dateBirth?.toDate().toISOString().split('T')[0],
                age: data.dateBirth ? new Date().getFullYear() - data.dateBirth.toDate().getFullYear() : undefined,
                lastGive: data.lastGive?.toDate().toLocaleDateString(),
                sex: data.sexe
            };
        }
    }
    return null;
  },

  updateUserProfile: async (uid: string, role: UserRole, data: Partial<UserProfile>) => {
    let collectionName = '';
    if (role === UserRole.DONOR) collectionName = COLLECTIONS.PROVIDERS;
    else if (role === UserRole.DOCTOR) collectionName = COLLECTIONS.DOCTORS;
    else if (role === UserRole.BLOOD_BANK) collectionName = COLLECTIONS.BLOOD_BANKS;

    if (!collectionName) return;

    const updatePayload: any = {
        updatedAt: Timestamp.now(),
    };
    if (data.name) updatePayload.name = data.name;
    if (data.phone) updatePayload.phoneNumber = data.phone;
    if (data.location) updatePayload.location = data.location;
    if (data.bloodType) updatePayload.bloodGroup = data.bloodType;
    if (data.rhesus) updatePayload.rhesus = data.rhesus;
    
    if (data.dateBirth) {
        const d = new Date(data.dateBirth);
        if (!isNaN(d.getTime())) {
            updatePayload.dateBirth = Timestamp.fromDate(d);
        }
    }

    await updateDoc(doc(db, collectionName, uid), updatePayload);
  },
  
  createBloodRequest: async (requestData: any, user: UserProfile) => {
    if (user.role !== UserRole.DOCTOR) throw new Error("Seuls les médecins peuvent créer une demande.");

    const payload = {
        doctorId: user.uid,
        doctorName: user.name,
        bloodGroup: requestData.bloodType,
        rhesus: requestData.rhesus,
        quantity: 1,
        location: user.location || requestData.location,
        status: 'pending',
        requestDate: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    };

    await addDoc(collection(db, COLLECTIONS.BLOOD_REQUESTS), payload);
  },

  getDoctorRequests: async (doctorId: string): Promise<BloodRequest[]> => {
    const q = query(
        collection(db, COLLECTIONS.BLOOD_REQUESTS),
        where("doctorId", "==", doctorId),
        orderBy('requestDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            bloodType: data.bloodGroup,
            rhesus: data.rhesus,
            doctorName: data.doctorName,
            doctorId: data.doctorId,
            location: data.location,
            status: data.status,
            requestDate: data.requestDate,
            timePosted: calculateTimePosted(data.requestDate),
            validatedAt: data.validatedAt
        };
    });
  },

  getRequestById: async (id: string): Promise<BloodRequest | null> => {
      const docRef = doc(db, COLLECTIONS.BLOOD_REQUESTS, id);
      const snap = await getDoc(docRef);
      if(!snap.exists()) return null;
      const data = snap.data();
      return {
            id: snap.id,
            bloodType: data.bloodGroup,
            rhesus: data.rhesus,
            doctorName: data.doctorName,
            doctorId: data.doctorId,
            location: data.location,
            status: data.status,
            requestDate: data.requestDate,
            timePosted: calculateTimePosted(data.requestDate),
            validatedAt: data.validatedAt,
            validatedByBankId: data.validatedByBankId
      };
  },

  getPendingRequestsForBank: async (): Promise<BloodRequest[]> => {
    const q = query(
        collection(db, COLLECTIONS.BLOOD_REQUESTS),
        where("status", "==", "pending"),
        orderBy('requestDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            bloodType: data.bloodGroup,
            rhesus: data.rhesus,
            doctorName: data.doctorName,
            doctorId: data.doctorId,
            location: data.location,
            status: data.status,
            requestDate: data.requestDate,
            timePosted: calculateTimePosted(data.requestDate)
        };
    });
  },

  createAlert: async (alertData: any, bankUser: UserProfile, originalRequest: BloodRequest | null = null) => {
    if (bankUser.role !== UserRole.BLOOD_BANK) throw new Error("Seules les banques peuvent publier des alertes.");

    const payload = {
        alertDate: Timestamp.now(),
        bankLocation: bankUser.location || "Inconnu",
        bankName: bankUser.name || "Banque de sang",
        bloodBankId: bankUser.uid,
        bloodGroup: alertData.bloodType,
        createdAt: Timestamp.now(),
        doctorId: originalRequest ? originalRequest.doctorId : null,
        doctorName: originalRequest ? originalRequest.doctorName : null,
        hospitalName: originalRequest ? originalRequest.location : null,
        initiatedBy: originalRequest ? 'doctor' : 'bank',
        message: `BESOIN URGENT DE SANG ${alertData.bloodType}${alertData.rhesus}`,
        notificationsFailedCount: 0,
        notificationsSent: 1,
        requestId: originalRequest ? originalRequest.id : null,
        responseCount: 0,
        rhesus: alertData.rhesus,
        status: 'active',
        updatedAt: Timestamp.now(),
        urgencyLevel: 'high'
    };

    await addDoc(collection(db, COLLECTIONS.ALERTS), payload);

    if (originalRequest) {
        await updateDoc(doc(db, COLLECTIONS.BLOOD_REQUESTS, originalRequest.id), {
            status: 'accepted',
            validatedByBankId: bankUser.uid,
            validatedAt: Timestamp.now()
        });
    }
  },

  getPublicAlerts: async (): Promise<BloodAlert[]> => {
    const q = query(
        collection(db, COLLECTIONS.ALERTS), 
        where("status", "==", "active"),
        orderBy('alertDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        let displayHospital = data.bankName;
        let displayLocation = data.bankLocation;

        return {
            id: doc.id,
            bloodType: data.bloodGroup,
            rhesus: data.rhesus,
            hospitalName: displayHospital || "Banque de Sang",
            location: displayLocation || "Cameroun",
            timePosted: calculateTimePosted(data.alertDate),
            urgency: (data.urgencyLevel === 'high' ? 'HIGH' : data.urgencyLevel === 'medium' ? 'MEDIUM' : 'LOW'),
            bloodBankId: data.bloodBankId,
            alertDate: data.alertDate,
            originalRequestId: data.requestId,
            bankName: data.bankName,
            bankLocation: data.bankLocation,
            message: data.message,
            responseCount: data.responseCount
        };
    });
  },

  getAlertById: async (id: string): Promise<BloodAlert | null> => {
      const docRef = doc(db, COLLECTIONS.ALERTS, id);
      const snap = await getDoc(docRef);
      if(!snap.exists()) return null;
      const data = snap.data();
      return {
            id: snap.id,
            bloodType: data.bloodGroup,
            rhesus: data.rhesus,
            hospitalName: data.bankName || "Banque de Sang",
            location: data.bankLocation || "Cameroun",
            timePosted: calculateTimePosted(data.alertDate),
            urgency: (data.urgencyLevel === 'high' ? 'HIGH' : data.urgencyLevel === 'medium' ? 'MEDIUM' : 'LOW') ,
            bloodBankId: data.bloodBankId,
            alertDate: data.alertDate,
            originalRequestId: data.requestId,
            bankName: data.bankName,
            bankLocation: data.bankLocation,
            message: data.message,
            responseCount: data.responseCount,
            status: data.status,
            initiatedBy: data.initiatedBy
      };
  },

  deleteAlert: async (alertId: string) => {
    const docRef = doc(db, COLLECTIONS.ALERTS, alertId);
    await updateDoc(docRef, {
        status: 'cancelled',
        updatedAt: Timestamp.now()
    });
  },

  getAlertVolunteers: async (alertId: string): Promise<DonorResponse[]> => {
      const q = query(
        collection(db, COLLECTIONS.ALERT_RESPONSES),
        where("alertId", "==", alertId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
          const data = doc.data();
          return {
              id: doc.id,
              providerId: data.providerId,
              donorName: data.donorName || "Donneur",
              phoneNumber: data.phoneNumber || "",
              bloodGroup: data.bloodGroup,
              rhesus: data.rhesus,
              responseDate: data.responseDate,
              status: data.status
          } as DonorResponse;
      });
  },

  hasUserResponded: async (alertId: string, userId: string): Promise<boolean> => {
      const q = query(
          collection(db, COLLECTIONS.ALERT_RESPONSES),
          where("alertId", "==", alertId),
          where("providerId", "==", userId)
      );
      const snapshot = await getDocs(q);
      return !snapshot.empty;
  },

  respondToAlert: async (alertId: string, user: UserProfile) => {
    const alertRef = doc(db, COLLECTIONS.ALERTS, alertId);
    
    const q = query(
        collection(db, COLLECTIONS.ALERT_RESPONSES),
        where("alertId", "==", alertId),
        where("providerId", "==", user.uid)
    );
    const existingResponse = await getDocs(q);

    if (!existingResponse.empty) {
        const responseId = existingResponse.docs[0].id;
        await deleteDoc(doc(db, COLLECTIONS.ALERT_RESPONSES, responseId));
        await updateDoc(alertRef, {
            responseCount: increment(-1)
        });
        return "removed";
    }

    const alertSnap = await getDoc(alertRef);
    let hospitalName = "Établissement médical";
    if (alertSnap.exists()) {
        const data = alertSnap.data();
        hospitalName = data.bankName || hospitalName;
    }

    await updateDoc(alertRef, {
        responseCount: increment(1)
    });

    await addDoc(collection(db, COLLECTIONS.ALERT_RESPONSES), {
        providerId: user.uid,
        alertId: alertId,
        donorName: user.name,
        phoneNumber: user.phone,
        bloodGroup: user.bloodType,
        rhesus: user.rhesus,
        responseDate: Timestamp.now(),
        status: 'pledged',
        hospitalName: hospitalName
    });

    return "added";
  },

  getDonationHistory: async (userId: string) => {
    const q = query(
        collection(db, COLLECTIONS.ALERT_RESPONSES),
        where("providerId", "==", userId),
        orderBy("responseDate", "desc")
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dateFormatted: data.responseDate?.toDate().toLocaleDateString(),
          status: data.status,
          hospitalName: data.hospitalName
        };
    });
  }
};

function calculateTimePosted(firestoreTimestamp: any) {
    if (!firestoreTimestamp) return 'N/A';
    const date = firestoreTimestamp.toDate();
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    return diffInHours < 24 ? `${diffInHours}h` : `${Math.floor(diffInHours/24)}j`;
}