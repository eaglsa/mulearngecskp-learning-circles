import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  writeBatch,
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
 * Update only the status field of a circle (approve, reject, hold, etc.).
 */
export async function setCircleStatus(
  id: string,
  status: Circle["status"]
): Promise<void> {
  const ref = doc(db, CIRCLES_COL, id);
  await updateDoc(ref, { status, updatedAt: serverTimestamp() });
}

/**
 * Admin: update editable fields on a circle. Also stamps updatedAt.
 */
export async function updateCircle(
  circleId: string,
  fields: Partial<Pick<Circle, "name" | "topic" | "description" | "hostName" | "hostContact" | "hostContactType" | "hostDepartment">>
): Promise<void> {
  const ref = doc(db, CIRCLES_COL, circleId);
  await updateDoc(ref, { ...fields, updatedAt: serverTimestamp() });
}

/**
 * Host: request that an admin delete this circle.
 * Sets status to "deletion_requested".
 */
export async function requestCircleDeletion(circleId: string): Promise<void> {
  return setCircleStatus(circleId, "deletion_requested");
}

/**
 * Admin: confirm a deletion request — cascade-deletes participants then the circle doc.
 */
export async function confirmCircleDeletion(circleId: string): Promise<void> {
  const participantsSnap = await getDocs(participantsCol(circleId));

  // Batch-delete participants (500-per-batch limit — fine at this scale)
  const batch = writeBatch(db);
  participantsSnap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();

  // Delete the circle doc itself
  await deleteDoc(doc(db, CIRCLES_COL, circleId));
}

/**
 * Admin: deny a deletion request — reverts the circle back to "approved".
 */
export async function denyCircleDeletion(circleId: string): Promise<void> {
  return setCircleStatus(circleId, "approved");
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

/**
 * Host: rename a participant (only the name field changes).
 */
export async function updateParticipant(
  circleId: string,
  participantId: string,
  name: string
): Promise<void> {
  const ref = doc(participantsCol(circleId), participantId);
  await updateDoc(ref, { name });
}

/**
 * Host: remove a participant from a circle's subcollection.
 */
export async function deleteParticipant(
  circleId: string,
  participantId: string
): Promise<void> {
  const ref = doc(participantsCol(circleId), participantId);
  await deleteDoc(ref);
}
