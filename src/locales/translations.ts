export type Language = 'th' | 'en';

export interface Translations {
  studentPortal: string;
  studentSchedule: string;
  lineOA: string;
  teacherManagement: string;
  teacherList: string;
  teacherNew: string;
  teacherPortal: string;
  analytics: string;
  reports: string;
  studentManagement: string;
  studentNew: string;
  studentList: string;
  settings: string;
  settingsProfile: string;
  settingsSystem: string;
  settingsPassword: string;
  recentCEFR: string;
  currentEducation: string;
  notest: string;
  newStudent: string;
  systemUpdate: string;
  systemUpdateDesc: string;
  notifications: string;
  newStudentDesc: string;
  systemSettings: string;
  
  // Navigation
  dashboard: string;
  profile: string;
  studentRegistration: string;
  logout: string;
  schedule: string;
  

  // Authentication
  login: string;
  loginTitle: string;
  registerTitle: string;
  username: string;
  password: string;
  confirmPassword: string;
  dontHaveAccount: string;
  alreadyHaveAccount: string;
  loginButton: string;
  registerButton: string;
  processing: string;
  pleaseEnterUsername: string;
  pleaseEnterPassword: string;
  pleaseEnterEmail: string;
  phoneOptional: string;
  lineIdOptional: string;
  pleaseEnterPhone: string;
  pleaseEnterLineId: string;

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

  // Change Password
  changePassword: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  pleaseEnterCurrentPassword: string;
  pleaseEnterNewPassword: string;
  pleaseConfirmNewPassword: string;

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
  pleaseEnterAddress: string;
}

export const translations: Record<Language, Translations> = {
  th: {
    // New properties
    newStudent: 'นักเรียนใหม่',
    systemUpdate: 'อัปเดตระบบ',
    systemUpdateDesc: 'มีการอัปเดตระบบล่าสุด',
    notifications: 'การแจ้งเตือน',
    newStudentDesc: 'มีนักเรียนใหม่ลงทะเบียน',

    // Navigation
    dashboard: 'แดชบอร์ด',
    profile: 'โปรไฟล์',
    studentRegistration: 'ลงทะเบียนนักเรียน',
    logout: 'ออกจากระบบ',
    systemSettings: 'การตั้งค่าระบบ',
    schedule: 'ตารางเรียน',
    teacherPortal: 'Teacher Portal',
    analytics: 'วิเคราะห์ข้อมูล',
    reports: 'รายงาน',
    studentManagement: 'การจัดการนักเรียน',
    studentNew: 'นักเรียนใหม่',
    studentList: 'รายชื่อนักเรียน',
    settings: 'การตั้งค่า',
    settingsProfile: 'ข้อมูลส่วนตัว',
    settingsSystem: 'การตั้งค่าระบบ',
    settingsPassword: 'เปลี่ยนรหัสผ่าน',
    teacherList: 'รายชื่อครู',
    teacherNew: 'เพิ่มครูใหม่',
    teacherManagement: 'การจัดการครู',
    lineOA: 'Line OA',
    studentPortal: 'Student Portal',
    studentSchedule: 'ตารางเรียนนักเรียน',

    // Authentication
    login: 'เข้าสู่ระบบ',
    loginTitle: 'เข้าสู่ระบบ',
    registerTitle: 'สมัครสมาชิก',
    username: 'ชื่อผู้ใช้',
    password: 'รหัสผ่าน',
    confirmPassword: 'ยืนยันรหัสผ่าน',
    dontHaveAccount: 'ยังไม่มีบัญชี? ',
    alreadyHaveAccount: 'มีบัญชีแล้ว? ',
    loginButton: 'เข้าสู่ระบบ',
    registerButton: 'สมัครสมาชิก',
    processing: 'กำลังดำเนินการ...',
    pleaseEnterUsername: 'กรุณากรอกชื่อผู้ใช้',
    pleaseEnterPassword: 'กรุณากรอกรหัสผ่าน',
    pleaseEnterEmail: 'กรุณากรอกอีเมล',
    phoneOptional: 'เบอร์โทรศัพท์ (ไม่บังคับ)',
    lineIdOptional: 'Line ID (ไม่บังคับ)',
    pleaseEnterPhone: 'กรุณากรอกเบอร์โทรศัพท์',
    pleaseEnterLineId: 'กรุณากรอก Line ID',

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

    // Change Password
    changePassword: 'เปลี่ยนรหัสผ่าน',
    currentPassword: 'รหัสผ่านปัจจุบัน',
    newPassword: 'รหัสผ่านใหม่',
    confirmNewPassword: 'ยืนยันรหัสผ่านใหม่',
    pleaseEnterCurrentPassword: 'กรุณากรอกรหัสผ่านปัจจุบัน',
    pleaseEnterNewPassword: 'กรุณากรอกรหัสผ่านใหม่',
    pleaseConfirmNewPassword: 'กรุณายืนยันรหัสผ่านใหม่',

    // Student Registration
    studentRegTitle: 'ลงทะเบียนนักเรียน',
    basicInfo: 'ข้อมูลพื้นฐาน',
    firstNameEn: 'ชื่อ (ภาษาอังกฤษ)',
    lastNameEn: 'นามสกุล (ภาษาอังกฤษ)',
    firstNameTh: 'ชื่อ (ภาษาไทย)',
    lastNameTh: 'นามสกุล (ภาษาไทย)',
    coursePreferences: 'ความต้องการเรียน',
    selectLevel: 'เลือกระดับ',
    notest: 'ไม่เคยมีการทดสอบ (No Test)',
    beginner: 'เริ่มต้น (Beginner)',
    elementary: 'พื้นฐาน (Elementary)',
    intermediate: 'ปานกลาง (Intermediate)',
    upperIntermediate: 'ปานกลาง-สูง (Upper-Intermediate)',
    advanced: 'สูง (Advanced)',
    learningNeeds: 'ความต้องการเรียน',
    currentEducation: 'ระดับการศึกษาปัจจุบัน',
    recentCEFR: 'ระดับ CEFR ล่าสุด',

      // Placeholders
      pleaseEnterName: 'กรุณากรอกชื่อ',
      pleaseEnterLastName: 'กรุณากรอกนามสกุล',
      pleaseEnterAddress: 'กรุณากรอกที่อยู่',
    },

  en: {
    // New properties
    newStudent: 'New Student',
    systemUpdate: 'System Update',
    systemUpdateDesc: 'There is a recent system update',
    notifications: 'Notifications',
    newStudentDesc: 'A new student has registered',

    // Navigation
    dashboard: 'Dashboard',
    profile: 'Profile',
    studentRegistration: 'Student Registration',
    logout: 'Logout',
    systemSettings: 'System Settings',
    schedule: 'Schedule',
    teacherPortal: 'Teacher Portal',
    studentPortal: 'Student Portal',
    studentSchedule: 'Student Schedule',
    analytics: 'Analytics',
    reports: 'Reports',
    studentManagement: 'Student Management',
    settings: 'Settings',
    studentList: 'Student List',
    studentNew: 'New Student',
    settingsPassword: 'Change Password',
    settingsProfile: 'Profile Settings',
    settingsSystem: 'System Settings',
    teacherManagement: 'Teacher Management',
    teacherList: 'Teacher List',
    teacherNew: 'New Teacher',
    lineOA: 'Line OA',



    // Authentication
    login: 'Login',
    loginTitle: 'Login',
    registerTitle: 'Register',
    username: 'Username',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    dontHaveAccount: "Don't have an account? ",
    alreadyHaveAccount: 'Already have an account? ',
    loginButton: 'Login',
    registerButton: 'Register',
    processing: 'Processing...',
    pleaseEnterUsername: 'Please enter username',
    pleaseEnterPassword: 'Please enter password',
    pleaseEnterEmail: 'Please enter email',
    phoneOptional: 'Phone (Optional)',
    lineIdOptional: 'Line ID (Optional)',
    pleaseEnterPhone: 'Please enter phone number',
    pleaseEnterLineId: 'Please enter Line ID',

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

    // Change Password
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    pleaseEnterCurrentPassword: 'Please enter current password',
    pleaseEnterNewPassword: 'Please enter new password',
    pleaseConfirmNewPassword: 'Please confirm new password',

    // Student Registration
    studentRegTitle: 'Student Registration',
    basicInfo: 'Basic Information',
    firstNameEn: 'First Name (English)',
    lastNameEn: 'Last Name (English)',
    firstNameTh: 'First Name (Thai)',
    lastNameTh: 'Last Name (Thai)',
    coursePreferences: 'Course Preferences',
    selectLevel: 'Select Level',
    notest: 'No Test Record',
    beginner: 'Beginner',
    elementary: 'Elementary',
    intermediate: 'Intermediate',
    upperIntermediate: 'Upper-Intermediate',
    advanced: 'Advanced',
    learningNeeds: 'Learning Needs',
    currentEducation: 'Current Education Level',
    recentCEFR: 'Recent CEFR Level',

    // Placeholders
    pleaseEnterName: 'Please enter name',
    pleaseEnterLastName: 'Please enter last name',
    pleaseEnterAddress: 'Please enter address',
  }
}
