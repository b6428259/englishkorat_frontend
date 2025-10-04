# FC Subject Rounded Font Setup

เอกสารนี้อธิบายการตั้งค่าฟอนต์ FC Subject Rounded สำหรับโปรเจ็กต์ EnglishKorat

## การติดตั้งที่เสร็จสิ้นแล้ว

✅ ฟอนต์ FC Subject Rounded ได้ถูกตั้งค่าให้เป็นฟอนต์หลักทั้งเว็บไซต์แล้ว

## ไฟล์ที่เกี่ยวข้อง

### 1. ไฟล์ฟอนต์ (Font Files)

```
/public/fonts/FC_Subject_Rounded_Webfont_ver_1.00/
├── WOFF2/ (รูปแบบหลัก - ประสิทธิภาพดีที่สุด)
├── WOFF/  (รูปแบบสำรอง)
└── EOT/   (สำหรับ Internet Explorer เก่า)
```

### 2. การกำหนดฟอนต์ (@font-face declarations)

**ไฟล์:** `/src/app/fonts.css`

มีการกำหนด font-face สำหรับน้ำหนักฟอนต์ทั้งหมด 11 แบบ:

- Thin (100)
- Extra Light (200)
- Light (300)
- Regular (400) ← **ค่าเริ่มต้น**
- Medium (500)
- Semi Bold (600)
- Bold (700)
- Extra Bold (800)
- Heavy (900)
- Black (950)

พร้อมทั้ง Italic สำหรับทุกน้ำหนัก

### 3. Global CSS

**ไฟล์:** `/src/app/globals.css`

```css
@import "./fonts.css";

:root {
  --font-fc-subject: "FC Subject Rounded", sans-serif;
}

body {
  font-family: "FC Subject Rounded", -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, "Helvetica Neue", Arial, sans-serif;
}
```

### 4. Tailwind Configuration

**ไฟล์:** `/tailwind.config.js`

```javascript
theme: {
  extend: {
    fontFamily: {
      sans: ['FC Subject Rounded', 'ui-sans-serif', 'system-ui', ...],
    },
  },
}
```

## วิธีใช้งาน

### การใช้งานทั่วไป

ฟอนต์จะถูกใช้โดยอัตโนมัติในทุกหน้า เนื่องจากถูกตั้งค่าเป็นฟอนต์เริ่มต้นของ `body` และ Tailwind's `font-sans`

### การใช้งานกับ Tailwind CSS

```tsx
// ใช้ฟอนต์เริ่มต้น (FC Subject Rounded)
<div className="font-sans">ข้อความ</div>

// ใช้น้ำหนักต่างๆ
<div className="font-light">Light (300)</div>
<div className="font-normal">Regular (400)</div>
<div className="font-medium">Medium (500)</div>
<div className="font-semibold">Semi Bold (600)</div>
<div className="font-bold">Bold (700)</div>
<div className="font-extrabold">Extra Bold (800)</div>
<div className="font-black">Heavy (900)</div>
```

### การใช้งานใน CSS แบบกำหนดเอง

```css
.custom-text {
  font-family: var(--font-fc-subject);
  font-weight: 500;
}

/* หรือ */
.another-text {
  font-family: "FC Subject Rounded", sans-serif;
}
```

### การใช้งานใน React Components

```tsx
<h1 style={{ fontFamily: "FC Subject Rounded", fontWeight: 600 }}>หัวข้อ</h1>
```

## คุณสมบัติของฟอนต์

- ✅ รองรับภาษาไทยและภาษาอังกฤษ
- ✅ มีหลายน้ำหนัก (11 แบบ + Italic)
- ✅ รูปแบบ Rounded ที่ดูนุ่มนวลและเป็นมิตร
- ✅ เหมาะกับการใช้งานในเว็บไซต์การศึกษา
- ✅ ใช้ WOFF2 สำหรับประสิทธิภาพที่ดีที่สุด
- ✅ มี fallback เป็น WOFF สำหรับเบราว์เซอร์เก่า

## การปรับแต่ง

### เปลี่ยนฟอนต์เฉพาะส่วน

หากต้องการใช้ฟอนต์อื่นในบางส่วน สามารถเพิ่มใน Tailwind config:

```javascript
theme: {
  extend: {
    fontFamily: {
      sans: ['FC Subject Rounded', ...],
      heading: ['Other Font', ...],  // สำหรับหัวข้อ
      mono: ['Courier New', ...],    // สำหรับโค้ด
    },
  },
}
```

### ปรับน้ำหนักเริ่มต้น

แก้ไขใน `globals.css`:

```css
body {
  font-family: "FC Subject Rounded", ...;
  font-weight: 400; /* เปลี่ยนได้ 100-950 */
}
```

## การตรวจสอบ

### ตรวจสอบว่าฟอนต์โหลดสำเร็จ

1. เปิด Developer Tools (F12)
2. ไปที่ tab Network
3. กรอง "Font" หรือ "woff2"
4. Reload หน้าเว็บ
5. ควรเห็นไฟล์ `.woff2` โหลดสำเร็จ (สถานะ 200)

### ตรวจสอบฟอนต์ที่ใช้งาน

1. เปิด Developer Tools
2. Inspect element ที่ต้องการ
3. ดูใน Computed styles
4. หา `font-family` ควรเห็น "FC Subject Rounded"

## Performance

การใช้ `font-display: swap` ทำให้:

- แสดงข้อความได้ทันทีด้วยฟอนต์สำรอง
- เมื่อ FC Subject Rounded โหลดเสร็จจะสลับไปใช้ทันที
- ป้องกันปัญหา FOIT (Flash of Invisible Text)

## บันทึก

- วันที่ติดตั้ง: 2 ตุลาคม 2025
- เวอร์ชันฟอนต์: 1.00
- รูปแบบหลัก: WOFF2 (รองรับเบราว์เซอร์สมัยใหม่ทั้งหมด)
- การรองรับ: Chrome, Firefox, Safari, Edge (เวอร์ชันใหม่ทั้งหมด)

## ปัญหาที่อาจพบและวิธีแก้

### ฟอนต์ไม่แสดง

1. ตรวจสอบว่าไฟล์ฟอนต์อยู่ใน `/public/fonts/`
2. Clear browser cache และ rebuild โปรเจ็กต์
3. ตรวจสอบ path ใน `fonts.css`

### ฟอนต์โหลดช้า

1. ตรวจสอบขนาดไฟล์ใน Network tab
2. พิจารณาใช้เฉพาะน้ำหนักที่จำเป็น
3. ใช้ font subsetting หากต้องการ

### ฟอนต์ไทยแสดงไม่ถูกต้อง

1. ตรวจสอบว่าใช้ Unicode (UTF-8)
2. ตรวจสอบว่าไฟล์ฟอนต์รองรับอักษรไทย
3. ลอง rebuild โปรเจ็กต์

---

สร้างโดย: GitHub Copilot
อัพเดทล่าสุด: 2 ตุลาคม 2025
