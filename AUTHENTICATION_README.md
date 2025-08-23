# Authentication System Documentation

## ภาพรวมของระบบ

ระบบ Authentication ที่พัฒนาขึ้นจะทำการ:

1. **ตรวจสอบ Access Token หมดอายุ** - เมื่อมี API call ไปยัง protected endpoints
2. **ตรวจสอบเวลาเข้าใช้งาน** - หากครบ 1 ชั่วโมงจะดีดออกจากระบบ
3. **ดีดออกจากระบบและล้าง localStorage** - เมื่อตรวจพบการหมดอายุ
4. **รองรับ Public และ Protected Routes** - ระบบจะแยกแยะ routes ที่ต้องการ authentication

## ไฟล์ที่สำคัญ

### 1. Configuration Files
- `src/config/routes.js` - กำหนด routes ที่ต้องการ authentication
- `src/helpers/authHelper.js` - ฟังก์ชันจัดการ authentication
- `src/helpers/index.js` - API helpers พร้อม interceptors

### 2. Components
- `src/components/AuthGuard.jsx` - ป้องกันการเข้าถึง protected routes
- `src/components/AuthProvider.jsx` - Context provider สำหรับ authentication
- `src/components/SessionChecker.jsx` - ตรวจสอบ session เบื้องหลัง
- `src/components/SessionWarning.jsx` - แจ้งเตือนก่อนหมดอายุ

### 3. Hooks
- `src/hooks/useAuth.js` - Hook สำหรับจัดการ authentication state

## การใช้งาน

### 1. Public Routes (ไม่ต้อง Login)

```javascript
// ตัวอย่างการดึงข้อมูลสินค้า
import { get } from "@/helpers";

const loadProducts = () => {
  get(
    `${process.env.NEXT_PUBLIC_API_LINK}/v1/api/product`,
    null, // ไม่ส่ง token
    setLoading,
    (data) => {
    },
    (error) => {
      console.error("Error:", error);
    }
  );
};
```

### 2. Protected Routes (ต้อง Login)

```javascript
// ตัวอย่างการดึงข้อมูลผู้ใช้
import { get, getUserDataFromLCStorage } from "@/helpers";
import AuthGuard from "@/components/AuthGuard";

const UserProfile = () => {
  const userData = getUserDataFromLCStorage();
  
  const loadUserProfile = () => {
    get(
      `${process.env.NEXT_PUBLIC_API_LINK}/v1/api/user/${userData.data.id}`,
      userData.accessToken, // ส่ง token
      setLoading,
      (data) => {
      },
      (error) => {
        console.error("Error:", error);
      }
    );
  };

  return (
    <AuthGuard>
      <div>Protected content here</div>
    </AuthGuard>
  );
};
```

### 3. การใช้ useAuth Hook

```javascript
import { useAuth } from "@/hooks/useAuth";

const MyComponent = () => {
  const { 
    isAuthenticated, 
    user, 
    isLoading, 
    logout, 
    isProtectedRoute,
    isPublicRoute 
  } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Hello, {user?.data?.firstName}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>Please login</div>
      )}
    </div>
  );
};
```

## การกำหนดค่า Routes

### ใน `src/config/routes.js`

```javascript
// Routes ที่ต้องการ authentication
export const PROTECTED_ROUTES = [
  "/profile",
  "/my-store",
  "/order-history",
  "/cart",
  // เพิ่ม routes อื่น ๆ ที่ต้องการ auth
];

// Routes ที่ไม่ต้องการ authentication
export const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/product",
  "/categories",
  // เพิ่ม routes อื่น ๆ ที่เป็น public
];
```

## การทำงานของระบบ

### 1. เมื่อผู้ใช้ Login
- บันทึก `loginTime` และ `lastActivity` ใน localStorage
- เริ่มการตรวจสอบ session

### 2. เมื่อมี API Call
- ตรวจสอบว่า endpoint ต้องการ authentication หรือไม่
- หากต้องการ auth จะตรวจสอบ token และเวลา
- หากหมดอายุจะ cancel request และ force logout

### 3. การตรวจสอบ Session
- ตรวจสอบทุก 30 วินาที (background)
- ตรวจสอบเมื่อ window focus
- ตรวจสอบเมื่อมี user activity

### 4. การแจ้งเตือน
- แสดงคำเตือนเมื่อเหลือเวลา 5 นาที
- แสดงเฉพาะใน protected routes

## การปรับแต่ง

### เปลี่ยนเวลา Session (จากค่าเริ่มต้น 1 ชั่วโมง)

```javascript
// ใน src/helpers/authHelper.js
const oneHour = 60 * 60 * 1000; // เปลี่ยนเป็นเวลาที่ต้องการ
```

### เพิ่ม Protected Endpoints

```javascript
// ใน src/config/routes.js
const authRequiredEndpoints = [
  "/v1/api/user",
  "/v1/api/order",
  // เพิ่ม endpoints ใหม่ที่ต้องการ auth
];
```

### เพิ่ม Public Endpoints

```javascript
// ใน src/config/routes.js
const publicEndpoints = [
  "/v1/api/product",
  "/v1/api/category",
  // เพิ่ม endpoints ใหม่ที่เป็น public
];
```

## การ Debug

### ดู Console Logs
- `"401 Unauthorized on protected endpoint"` - มี 401 error ใน protected endpoint
- `"Request canceled due to authentication expiry"` - Request ถูก cancel เพราะ auth หมดอายุ
- `"Token expired, forcing logout"` - Token หมดอายุ
- `"Login time exceeded 1 hour, forcing logout"` - เกินเวลา 1 ชั่วโมง

### ตรวจสอบ localStorage
```javascript
// ดู user data

// ตรวจสอบเวลา login
const userData = JSON.parse(localStorage.getItem("USER_DATA"));
const loginTime = new Date(userData.loginTime);
const currentTime = new Date();
```

## การทดสอบ

### ทดสอบ Token หมดอายุ
1. Login เข้าระบบ
2. ไปที่ Developer Tools > Application > Local Storage
3. แก้ไขค่า `accessToken` ใน `USER_DATA`
4. เรียก API ใด ๆ ที่เป็น protected endpoint
5. ระบบจะ logout อัตโนมัติ

### ทดสอบ Session หมดอายุ
1. Login เข้าระบบ
2. แก้ไขค่า `loginTime` ใน `USER_DATA` ให้เป็นเวลาที่ผ่านมาแล้ว 1 ชั่วโมง
3. Refresh หน้าหรือเรียก API
4. ระบบจะ logout อัตโนมัติ

## Troubleshooting

### ปัญหา: Public routes ไม่สามารถเข้าถึงได้
- ตรวจสอบใน `src/config/routes.js` ว่า route นั้นอยู่ใน `PUBLIC_ROUTES` หรือไม่

### ปัญหา: API calls ถูก cancel ทำให้
- ตรวจสอบว่า endpoint ถูกกำหนดใน `requiresAuth()` function ถูกต้องหรือไม่

### ปัญหา: Session warning ไม่แสดง
- ตรวจสอบว่าอยู่ใน protected route หรือไม่
- ตรวจสอบใน console ว่ามี error หรือไม่
