import {
  notifyStudentTutorAssigned,
  notifyStudentTutorReallocated,
} from "./studentAllocation.js";
import {
  notifyTutorGainedStudent,
  notifyTutorLostStudent,
} from "./tutorAllocation.js";

/**
 * After a student↔tutor upsert: email student + affected tutor(s).
 * @param {null | { tutorId: string, tutor: { name: string | null, email: string } | null }} prior - allocation before change (null = first assignment)
 * @param {object} allocation - row with student + tutor (emails required)
 */
export function notifyPartiesAfterAllocationUpsert(prior, allocation) {
  const newTutorId = allocation.tutor.id;
  const { student, tutor } = allocation;

  if (!prior) {
    notifyStudentTutorAssigned(student.email, student.name, tutor.name);
    notifyTutorGainedStudent(tutor.email, tutor.name, student.name, null);
    return;
  }
  if (prior.tutorId === newTutorId) return;

  notifyStudentTutorReallocated(
    student.email,
    student.name,
    tutor.name,
    prior.tutor?.name,
  );
  if (prior.tutor?.email) {
    notifyTutorLostStudent(
      prior.tutor.email,
      prior.tutor.name ?? "Tutor",
      student.name,
    );
  }
  notifyTutorGainedStudent(
    tutor.email,
    tutor.name,
    student.name,
    prior.tutor?.name,
  );
}
