# Custom Sound Upload Enhancement

## สรุปการปรับปรุง

ปรับปรุงระบบการเลือกเสียงแจ้งเตือนให้สามารถ upload ไฟล์เสียงส่วนตัว พร้อมแสดงข้อมูลไฟล์ปัจจุบันที่ใช้อยู่

## การเปลี่ยนแปลงหลัก

### 1. อัปเดต UserSettings Types

- เพิ่มฟิลด์ `custom_sound_url` - URL ของไฟล์เสียงที่ผู้ใช้ upload
- เพิ่มฟิลด์ `custom_sound_filename` - ชื่อไฟล์เดิมของเสียงที่ upload
- เพิ่มฟิลด์ `notification_sound_file` - URL หลักของไฟล์เสียง

### 2. ปรับปรุง UI การเลือกเสียง

- **แสดงไฟล์ปัจจุบัน**: แสดงชื่อไฟล์เสียงที่กำลังใช้งานอยู่ในกล่องสีฟ้า
- **Upload Interface**: ถ้าผู้ใช้ยังไม่มีไฟล์เสียง custom จะแสดงกล่อง upload แทนปุ่มเลือก
- **การจัดการไฟล์**: มีปุ่มลบและ re-upload สำหรับไฟล์เสียงที่มีอยู่

### 3. ฟีเจอร์ใหม่

- **File Validation**: ตรวจสอบประเภทไฟล์ (MP3, WAV) และขนาด (สูงสุด 5MB)
- **Auto-select**: หลังจาก upload เสร็จจะเลือกเสียง custom โดยอัตโนมัติ
- **Play Custom Sound**: สามารถเล่นทดลองฟังเสียงที่ upload ได้
- **Delete Custom Sound**: ลบไฟล์เสียงและเปลี่ยนกลับไปใช้เสียงเริ่มต้น

## API Integration

### Upload Custom Sound

```
POST /api/settings/me/custom-sound
Content-Type: multipart/form-data

ส่งไฟล์ใน key "sound"
```

### Delete Custom Sound

```
DELETE /api/settings/me/custom-sound
```

## การใช้งาน

1. **ไม่มีไฟล์เสียง**: แสดงกล่อง upload พร้อมคำแนะนำ
2. **มีไฟล์เสียง**: แสดงชื่อไฟล์พร้อมปุ่มเล่น ลบ และ re-upload
3. **การเลือก**: สามารถเลือกได้เฉพาะเมื่อมีไฟล์เสียงแล้ว
4. **ข้อมูลปัจจุบัน**: แสดงไฟล์เสียงที่กำลังใช้งานด้านบน

## ข้อมูลเทคนิค

### Supported Formats

- MP3 (audio/mp3, audio/mpeg)
- WAV (audio/wav)
- ขนาดสูงสุด: 5MB

### Error Handling

- แจ้งเตือนเมื่อไฟล์ประเภทไม่ถูกต้อง
- แจ้งเตือนเมื่อไฟล์ใหญ่เกินไป
- แจ้งเตือนเมื่อ upload หรือลบไฟล์ไม่สำเร็จ

### UI/UX Improvements

- Loading state ขณะ upload
- Confirmation dialog ก่อนลบไฟล์
- Visual feedback สำหรับไฟล์ที่เลือกอยู่
- Bilingual support (ไทย/อังกฤษ)

## ไฟล์ที่เปลี่ยนแปลง

1. `src/types/settings.types.ts` - เพิ่มฟิลด์ custom sound ใหม่
2. `src/app/settings/system/page.tsx` - ปรับปรุง UI และเพิ่มการจัดการ custom sound

## การทดสอบ

1. ทดลอง upload ไฟล์เสียง MP3/WAV
2. ทดลองเล่นเสียงที่ upload
3. ทดลองลบไฟล์เสียง
4. ทดลอง re-upload ไฟล์ใหม่
5. ตรวจสอบการแสดงชื่อไฟล์ปัจจุบัน
