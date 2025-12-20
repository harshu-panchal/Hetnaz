/**
 * Socket Context - Provides Socket.IO connection across the app
 * @purpose: Manage socket connection lifecycle and provide real-time updates
 */

import { createContext, useContext, useEffect, ReactNode } from 'react';
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

    // Connect/disconnect based on auth status
    useEffect(() => {
        if (isAuthenticated) {
            socketService.connect();
        } else {
            socketService.disconnect();
        }

        return () => {
            socketService.disconnect();
        };
    }, [isAuthenticated]);

    const value: SocketContextType = {
        isConnected: socketService.isConnected(),
        joinChat: (chatId: string) => socketService.joinChat(chatId),
        leaveChat: (chatId: string) => socketService.leaveChat(chatId),
        sendTyping: (chatId: string, isTyping: boolean) => socketService.sendTyping(chatId, isTyping),
        requestBalance: () => socketService.requestBalance(),
        on: (event: string, callback: Function) => socketService.on(event, callback),
        off: (event: string, callback: Function) => socketService.off(event, callback),
    };

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
