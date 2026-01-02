# Image Sending in Chat - Implementation Guide

## Backend Setup ✅

### 1. Cloudinary Configuration
- **File:** `backend/src/config/cloudinary.js`
- **Purpose:** Configure Cloudinary client
- **Env vars needed:**
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

### 2. Image Upload Service
- **File:** `backend/src/services/upload/imageUploadService.js`
- **Functions:**
  - `uploadImageToCloudinary(base64Image, folder)` - Uploads to Cloudinary
  - `validateImage(base64Image, maxSizeMB)` - Validates size & format
  - `deleteImageFromCloudinary(publicId)` - Cleanup

### 3. Upload API Endpoint
- **Route:** `POST /api/upload/chat-image`
- **Controller:** `backend/src/controllers/upload/uploadController.js`
- **Authentication:** Required
- **Body:** `{ image: "data:image/jpeg;base64,..." }`
- **Response:** `{ url, width, height }`

### 4. Message Model (Already Supports Images)
- **messageType:** Can be `'image'`
- **attachments:** Array of `{ type, url, thumbnail, size, mimeType }`

## Frontend Components ✅

### 1. ImageModal Component
- **File:** `frontend/src/shared/components/ImageModal.tsx`
- **Purpose:** WhatsApp-style full-screen image preview
- **Features:**
  - Click to close
  - ESC key support
  - Download/open in new tab
  - Smooth animations

### 2. ImagePicker Component
- **File:** `frontend/src/shared/components/ImagePicker.tsx`
- **Purpose:** Select and convert images to base64
- **Features:**
  - File type validation
  - Size limit (5MB)
  - Loading state
  - Auto-reset

## Integration Steps for Chat Pages

### For Male ChatWindowPage (`frontend/src/module/male/pages/ChatWindowPage.tsx`):

1. **Import components:**
```typescript
import { ImagePicker } from '../../../shared/components/ImagePicker';
import { ImageModal } from '../../../shared/components/ImageModal';
import apiClient from '../../../core/api/client';
```

2. **Add state:**
```typescript
const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);
const [isUploadingImage, setIsUploadingImage] = useState(false);
```

3. **Add upload function:**
```typescript
const handleImageSelect = async (base64Image: string) => {
  try {
    setIsUploadingImage(true);
    
    // Upload to Cloudinary
    const response = await apiClient.post('/upload/chat-image', { image: base64Image });
    const { url } = response.data.data;

    // Send as message
    await handleSendMessage('', 'image', url);
    
  } catch (error) {
    console.error('Image upload failed:', error);
    alert('Failed to send image');
  } finally {
    setIsUploadingImage(false);
  }
};
```

4. **Update send message function to support images:**
```typescript
const handleSendMessage = async (content: string, type: 'text' | 'image' = 'text', imageUrl?: string) => {
  // Check balance
  if (coinBalance < MESSAGE_COST) {
    setIsBalanceModalOpen(true);
    return;
  }

  try {
    setIsSending(true);

    const messageData = {
      chatId,
      content: type === 'image' ? '' : content,
      messageType: type,
      ...(type === 'image' && imageUrl && {
        attachments: [{
          type: 'image',
          url: imageUrl
        }]
      })
    };

    // Send via socket
    socketService.sendMessage(messageData);

    // Optimistically add to UI
    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      ...messageData,
      senderId: currentUserId,
      receiverId: chatInfo?.femaleId,
      status: 'sent',
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimisticMessage]);
    updateBalance(coinBalance - MESSAGE_COST);

  } catch (error) {
    console.error('Send failed:', error);
  } finally {
    setIsSending(false);
  }
};
```

5. **Add ImagePicker to input area:**
```typescript
<div className="flex items-center gap-2">
  <ImagePicker 
    onImageSelect={handleImageSelect} 
    disabled={isSending || isUploadingImage || isBlockedByMe || isBlockedByOther}
  />
  {/* Existing MessageInput */}
</div>
```

6. **Update MessageBubble to handle images:**
```typescript
{message.messageType === 'image' && message.attachments?.[0] && (
  <div 
    className="rounded-lg overflow-hidden cursor-pointer max-w-xs"
    onClick={() => setSelectedImageModal(message.attachments[0].url)}
  >
    <img 
      src={message.attachments[0].url} 
      alt="Sent image"
      className="w-full h-auto"
    />
  </div>
)}
```

7. **Add ImageModal to render:**
```typescript
{selectedImageModal && (
  <ImageModal
    isOpen={!!selectedImageModal}
    imageUrl={selectedImageModal}
    onClose={() => setSelectedImageModal(null)}
  />
)}
```

### For Female ChatWindowPage (`frontend/src/module/female/pages/ChatWindowPage.tsx`):

**Same integration steps as male, with no coin deduction logic.**

## Environment Setup

Add to `backend/.env`:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Testing Checklist

- [ ] Can select image from device
- [ ] Image uploads to Cloudinary
- [ ] Image appears in chat
- [ ] Click image to view full screen
- [ ] ESC closes full screen view
- [ ] Male user coins deducted
- [ ] Female user no cost
- [ ] Works on mobile
- [ ] Image size limit enforced
- [ ] Loading states work
- [ ] Error handling works

## Notes

- Images are auto-optimized by Cloudinary (max 1200x1200, auto-format)
- 5MB max size enforced
- Supported formats: JPEG, PNG, GIF, WebP
- Images stored in `matchmint/chat-images` folder on Cloudinary
