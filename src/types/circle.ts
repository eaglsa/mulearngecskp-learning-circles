import { Timestamp } from "firebase/firestore";

export type CircleStatus = "pending" | "approved" | "rejected";

export interface Circle {
  id: string;
  name: string;
  topic: string;
  description: string;
  status: CircleStatus;
  hostName: string;
  hostContact: string;
  hostDepartment: string;
  passwordHash: string;
  createdAt: Timestamp;
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
