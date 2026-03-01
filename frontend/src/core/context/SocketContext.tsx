/**
 * Socket Context - Provides Socket.IO connection across the app
 * @purpose: Manage socket connection lifecycle and provide real-time updates
 */

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import socketService from '../services/socket.service';
import { useAuth } from './AuthContext';

interface SocketContextType {
    isConnected: boolean;
    joinChat: (chatId: string) => void;
    leaveChat: (chatId: string) => void;
    sendTyping: (chatId: string, isTyping: boolean) => void;
    requestBalance: () => void;
    on: (event: string, callback: Function) => void;
    off: (event: string, callback: Function) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
    children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
    const { isAuthenticated } = useAuth();
    const [connected, setConnected] = useState(false);

    // Connect/disconnect based on auth status with DEFERRAL
    useEffect(() => {
        if (!isAuthenticated) {
            socketService.disconnect();
            setConnected(false);
            return;
        }

        let timeoutId: ReturnType<typeof setTimeout>;
        let isConnecting = false;

        // PHASED BOOT: Connect at 500ms — after initial REST fetches are in-flight.
        // GlobalStateContext registers listeners at 100ms, so they are always
        // ready 400ms before this fires. No event delivery gap possible.
        timeoutId = setTimeout(() => {
            isConnecting = true;
            socketService.connect();
            setConnected(true);
        }, 500);

        return () => {
            clearTimeout(timeoutId);
            // Only disconnect if we actually started connecting AND auth is now false
            // Don't disconnect on re-renders when still authenticated
            if (!isAuthenticated && isConnecting) {
                socketService.disconnect();
                setConnected(false);
            }
        };
    }, [isAuthenticated]);

    const value: SocketContextType = useMemo(() => ({
        isConnected: connected,
        joinChat: (chatId: string) => socketService.joinChat(chatId),
        leaveChat: (chatId: string) => socketService.leaveChat(chatId),
        sendTyping: (chatId: string, isTyping: boolean) => socketService.sendTyping(chatId, isTyping),
        requestBalance: () => socketService.requestBalance(),
        on: (event: string, callback: Function) => socketService.on(event, callback),
        off: (event: string, callback: Function) => socketService.off(event, callback),
    }), [connected]);

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = (): SocketContextType => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export default SocketContext;
