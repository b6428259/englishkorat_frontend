export type Language = 'th' | 'en';

export interface Translations {
  // Navigation
  dashboard: string;
  profile: string;
  studentRegistration: string;
  logout: string;
  
  // Common
  welcome: string;
  englishKorat: string;
  menu: string;
  close: string;
  save: string;
  cancel: string;
  submit: string;
  register: string;
  
  // Dashboard
  welcomeMessage: string;
  welcomeSubMessage: string;
  courses: string;
  quickActions: string;
  recentActivity: string;
  loginSuccess: string;
  loginSuccessTime: string;
  
  // Profile
  personalInfo: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  englishLevel: string;
  saveData: string;
  
  // Student Registration
  studentRegTitle: string;
  basicInfo: string;
  firstNameEn: string;
  lastNameEn: string;
  firstNameTh: string;
  lastNameTh: string;
  coursePreferences: string;
  selectLevel: string;
  beginner: string;
  elementary: string;
  intermediate: string;
  upperIntermediate: string;
  advanced: string;
  learningNeeds: string;
  
  // Placeholders
  pleaseEnterName: string;
  pleaseEnterLastName: string;
  pleaseEnterEmail: string;
  pleaseEnterPhone: string;
  pleaseEnterAddress: string;
}

export const translations: Record<Language, Translations> = {
  th: {
    // Navigation
    dashboard: 'แดชบอร์ด',
    profile: 'โปรไฟล์',
    studentRegistration: 'ลงทะเบียนนักเรียน',
    logout: 'ออกจากระบบ',
    
    // Common
    welcome: 'ยินดีต้อนรับ',
    englishKorat: 'English Korat',
    menu: 'เมนู',
    close: 'ปิด',
    save: 'บันทึก',
    cancel: 'ยกเลิก',
    submit: 'ยืนยัน',
    register: 'ลงทะเบียน',
    
    // Dashboard
    welcomeMessage: 'ยินดีต้อนรับ!',
    welcomeSubMessage: 'คุณได้เข้าสู่ระบบเรียบร้อยแล้ว เริ่มต้นการเรียนรู้ภาษาอังกฤษกับเรา',
    courses: 'หลักสูตร',
    quickActions: 'การดำเนินการด่วน',
    recentActivity: 'กิจกรรมล่าสุด',
    loginSuccess: 'เข้าสู่ระบบสำเร็จ',
    loginSuccessTime: 'เมื่อสักครู่',
    
    // Profile
    personalInfo: 'ข้อมูลส่วนตัว',
    name: 'ชื่อ',
    email: 'อีเมล',
    phone: 'เบอร์โทรศัพท์',
    address: 'ที่อยู่',
    englishLevel: 'ระดับภาษาอังกฤษ',
    saveData: 'บันทึกข้อมูล',
    
    // Student Registration
    studentRegTitle: 'ลงทะเบียนนักเรียน',
    basicInfo: 'ข้อมูลพื้นฐาน',
    firstNameEn: 'ชื่อ (ภาษาอังกฤษ)',
    lastNameEn: 'นามสกุล (ภาษาอังกฤษ)',
    firstNameTh: 'ชื่อ (ภาษาไทย)',
    lastNameTh: 'นามสกุล (ภาษาไทย)',
    coursePreferences: 'ความต้องการเรียน',
    selectLevel: 'เลือกระดับ',
    beginner: 'เริ่มต้น (Beginner)',
    elementary: 'พื้นฐาน (Elementary)',
    intermediate: 'ปานกลาง (Intermediate)',
    upperIntermediate: 'ปานกลาง-สูง (Upper-Intermediate)',
    advanced: 'สูง (Advanced)',
    learningNeeds: 'ความต้องการเรียน',
    
    // Placeholders
    pleaseEnterName: 'กรุณากรอกชื่อ',
    pleaseEnterLastName: 'กรุณากรอกนามสกุล',
    pleaseEnterEmail: 'กรุณากรอกอีเมล',
    pleaseEnterPhone: 'กรุณากรอกเบอร์โทรศัพท์',
    pleaseEnterAddress: 'กรุณากรอกที่อยู่',
  },
  en: {
    // Navigation
    dashboard: 'Dashboard',
    profile: 'Profile',
    studentRegistration: 'Student Registration',
    logout: 'Logout',
    
    // Common
    welcome: 'Welcome',
    englishKorat: 'English Korat',
    menu: 'Menu',
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    register: 'Register',
    
    // Dashboard
    welcomeMessage: 'Welcome!',
    welcomeSubMessage: 'You have successfully logged in. Start your English learning journey with us',
    courses: 'Courses',
    quickActions: 'Quick Actions',
    recentActivity: 'Recent Activity',
    loginSuccess: 'Login Successful',
    loginSuccessTime: 'Just now',
    
    // Profile
    personalInfo: 'Personal Information',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    englishLevel: 'English Level',
    saveData: 'Save Data',
    
    // Student Registration
    studentRegTitle: 'Student Registration',
    basicInfo: 'Basic Information',
    firstNameEn: 'First Name (English)',
    lastNameEn: 'Last Name (English)',
    firstNameTh: 'First Name (Thai)',
    lastNameTh: 'Last Name (Thai)',
    coursePreferences: 'Course Preferences',
    selectLevel: 'Select Level',
    beginner: 'Beginner',
    elementary: 'Elementary',
    intermediate: 'Intermediate',
    upperIntermediate: 'Upper-Intermediate',
    advanced: 'Advanced',
    learningNeeds: 'Learning Needs',
    
    // Placeholders
    pleaseEnterName: 'Please enter name',
    pleaseEnterLastName: 'Please enter last name',
    pleaseEnterEmail: 'Please enter email',
    pleaseEnterPhone: 'Please enter phone number',
    pleaseEnterAddress: 'Please enter address',
  }
};