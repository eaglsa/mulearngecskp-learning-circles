import { Timestamp } from "firebase/firestore";

export type CircleStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "on_hold"
  | "deletion_requested";

export interface Circle {
  id: string;
  name: string;
  topic: string;
  description: string;
  status: CircleStatus;
  hostName: string;
  hostContact: string;
  /** How to interpret hostContact — optional for backwards-compat with old docs */
  hostContactType?: "phone" | "email" | "whatsapp";
  hostDepartment: string;
  passwordHash: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface Participant {
  id: string;
  name: string;
  department: string;
  avatarSeed: string;
  addedAt: Timestamp;
}

export type NewCircleData = Omit<Circle, "id" | "status" | "createdAt">;
export type NewParticipantData = Omit<Participant, "id" | "addedAt">;
