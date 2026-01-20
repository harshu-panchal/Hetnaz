# Standard Operating Procedure (SOP): Video Call & Rejoin System

## 1. System Overview
The Toki Video Call system is a specialized WebRTC implementation designed for high-reliability, real-time billing, and persistent state management. It allows users to engage in timed video sessions with a robust "rejoin" mechanism to handle accidental disconnections without premature billing termination.

### Core Technology Stack:
*   **Media**: [Agora.io SDK (Web)](https://www.agora.io/en/products/video-call/) for low-latency WebRTC streams.
*   **Signaling**: Socket.IO for real-time state synchronization.
*   **State Management**: **XState** (FSM) for deterministic UI and logic transitions.
*   **Backend**: Node.js/Express with MongoDB for session persistence and billing.

---

## 2. End-to-End Workflow

### A. Initiation Phase
1.  **Request**: Caller (Male) sends `call:request`. Backend validates coins and creates a `VideoCall` record in `pending` state.
2.  **Ringing**: Receiver (Female) receives `call:incoming`. A 20-second ringing timer starts on the backend.
3.  **Acceptance**: Receiver accepts. Signal `call:accept` joins both users to a specific `socket.io` room named after the `callId`.

### B. Connection Phase (XState & Agora)
1.  **Credentialing**: Backend generates Agora RTC tokens. Frontend receives `call:proceed`.
2.  **Joining**: The XState machine enters `connecting`. The `AgoraManager` service initiates `joinChannel`.
3.  **Synchronization**: Once both are joined, the backend starts the authoritative call timer (default 5 min). Frontends transition to `connected`.

### C. The Rejoin Workflow (Accidental Disconnects)
The system distinguishes between "Soft Ending" (allow rejoin) and "Hard Ending" (permanent termination).

1.  **Detection**: If a user clicks "End" or their socket disconnects with **>10s remaining**:
    - Backend puts call into `interrupted` status.
    - Authoritative timer is PAUSED.
    - Other participant sees a "Waiting..." overlay and their local timer pauses.
2.  **Rejoin Limitation**: 
    - Each user is granted **exactly ONE rejoin attempt** per call.
    - Tracked via `rejoinedUserIds` array in the database.
3.  **Return**: On `call:rejoin`, the backend cancels the interruption timeout, sends fresh tokens, and importantly, sends the **authoritative remaining time** to resync both clients.

### D. Termination Phase
1.  **Timer Expiry**: Backend timer hits zero -> emits `call:ended` (Hard End).
2.  **User Hard End**: If a user clicks "End Permanently" or disconnects for a second time, the call is hard-ended.
3.  **Cleanup**: `User.isOnCall` is set to `false`, coins are finalized, and a `call:clear-all` signal forces the UI back to the dashboard.

---

## 3. Problems Faced & Engineering Solutions

| Problem | Symptoms | Approach / Solution |
| :--- | :--- | :--- |
| **Race Conditions** | Signals arriving out of order caused UI ghosts (e.g., ringing after accept). | **XState Integration**: Replaced boolean flags with a formal Finite State Machine. Invalid transitions are mathematically impossible. |
| **Duplicate Media Tracks** | Rejoining created multiple audio/video instances, causing echos or black screens. | **Join Safeguards**: Implemented `agoraJoinInitiatedRef` and `isInternalProcessing` guards to ensure only one Agora connection exists per session. |
| **Timer Desync** | Participants showed different countdowns after rejoining. | **Authoritative Backend Sync**: The backend now includes `remainingTime` in the `PEER_REJOINED` signal. Frontends "snap" to this value on arrival. |
| **Silent Disconnects** | The "Waiting" UI didn't appear for the active user when the peer crashed. | **Socket Rooms**: Participants now join a shared `callId` room. Notifications are broadcast to the room rather than individual socket IDs for 100% reliability. |
| **Status Stuck** | UI remained in "REJOINING..." even if the backend failed. | **Stable State Resets**: Expanded `useEffect` monitors to reset global loading states when any terminal state (`idle`, `ended`, `connected`) is reached. |

---

## 4. Maintenance & Debugging

### Key Logs to Watch:
*   **Backend**: `🔍 Call end decision` (Shows why a call was soft or hard ended).
*   **Frontend**: `📞 [XState] State changed to:` (Tracks transition history).
*   **Signaling**: `📞📞📞 SOCKET RECEIVED` (Verifies message delivery).

### Common SOP for New Features:
1.  Update `videoCall.machine.ts` first if adding a new state.
2.  Ensure every `socket.emit` on the backend uses the `io.to(callId)` room for consistency.
3.  Always pass `remainingTime` in any "started" or "resumed" event.

---
**Status**: 100% Functional & Verified with Per-User Rejoin Enforcement.
