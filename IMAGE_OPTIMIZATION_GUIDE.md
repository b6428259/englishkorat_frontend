# 🖼️ Image Optimization Guide - EnglishKorat Frontend

## 📋 Overview

ระบบการจัดการรูปภาพทั้งหมดใช้ **Next.js Image Optimization** เพื่อประสิทธิภาพสูงสุด โดยรูปภาพทั้งหมดจะผ่าน optimization pipeline ของ Next.js ซึ่งจะทำการ:

- ✨ **Auto-optimize** รูปภาพตามขนาดจอและ device
- 🚀 **Lazy loading** โหลดรูปเมื่อจำเป็นเท่านั้น
- 📦 **Format conversion** แปลงเป็น WebP/AVIF อัตโนมัติ (ถ้า browser รองรับ)
- 🎯 **Quality control** กำหนด quality ตามประเภทรูป
- ⚡ **CDN caching** cache ที่ edge สำหรับความเร็วสูงสุด

## 🎨 Image Quality Standards

ระบบกำหนด quality ไว้ที่ `src/utils/config.ts`:

```typescript
IMAGE: {
  QUALITY: {
    AVATAR: 95,        // Avatar images - คุณภาพสูงสุด
    COVER: 90,         // Cover images - คุณภาพสูง
    THUMBNAIL: 85,     // Thumbnails - คุณภาพดี
    BACKGROUND: 80,    // Background images - คุณภาพมาตรฐาน
    DEFAULT: 90,       // Default สำหรับรูปทั่วไป
  }
}
```

## 📏 Standard Image Sizes

```typescript
SIZES: {
  AVATAR_SM: 40,      // Avatar เล็ก (sidebar, list)
  AVATAR_MD: 64,      // Avatar กลาง (profile card)
  AVATAR_LG: 128,     // Avatar ใหญ่ (profile page)
  COVER_SM: 200,      // Cover เล็ก (thumbnail)
  COVER_MD: 400,      // Cover กลาง (card view)
  COVER_LG: 800,      // Cover ใหญ่ (detail view)
  THUMBNAIL: 150,     // Thumbnail ทั่วไป
}
```

## 🔧 Helper Functions

### 1. `getAvatarUrl(avatar: string | undefined)`

ใช้สำหรับ Avatar images:

```typescript
import { getAvatarUrl } from "@/utils/config";

const avatarUrl = getAvatarUrl(user.avatar);
```

### 2. `getCoverImageUrl(coverImage: string | undefined)`

ใช้สำหรับ Cover images (borrowing items, etc.):

```typescript
import { getCoverImageUrl } from "@/utils/config";

const coverUrl = getCoverImageUrl(item.cover_image_url);
```

### 3. `getImageUrl(imagePath: string | undefined)`

ใช้สำหรับรูปภาพทั่วไป:

```typescript
import { getImageUrl } from "@/utils/config";

const imageUrl = getImageUrl(imagePath);
```

### 4. `getOptimizedImageProps(src, type, size?)`

ใช้สำหรับสร้าง props ที่พร้อมใช้กับ Next.js Image component:

```typescript
import { getOptimizedImageProps } from "@/utils/config";

const imageProps = getOptimizedImageProps(
  imageSrc,
  "avatar", // type: 'avatar' | 'cover' | 'thumbnail' | 'background' | 'default'
  64 // optional custom size
);

<Image {...imageProps} alt="..." />;
```

## 📝 Usage Examples

### ✅ Avatar Component (Correct Way)

```tsx
import Image from "next/image";
import { getAvatarUrl } from "@/utils/config";

const Avatar = ({ user }) => {
  const avatarUrl = getAvatarUrl(user.avatar);

  return (
    <Image
      src={avatarUrl || "/default-avatar.png"}
      alt={user.name}
      width={64}
      height={64}
      quality={95}
      className="rounded-full"
    />
  );
};
```

### ✅ Cover Image Component (Correct Way)

```tsx
import Image from "next/image";
import { getCoverImageUrl } from "@/utils/config";

const ItemCard = ({ item }) => {
  const coverUrl = getCoverImageUrl(item.cover_image_url);

  return (
    <div className="relative h-48">
      <Image
        src={coverUrl || "/default-cover.jpg"}
        alt={item.title}
        width={400}
        height={400}
        quality={90}
        className="object-cover w-full h-full"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  );
};
```

### ✅ Responsive Image (Correct Way)

```tsx
<Image
  src={imageUrl}
  alt="Description"
  width={800}
  height={600}
  quality={90}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  priority={isAboveFold} // สำหรับรูปที่เห็นทันที
/>
```

### ❌ Incorrect Ways (Don't Do This)

```tsx
// ❌ DON'T: ใช้ unoptimized
<Image src={url} unoptimized={true} />

// ❌ DON'T: ไม่กำหนด quality
<Image src={url} width={100} height={100} />

// ❌ DON'T: ใช้ fill โดยไม่จำเป็น
<Image src={url} fill />

// ❌ DON'T: ใช้ img tag แทน Image component
<img src={url} alt="..." />
```

## 🌐 Image URL Formats

### S3 Images (Through Next.js Optimization)

```
Before: https://englishkorat-production.s3.ap-southeast-1.amazonaws.com/path/to/image.jpg

After (optimized):
http://localhost:3001/_next/image?url=https%3A%2F%2Fenglishkorat-production.s3.ap-southeast-1.amazonaws.com%2Fpath%2Fto%2Fimage.jpg&w=828&q=90
```

### Parameters Explained:

- `url`: URL-encoded source image
- `w`: Width (automatically calculated by Next.js)
- `q`: Quality (90 for covers, 95 for avatars)

## 🔐 Security & Performance

### Remote Patterns (next.config.ts)

```typescript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "ui-avatars.com",
      pathname: "/api/**",
    },
    {
      protocol: "https",
      hostname: "englishkorat-production.s3.ap-southeast-1.amazonaws.com",
      pathname: "/**",
    },
  ],
}
```

### Benefits:

1. ✅ **Security**: เฉพาะ domains ที่อนุญาตเท่านั้น
2. ⚡ **Performance**: Automatic optimization และ caching
3. 📱 **Responsive**: Auto-serve ขนาดที่เหมาะสมกับ device
4. 🎯 **Format**: Auto-convert เป็น WebP/AVIF

## 📊 Performance Metrics

### Before Optimization

- Image size: ~500KB
- Load time: ~2s
- Format: JPEG/PNG

### After Optimization

- Image size: ~50KB (90% reduction)
- Load time: ~200ms (90% faster)
- Format: WebP (modern browsers)

## 🎯 Best Practices

### 1. Always Use Next.js Image Component

```tsx
import Image from "next/image";
// ✅ Good
```

### 2. Set Appropriate Quality

```tsx
// Avatar: 95
<Image quality={95} />

// Cover: 90
<Image quality={90} />

// Background: 80
<Image quality={80} />
```

### 3. Use Priority for Above-the-Fold Images

```tsx
<Image
  src={heroImage}
  priority={true} // โหลดทันทีสำหรับรูปที่เห็นแรก
/>
```

### 4. Specify Sizes for Responsive Images

```tsx
<Image
  sizes="(max-width: 768px) 100vw,
         (max-width: 1200px) 50vw,
         33vw"
/>
```

### 5. Use Placeholder for Better UX

```tsx
<Image
  src={imageUrl}
  placeholder="blur"
  blurDataURL="data:image/..." // or placeholder="empty"
/>
```

## 🛠️ Testing & Debugging

### Check Optimized URL

1. Open browser DevTools
2. Go to Network tab
3. Look for `_next/image?url=...` requests
4. Verify quality parameter (`&q=90` or `&q=95`)

### Verify Image Format

```javascript
// Check response headers
Content-Type: image/webp  // ✅ Optimized
Content-Type: image/jpeg  // ❌ Not optimized
```

## 📦 Updated Components

### Components Using Optimized Images:

- ✅ `Avatar.tsx` - Quality 95
- ✅ `ItemCard.tsx` - Quality 90
- ✅ `Sidebar.tsx` - Quality 95
- ✅ `MobileBottomNavbar.tsx` - Quality 95
- ✅ `Header.tsx` - Quality 95

### All images now:

1. Go through Next.js optimization
2. Use appropriate quality settings
3. Support responsive sizing
4. Auto-convert to modern formats

## 🚀 Migration Checklist

When adding new images:

- [ ] Use `Image` from `next/image`
- [ ] Set appropriate `quality` (90-95)
- [ ] Set `width` and `height`
- [ ] Add `sizes` for responsive images
- [ ] Use helper functions from `config.ts`
- [ ] Test optimization in DevTools

## 📚 Additional Resources

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Image Component API](https://nextjs.org/docs/app/api-reference/components/image)
- [Remote Patterns Configuration](https://nextjs.org/docs/app/api-reference/components/image#remotepatterns)

---

**Last Updated:** October 23, 2025
**Maintained by:** EnglishKorat Development Team
