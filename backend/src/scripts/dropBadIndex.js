import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function dropBadIndex() {
    try {
        console.log('Connecting to MongoDB...', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');
        
        try {
            await mongoose.connection.collection('chats').dropIndex('participants.userId_1_isActive_1_deletedBy.userId_1_lastMessageAt_-1');
            console.log('Successfully dropped the invalid parallel array index!');
        } catch (e) {
            console.log('Index might not exist or already dropped.', e.message);
        }
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

dropBadIndex();
