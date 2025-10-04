# Custom Sound Upload API Implementation

This implementation provides the functionality for users to upload and manage their custom notification sounds with a `POST /api/settings/me/custom-sound` endpoint.

## Features

✅ **Single Sound Per User**: Each user can have only one custom sound (replace functionality)
✅ **File Upload**: Supports `multipart/form-data` with `sound` field
✅ **File Validation**:

- Supported formats: MP3, WAV, OGG
- Maximum file size: 5MB
  ✅ **Replace Functionality**: New uploads automatically replace existing custom sounds
  ✅ **Delete Functionality**: Users can remove their custom sound
  ✅ **Preview Functionality**: Users can preview sounds before uploading

## API Endpoints

### Upload/Replace Custom Sound

```http
POST /api/settings/me/custom-sound
Content-Type: multipart/form-data

Form Data:
- sound: File (required) - Audio file to upload
```

**Response:**

```json
{
  "message": "Custom sound uploaded successfully",
  "settings": {
    "id": 1,
    "user_id": 123,
    "language": "en",
    "enable_notification_sound": true,
    "notification_sound": "custom",
    "custom_sound": "/uploads/sounds/user-123-custom.mp3",
    "enable_email_notifications": true,
    "enable_phone_notifications": false,
    "enable_in_app_notifications": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  }
}
```

### Delete Custom Sound

```http
DELETE /api/settings/me/custom-sound
```

**Response:**

```json
{
  "message": "Custom sound deleted successfully",
  "settings": {
    "id": 1,
    "user_id": 123,
    "custom_sound": null
    // ... other settings
  }
}
```

## Implementation Files

### Backend Service

- **File**: `src/services/settings.service.ts`
- **Methods**:
  - `uploadCustomSound(soundFile: File): Promise<UserSettings>`
  - `deleteCustomSound(): Promise<UserSettings>`

### Types

- **File**: `src/types/settings.types.ts`
- **Updates**:
  - Added `custom_sound?: string | null` to `UserSettings`
  - Added `custom_sound?: string | null` to `UpdateUserSettingsInput`
  - Updated `NOTIFICATION_SOUNDS` to include custom option

### API Configuration

- **File**: `src/services/api/endpoints.ts`
- **Added**: `CUSTOM_SOUND: '/settings/me/custom-sound'` endpoint

### React Component

- **File**: `src/components/settings/CustomSoundUpload.tsx`
- **Features**:
  - Drag & drop file upload interface
  - File validation with user-friendly error messages
  - Audio preview functionality
  - Upload progress indication
  - Dark mode support
  - Responsive design

## Usage Example

```tsx
import React, { useState } from "react";
import { settingsService } from "@/services/settings.service";
import CustomSoundUpload from "@/components/settings/CustomSoundUpload";

function SettingsPage() {
  const [settings, setSettings] = useState(userSettings);

  const handleSettingsUpdate = (updatedSettings) => {
    setSettings(updatedSettings);
    // Optionally show success message
  };

  return (
    <div>
      <CustomSoundUpload
        currentSettings={settings}
        onSettingsUpdate={handleSettingsUpdate}
      />
    </div>
  );
}
```

## File Validation

The implementation includes comprehensive file validation:

### Client-side Validation

- **File Type**: Only `audio/mp3`, `audio/mpeg`, `audio/wav`, `audio/ogg`
- **File Size**: Maximum 5MB
- **User Feedback**: Clear error messages for validation failures

### Recommended Backend Validation

```typescript
// Validate file type
const allowedMimeTypes = ["audio/mp3", "audio/mpeg", "audio/wav", "audio/ogg"];
if (!allowedMimeTypes.includes(file.mimetype)) {
  throw new Error("Invalid file type");
}

// Validate file size (5MB = 5 * 1024 * 1024 bytes)
if (file.size > 5 * 1024 * 1024) {
  throw new Error("File too large");
}

// Validate file extension
const allowedExtensions = [".mp3", ".wav", ".ogg"];
const fileExtension = path.extname(file.originalname).toLowerCase();
if (!allowedExtensions.includes(fileExtension)) {
  throw new Error("Invalid file extension");
}
```

## Security Considerations

### File Storage

- Store uploaded files outside the public directory
- Use secure file naming (avoid user-provided names)
- Implement file cleanup for deleted sounds

### Validation

- Always validate on both client and server side
- Check file headers, not just extensions
- Implement rate limiting for uploads
- Scan files for malware if possible

### Access Control

- Ensure users can only access their own custom sounds
- Implement proper authentication for all endpoints
- Use secure file serving with appropriate headers

## Error Handling

The implementation provides comprehensive error handling:

### Client-side Errors

- File type validation errors
- File size validation errors
- Network errors
- Upload timeout errors

### Server-side Errors (Expected)

- `400 Bad Request`: Invalid file format or size
- `401 Unauthorized`: User not authenticated
- `413 Payload Too Large`: File exceeds size limit
- `422 Unprocessable Entity`: File validation failed
- `500 Internal Server Error`: Server processing error

## Integration with Notification System

To use custom sounds in the notification system:

```typescript
import { playNotificationSound } from "@/lib/playNotificationSound";

// In your notification service
const playCustomSound = (userSettings: UserSettings) => {
  if (
    userSettings.notification_sound === "custom" &&
    userSettings.custom_sound
  ) {
    playNotificationSound(userSettings.custom_sound);
  } else {
    // Fall back to default sounds
    const defaultSound = NOTIFICATION_SOUNDS[userSettings.notification_sound];
    playNotificationSound(defaultSound.file);
  }
};
```

## Testing

### Manual Testing Checklist

- [ ] Upload MP3 file successfully
- [ ] Upload WAV file successfully
- [ ] Upload OGG file successfully
- [ ] Reject invalid file types
- [ ] Reject files over 5MB
- [ ] Replace existing custom sound
- [ ] Delete custom sound
- [ ] Preview uploaded sound
- [ ] Handle network errors gracefully

### Automated Testing

```typescript
// Example test cases
describe("CustomSoundUpload", () => {
  it("should upload valid MP3 file", async () => {
    // Test implementation
  });

  it("should reject invalid file types", async () => {
    // Test implementation
  });

  it("should reject files over size limit", async () => {
    // Test implementation
  });
});
```

## Performance Considerations

- **File Size Limit**: 5MB keeps uploads reasonable
- **File Compression**: Consider server-side audio compression
- **CDN Integration**: Serve custom sounds from CDN for better performance
- **Caching**: Implement appropriate cache headers for audio files

## Accessibility

The component includes accessibility features:

- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly descriptions
- High contrast support in dark mode

## Browser Compatibility

Supported browsers:

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Future Enhancements

Potential improvements:

- [ ] Audio waveform visualization
- [ ] Multiple custom sounds per user
- [ ] Sound mixing/editing capabilities
- [ ] Cloud storage integration
- [ ] Audio format conversion
- [ ] Batch upload functionality
