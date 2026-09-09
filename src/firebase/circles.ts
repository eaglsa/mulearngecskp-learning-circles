import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import type { Circle, Participant, NewCircleData, NewParticipantData } from "../types/circle";

const CIRCLES_COL = "circles";

// ─── Circle CRUD ─────────────────────────────────────────────────────────────

/**
 * Submit a new circle request (lands with status: "pending").
 */
export async function requestCircle(
  data: NewCircleData
): Promise<string> {
  const ref = await addDoc(collection(db, CIRCLES_COL), {
    ...data,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Fetch all approved circles, ordered by creation date (newest first).
 */
export async function getApprovedCircles(): Promise<Circle[]> {
  const q = query(
    collection(db, CIRCLES_COL),
    where("status", "==", "approved"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Circle));
}

/**
 * Fetch all circles regardless of status (used by admin panel).
 * Admin route is gated by password in the UI; Firestore rules allow this read path.
 */
export async function getAllCircles(): Promise<Circle[]> {
  const q = query(
    collection(db, CIRCLES_COL),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Circle));
}

/**
 * Fetch circles filtered by status (used by admin panel tabs).
 */
export async function getCirclesByStatus(
  status: Circle["status"]
): Promise<Circle[]> {
  const q = query(
    collection(db, CIRCLES_COL),
    where("status", "==", status),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Circle));
}

/**
 * Fetch a single circle by ID (works for any status — used by host dashboard
 * and circle detail page).
 */
export async function getCircleById(id: string): Promise<Circle | null> {
  const ref = doc(db, CIRCLES_COL, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Circle;
}

/**
 * Update only the status field of a circle (approve or reject).
 */
export async function setCircleStatus(
  id: string,
  status: Circle["status"]
): Promise<void> {
  const ref = doc(db, CIRCLES_COL, id);
  await updateDoc(ref, { status });
}

// ─── Participants ────────────────────────────────────────────────────────────

function participantsCol(circleId: string) {
  return collection(db, CIRCLES_COL, circleId, "participants");
}

/**
 * Add a participant to a circle's subcollection.
 */
export async function addParticipant(
  circleId: string,
  data: NewParticipantData
): Promise<string> {
  const ref = await addDoc(participantsCol(circleId), {
    ...data,
    addedAt: serverTimestamp() as Timestamp,
  });
  return ref.id;
}

/**
 * Fetch all participants in a circle, ordered by join date.
 */
export async function getParticipants(
  circleId: string
): Promise<Participant[]> {
  const q = query(participantsCol(circleId), orderBy("addedAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Participant));
}
