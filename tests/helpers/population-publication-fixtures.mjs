// SYNTHETIC EDITORIAL DECISIONS FOR TESTS ONLY. No project owner authorization is issued.
export function syntheticOwnerDecision(manifest) {
 return {schemaVersion:1,decisionId:'synthetic-editorial-test-only',ownerRole:'project_owner',populationPublicationStatus:'authorized',date:'2026-10-29',reason:'SYNTHETIC TEST ONLY — not an actual owner decision or permission to publish.',packetFingerprint:manifest.fingerprint,authorizedCandidates:structuredClone(manifest.candidates)}
}
export const candidateIdentity = c => structuredClone(c.identity)
