# WebSocket Notification Sound Integration

## สรุปการปรับปรุง

อัปเดต WebSocket service เพื่อรองรับการเล่นเสียงแจ้งเตือนตามการตั้งค่าที่ส่งมาจาก server ใน WebSocket message envelope

## โครงสร้าง WebSocket Message ใหม่

### Envelope Structure

```typescript
{
  "type": "notification",
  "data": {
    // Notification object ตามปกติ
    "id": 903,
    "user_id": 45,
    "title": "Schedule Conflict",
    "title_th": "ตารางซ้อนกัน",
    "message": "You have two sessions overlapping.",
    "message_th": "คุณมี 2 คาบเรียนเวลาทับกัน",
    "type": "warning",
    "channels": ["popup","normal"],
    "data": { ... }
  },
  "settings": {
    "notification_sound": "custom",
    "notification_sound_file": "https://.../custom-notification-sounds/45/.../mysound.mp3",
    "custom_sound_url": "https://.../custom-notification-sounds/45/.../mysound.mp3",
    "custom_sound_filename": "mysound.mp3",
    "enable_notification_sound": true
  },
  "available_sounds": [
    {
      "id": "default",
      "label": "Default",
      "description": "Classic alert chime",
      "file": "/sounds/default.mp3"
    }
  ],
  "settings_metadata": {
    "allowed_custom_sound_extensions": ["mp3", "wav"],
    "max_custom_sound_size_bytes": 5242880,
    "supports_custom_sound": true
  }
}
```

## การทำงานของระบบ

### 1. Sound Logic

```typescript
// เลือกเสียงที่จะเล่น
if (settings?.enable_notification_sound) {
  let soundUrl = null;

  if (settings.notification_sound === "custom") {
    // ใช้เสียง custom
    soundUrl = settings.notification_sound_file || settings.custom_sound_url;
  } else {
    // ใช้เสียง built-in
    const selectedSound = available_sounds?.find(
      (sound) => sound.id === settings.notification_sound
    );
    if (selectedSound) {
      soundUrl = selectedSound.file; // '/sounds/ding.mp3'
    }
  }

  if (soundUrl) {
    await playSound(soundUrl);
  }
}
```

### 2. เคสการใช้งาน

#### เคส 1: Custom Sound

```json
"settings": {
  "notification_sound": "custom",
  "notification_sound_file": "https://.../custom-notification-sounds/45/.../mysound.mp3",
  "custom_sound_filename": "mysound.mp3",
  "enable_notification_sound": true
}
```

#### เคส 2: Built-in Sound

```json
"settings": {
  "notification_sound": "ding",
  "notification_sound_file": "/sounds/ding.mp3",
  "enable_notification_sound": true,
  "custom_sound_url": "",
  "custom_sound_filename": ""
}
```

#### เคส 3: Sound Disabled

```json
"settings": {
  "enable_notification_sound": false
}
```

## การปรับปรุงใน WebSocket Service

### 1. New Interface

```typescript
interface WebSocketNotificationMessage {
  type: "notification";
  data: Notification;
  settings?: {
    notification_sound?: string;
    notification_sound_file?: string;
    enable_notification_sound?: boolean;
    custom_sound_url?: string;
    custom_sound_filename?: string;
  };
  available_sounds?: Array<{
    id: string;
    label: string;
    description: string;
    file: string;
  }>;
  settings_metadata?: {
    allowed_custom_sound_extensions?: string[];
    max_custom_sound_size_bytes?: number;
    supports_custom_sound?: boolean;
  };
}
```

### 2. Updated Methods

- `handleNewNotification()` - รับ envelope parameter
- `playNotificationSound()` - ตรรกะการเลือกและเล่นเสียง
- `playSound()` - เล่นเสียงจาก URL พร้อม error handling

### 3. Features

- **Sound Selection Logic**: เลือกเสียงตาม settings
- **Error Handling**: จัดการข้อผิดพลาดในการเล่นเสียง
- **Volume Control**: ตั้งระดับเสียงที่เหมาะสม (0.7)
- **Browser Compatibility**: ตรวจสอบการรองรับ Audio API
- **Logging**: บันทึกการทำงานเพื่อ debugging

## การทดสอบ

### Test Cases

1. **Custom Sound**: ส่ง notification พร้อม custom sound URL
2. **Built-in Sound**: ส่ง notification พร้อม built-in sound ID
3. **Sound Disabled**: ส่ง notification โดยไม่เปิดเสียง
4. **Invalid Sound URL**: ทดสอบกับ URL ที่ไม่ถูกต้อง
5. **Network Error**: ทดสอบเมื่อไม่สามารถโหลดไฟล์เสียงได้

### Debug Information

```javascript
// Console logs ที่จะเห็น
"Processing notification with action: resolve_conflict channels: ["popup","normal"]"
"Playing custom notification sound: https://.../mysound.mp3"
"Notification sound played successfully: https://.../mysound.mp3"
```

## Backward Compatibility

ระบบยังคงรองรับ:

- Legacy notification format (ไม่มี envelope)
- การแจ้งเตือนโดยไม่มี settings
- Socket.IO และ Native WebSocket
- การตั้งค่าเสียงแบบเก่า (localStorage)

## Integration Notes

1. **Frontend**: WebSocket service จะเล่นเสียงอัตโนมัติตาม settings
2. **Backend**: ส่ง settings และ available_sounds ในทุก notification
3. **Settings Page**: อัปโหลด custom sound จะอัปเดต user settings
4. **Real-time**: การเปลี่ยนการตั้งค่าจะมีผลทันทีใน WebSocket message ถัดไป
