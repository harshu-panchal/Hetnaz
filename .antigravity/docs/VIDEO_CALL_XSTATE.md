# Video Call XState Implementation

## Overview

The video call system has been refactored to use **XState** for deterministic state management. This replaces the previous event-based approach with a formal state machine that prevents race conditions and stale signal interference.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       Frontend Architecture                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │  VideoCallModal  │◄───│VideoCallContext  │                   │
│  │      (UI)        │    │   (XState Hook)  │                   │
│  └──────────────────┘    └────────┬─────────┘                   │
│                                   │                              │
│                          ┌────────▼─────────┐                   │
│                          │ videoCallMachine │                   │
│                          │   (State Logic)  │                   │
│                          └────────┬─────────┘                   │
│                                   │                              │
│     ┌─────────────────────────────┼─────────────────────────┐   │
│     │                             │                          │   │
│  ┌──▼───────────┐  ┌──────────────▼──────────┐  ┌───────────▼─┐ │
│  │AgoraManager  │  │SocketEventBridge       │  │AudioManager │ │
│  │(Agora SDK)   │  │(Socket.IO → Events)    │  │(Ringtones)  │ │
│  └──────────────┘  └─────────────────────────┘  └─────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## State Machine States

| State | Description |
|-------|-------------|
| `idle` | No active call. Ready for new calls. |
| `requesting` | Male is initiating a call. Media permissions being requested. |
| `ringing` | Call is ringing (outgoing for male, incoming for female). |
| `connecting` | Call accepted. Establishing Agora connection. |
| `connected` | Live video call in progress. Timer running. |
| `interrupted` | Call temporarily paused (network drop). Can rejoin. |
| `rejoining` | User is rejoining an interrupted call. |
| `ended` | Call has ended. May show rejoin option. |

## State Transitions

```
idle ──REQUEST_CALL──► requesting ──CALL_OUTGOING──► ringing
  │                                                      │
  │                                                      │
  ◄──────CALL_INCOMING────────────────────────────────────
                                                         │
                            ┌──────CALL_ACCEPTED─────────┤
                            │                            │
                            ▼                            │
                      connecting ◄──CALL_PROCEED─────────┘
                            │
                            ▼
                CALL_STARTED──► connected
                                    │
                           ┌────────┴────────┐
                           │                 │
                      END_CALL          CALL_ENDED
                           │                 │
                           ▼                 ▼
                         ended ◄─────────────┘
                           │
               ┌───────────┴───────────┐
               │                       │
        REJOIN_CALL              CLOSE_MODAL
               │                       │
               ▼                       ▼
          rejoining                  idle
               │
       REJOIN_PROCEED
               │
               ▼
          connecting
```

## Key Files

| File | Purpose |
|------|---------|
| `src/core/machines/videoCall.machine.ts` | XState machine definition |
| `src/core/machines/videoCall.actors.ts` | Side-effect handlers (Agora, Socket) |
| `src/core/context/VideoCallContextXState.tsx` | React context provider |
| `src/shared/components/VideoCallModal.tsx` | UI component |

## Benefits Over Previous Implementation

1. **Deterministic Transitions**: Only legal state transitions can occur. A `CALL_ACCEPTED` event while already `connected` is simply ignored.

2. **No Race Conditions**: The machine processes events sequentially. Double-clicks and duplicate signals are automatically handled.

3. **Automatic Cleanup**: When transitioning to `idle`, the machine's entry actions trigger full cleanup.

4. **Call ID Validation**: Guards ensure events are only processed for the current call, preventing stale signals from affecting new calls.

5. **HMR Safe**: The Agora manager is stored on `globalThis` in development, preventing UID_CONFLICT errors during hot reloads.

## Event Types

### User Actions
- `REQUEST_CALL` - Male initiates a call
- `ACCEPT_CALL` - Female accepts incoming call
- `REJECT_CALL` - Female rejects incoming call
- `END_CALL` - Either party ends the call
- `REJOIN_CALL` - User rejoins after interruption
- `TOGGLE_MUTE` / `TOGGLE_CAMERA` - Media controls
- `CLOSE_MODAL` - Dismiss the call UI

### Socket Events (from backend)
- `CALL_INCOMING` - Incoming call notification
- `CALL_OUTGOING` - Confirmation call is ringing
- `CALL_ACCEPTED` - Call was accepted (includes Agora credentials)
- `CALL_PROCEED` - For receiver, proceed to join Agora
- `CALL_REJECTED` - Call was rejected
- `CALL_STARTED` - Agora connection established, start timer
- `CALL_ENDED` - Call ended (with rejoin info)
- `CALL_FORCE_END` - Timer expired, hard end
- `CALL_MISSED` - Ringing timeout
- `CALL_ERROR` - Error occurred
- `CALL_CLEAR_ALL` - Emergency cleanup signal
- `PEER_WAITING` / `PEER_REJOINED` - Partner disconnection status
- `REJOIN_PROCEED` - Proceed with rejoin (new Agora credentials)

### Internal Events
- `MEDIA_INITIALIZED` / `MEDIA_FAILED` - Local media setup
- `AGORA_CONNECTED` / `AGORA_FAILED` - Agora channel status
- `REMOTE_USER_JOINED` / `REMOTE_USER_LEFT` - Peer track status
- `REMOTE_TRACK_UPDATED` - Track updates
- `TIMER_TICK` / `TIMER_EXPIRED` - Countdown timer
- `REJOIN_TIMEOUT` - Rejoin window expired

## Usage

```tsx
import { useVideoCall } from '../core/context/VideoCallContextXState';

function MyComponent() {
    const { 
        callState,     // Current state and context
        isInCall,      // Boolean: is user in a call?
        remainingTime, // Seconds remaining
        requestCall,   // Start a call
        acceptCall,    // Accept incoming call
        rejectCall,    // Reject incoming call
        endCall,       // End current call
        toggleMute,    // Toggle microphone
        toggleCamera,  // Toggle camera
        rejoinCall,    // Rejoin after interruption
        closeModal,    // Dismiss UI
    } = useVideoCall();
    
    // Access current state
    console.log(callState.status); // 'idle', 'ringing', 'connected', etc.
}
```

## Debugging

The state machine logs all transitions and events. Look for:
- `📞 [XState] State changed to:` - State transitions
- `📞 [SocketBridge]` - Socket events being received
- `🎥 [AgoraManager]` - Agora SDK operations

## Migration Notes

- The old `VideoCallContext` and `videoCall.service.ts` files are preserved but no longer used.
- All imports have been updated to use `VideoCallContextXState`.
- The backend remains unchanged; only the frontend state management was replaced.
