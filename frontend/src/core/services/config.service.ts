import apiClient from '../api/client';

export interface AppConfig {
    general: {
        platformName: string;
        supportEmail: string;
        supportPhone: string;
        maintenanceMode: boolean;
        registrationEnabled: boolean;
    };
    messageCosts: {
        basic: number;
        silver: number;
        gold: number;
        platinum: number;
        hiMessage: number;
        imageMessage: number;
        videoCall: number;
    };
    withdrawal: {
        minAmount: number;
        maxAmount: number;
    };
}

class ConfigService {
    private config: AppConfig | null = null;
    private lastFetch: number = 0;
    private CACHE_TTL = 1000 * 60 * 5; // 5 minutes

    async getConfig(): Promise<AppConfig> {
        const now = Date.now();
        if (this.config && (now - this.lastFetch < this.CACHE_TTL)) {
            return this.config;
        }

        const data = await this.refreshConfig();
        return data;
    }

    async refreshConfig(): Promise<AppConfig> {
        try {
            const response = await apiClient.get('/users/config');
            this.config = response.data.data.settings;
            this.lastFetch = Date.now();
            return this.config!;
        } catch (error) {
            console.error('Failed to fetch app config:', error);
            // Return defaults if failed and no cache
            if (!this.config) {
                return {
                    general: {
                        platformName: 'HETNAZ',
                        supportEmail: 'support@hetnaz.com',
                        supportPhone: '',
                        maintenanceMode: false,
                        registrationEnabled: true
                    },
                    messageCosts: {
                        basic: 50,
                        silver: 45,
                        gold: 40,
                        platinum: 35,
                        hiMessage: 5,
                        imageMessage: 100,
                        videoCall: 500
                    },
                    withdrawal: {
                        minAmount: 500,
                        maxAmount: 50000
                    }
                };
            }
            return this.config;
        }
    }
}

export const configService = new ConfigService();
export default configService;
