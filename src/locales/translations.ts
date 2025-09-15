export type Language = 'th' | 'en';

export interface Translations {
  language: string;
  privacyPolicy: string;
  termsOfService: string;
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
  
  // Groups Management
  groupManagement: string;
  groups: string;
  studyGroups: string;
  manageStudyGroups: string;
  viewGroupDetails: string;
  assignStudent: string;
  addStudentToGroup: string;
  removeStudentFromGroup: string;
  groupDetails: string;
  groupMembers: string;
  membersList: string;
  noGroupsFound: string;
  noMembersInGroup: string;
  groupName: string;
  groupCourse: string;
  groupLevel: string;
  groupStatus: string;
  groupPaymentStatus: string;
  groupStudents: string;
  groupAvailable: string;
  groupSlots: string;
  slotsAvailable: string;
  groupFull: string;
  groupEmpty: string;
  groupActive: string;
  groupInactive: string;
  groupSuspended: string;
  groupNeedMore: string;
  paymentPending: string;
  paymentDepositPaid: string;
  paymentFullyPaid: string;
  groupMaxStudents: string;
  groupCurrentStudents: string;
  groupDescription: string;
  noGroupDescription: string;
  groupCreated: string;
  groupLastUpdated: string;
  memberJoined: string;
  memberPayment: string;
  groupCategory: string;
  allGroupCourses: string;
  allGroupStatus: string;
  allGroupPaymentStatus: string;
  groupPerPage: string;
  showGroupPerPage: string;
  groupFilters: string;
  groupQuickFilters: string;
  clearGroupFilters: string;
  clearAllFilters: string;
  refreshGroups: string;
  loadingGroups: string;
  tryAgainGroups: string;
  previousPage: string;
  nextPage: string;
  pageNum: string;
  pageOf: string;
  assignStudentToGroup: string;
  selectedGroupStudent: string;
  selectGroupStudent: string;
  searchGroupStudents: string;
  groupNameSurnameOrEmail: string;
  noGroupStudentsFound: string;
  noGroupStudentsAvailable: string;
  assigningStudent: string;
  studentAssignmentSuccess: string;
  studentAssignmentFailed: string;
  removeMemberConfirm: string;
  removeMemberError: string;
  updateMemberPaymentError: string;
  loadGroupMembersError: string;
  loadGroupStudentsError: string;
  groupIsFullError: string;
  groupFullMessage: string;
  changeStudent: string;
  editGroup: string;
  removeGroupMember: string;
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
  home: string;
  courses: string;
  about: string;
  contact: string;
  privacy: string;
  terms: string;
  

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
  readMore: string;
  backToHome: string;
  getStarted: string;
  learnMore: string;
  viewCourses: string;

  // Homepage
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  startLearning: string;
  whyChooseUs: string;
  whyChooseDesc: string;
  changeLifeIn3Months: string;
  changeLifeDesc: string;
  perfectForBeginners: string;
  perfectForBeginnersDesc: string;
  guaranteedResults: string;
  guaranteedResultsDesc: string;
  readyToChange: string;
  readyToChangeDesc: string;
  joinUs: string;
  freeRegistration: string;
  freeConsultation: string;
  monthsResult: string;
  followers: string;
  successfulStudents: string;
  rating: string;

  // Courses Page
  coursesTitle: string;
  coursesDescription: string;
  courseFeatures: string;
  basicCourse: string;
  basicCourseDesc: string;
  intermediateCourse: string;
  intermediateCourseDesc: string;
  advancedCourse: string;
  advancedCourseDesc: string;
  businessCourse: string;
  businessCourseDesc: string;
  courseBenefits: string;
  flexibleSchedule: string;
  smallClasses: string;
  practicalFocus: string;
  progressTracking: string;

  // About Page
  aboutTitle: string;
  aboutDescription: string;
  ourMission: string;
  ourMissionDesc: string;
  ourVision: string;
  ourVisionDesc: string;
  ourTeam: string;
  ourTeamDesc: string;
  ourMethod: string;
  ourMethodDesc: string;
  whyTrustUs: string;
  experiencedTeachers: string;
  experiencedTeachersDesc: string;
  provenMethod: string;
  provenMethodDesc: string;
  comprehensiveSupport: string;
  comprehensiveSupportDesc: string;

  // Contact Page
  contactTitle: string;
  contactDescription: string;
  getInTouch: string;
  address: string;
  phone: string;
  email: string;
  businessHours: string;
  mondayFriday: string;
  saturdaySunday: string;
  followUs: string;
  contactForm: string;
  yourName: string;
  yourEmail: string;
  yourMessage: string;
  sendMessage: string;

  // Privacy Policy Page
  privacyTitle: string;
  privacyDescription: string;
  informationCollection: string;
  informationCollectionDesc: string;
  informationUse: string;
  informationUseDesc: string;
  informationProtection: string;
  informationProtectionDesc: string;
  cookiePolicy: string;
  cookiePolicyDesc: string;
  thirdPartyServices: string;
  thirdPartyServicesDesc: string;
  userRights: string;
  userRightsDesc: string;
  policyUpdates: string;
  policyUpdatesDesc: string;

  // Terms of Service Page
  termsTitle: string;
  termsDescription: string;
  serviceTerms: string;
  serviceTermsDesc: string;
  userResponsibilities: string;
  userResponsibilitiesDesc: string;
  paymentTerms: string;
  paymentTermsDesc: string;
  cancellationPolicy: string;
  cancellationPolicyDesc: string;
  intellectualProperty: string;
  intellectualPropertyDesc: string;
  limitationLiability: string;
  limitationLiabilityDesc: string;
  termination: string;
  terminationDesc: string;

  // Dashboard
  welcomeMessage: string;
  welcomeSubMessage: string;
  quickActions: string;
  recentActivity: string;
  loginSuccess: string;
  loginSuccessTime: string;

  //Schedule
  SelectTeachers: string;
  scheduleManagement: string;
  viewMode: string;
  dayView: string;
  weekView: string;
  monthView: string;
  currentTime: string;
  selectAllTeachers: string;
  clearSelection: string;
  noScheduleData: string;
  scheduleDetails: string;
  scheduleInformation: string;
  courseInformation: string;
  time: string;
  classroom: string;
  totalHours: string;
  hoursPerSession: string;
  startDate: string;
  type: string;
  people: string;
  scheduleSummary: string;
  totalSessions: string;
  scheduledSessions: string;
  completedSessions: string;
  createNewSchedule: string;
  preliminaryInfo: string;
  teacher: string;
  date: string;
  underDevelopment: string;
  featureComingSoon: string;
  createScheduleMock: string;
  scheduled: string;
  completed: string;
  cancelled: string;
  active: string;
  inactive: string;
  failedToLoadDetails: string;
  retryLoading: string;
  sessionDetails: string;
  age: string;
  years: string;
  nickname: string;
  branch: string;
  room: string;
  course: string;
  capacity: string;
  available: string;
  enrolled: string;
  students: string;
  notes: string;
  status: string;
  editSchedule: string;
  createSession: string;
  scheduleForm: string;
  courseName: string;
  selectCourse: string;
  selectTeacher: string;
  selectRoom: string;
  scheduleName: string;
  timeSlots: string;
  addTimeSlot: string;
  removeTimeSlot: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
  autoRescheduleHolidays: string;
  maxStudents: string;
  sessionForm: string;
  sessionDate: string;
  repeatSession: string;
  repeatFrequency: string;
  repeatInterval: string;
  repeatEnd: string;
  repeatCount: string;
  repeatUntilDate: string;
  daily: string;
  weekly: string;
  monthly: string;
  never: string;
  after: string;
  on: string;
  makeupSession: string;
  appointmentNotes: string;
  createScheduleSuccess: string;
  updateScheduleSuccess: string;
  createSessionSuccess: string;
  fillRequiredFields: string;
  errorCreatingSchedule: string;
  errorUpdatingSchedule: string;
  errorCreatingSession: string;

  // New session creation functionality
  createSessionMode: string;
  singleSession: string;
  createOneSession: string;
  multipleSession: string;
  createMultipleSessions: string;
  bulkCreate: string;
  createBulkSessions: string;
  singleSessionDetails: string;
  multipleSessionDetails: string;
  bulkCreateDetails: string;
  numberOfSessions: string;
  multipleSessionWarning: string;
  willCreateSessions: string;
  repeatsEvery: string;
  checkForConflicts: string;
  bulkCreateComingSoon: string;
  bulkCreateDescription: string;
  selectSchedule: string;
  sessionNotes: string;
  createSessions: string;

  // Profile
  personalInfo: string;
  name: string;
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

  //Teachers
  teachingReport: string;

  // Placeholders
  pleaseEnterName: string;
  pleaseEnterLastName: string;
  pleaseEnterAddress: string;
  
  // CTA Section - Additional
  readyToTransform: string;
  withEnglish: string;
  question: string;
  joinSuccessfulStudents: string;
  followersCount: string;
  studentsSuccess: string;
  onlineOrBranch: string;
  registerFree: string;
  consultFree: string;
  monthsResults: string;
  reviewScore: string;
  
  // Footer
  footerDescription: string;
  mainMenu: string;
  koratBranch: string;
  koratLocation: string;
  weekdayHours: string;
  weekendHours: string;
  allRightsReserved: string;
  developedBy: string;
  
  // Courses Page
  coursesPageTitle: string;
  coursesPageSubtitle: string;
  askForAdvice: string;
  filterByLevel: string;
  filterByType: string;
  ourCourses: string;
  whyOurCourses: string;
  whyOurCoursesDesc: string;
  readyToStartLearning: string;
  readyToStartLearningDesc: string;
  contactForInfo: string;
  
  // About Page
  aboutPageTitle: string;
  aboutPageSubtitle: string;
  contactUs: string;     
  missionStatement: string;
  ourStory: string;
  storyParagraph1: string;
  storyParagraph2: string;
  storyParagraph3: string;
  ourValues: string;
  valuesDescription: string;
  qualityEducation: string;
  qualityEducationDesc: string;
  innovation: string;
  innovationDesc: string;
  studentCare: string;
  studentCareDesc: string;
  results: string;
  resultsDesc: string;
  community: string;
  communityDesc: string;
  excellence: string;
  excellenceDesc: string;
  meetOurTeam: string;
  teamDescription: string;
  ourAchievements: string;
  achievementsDescription: string;
  readyToJoin: string;
  readyToJoinDescription: string;
  startToday: string;
  
  // Contact Page
  contactPageTitle: string;
  contactPageSubtitle: string;
  registerNow: string;
  callNow: string;
  contactMethods: string;
  contactMethodsDesc: string;
  phoneDesc: string;
  lineDesc: string;
  emailDesc: string;
  facebookDesc: string;
  sendMessageDesc: string;
  fullName: string;
  phoneNumber: string;
  emailAddress: string;
  subject: string;
  pleaseSelectSubject: string;
  courseInquiry: string;
  scheduleInquiry: string;
  pricingInquiry: string;
  generalInquiry: string;
  messagePlaceholder: string;
  location: string;
  openingHours: string;
  quickContact: string;
  findUs: string;
  findUsDesc: string;
  openMap: string;
  frequentlyAsked: string;
  faqDesc: string;
  readyToTalk: string;
  readyToTalkDesc: string;
  
  // Privacy Policy Page
  privacyPolicyTitle: string;
  privacyPolicyDescription: string;
  
  // Terms of Service Page
  termsOfServiceTitle: string;
  termsOfServiceDescription: string;
}

export const translations: Record<Language, Translations> = {
  th: {
    // New properties
    newStudent: 'นักเรียนใหม่',
    systemUpdate: 'อัปเดตระบบ',
    systemUpdateDesc: 'มีการอัปเดตระบบล่าสุด',
    notifications: 'การแจ้งเตือน',
    newStudentDesc: 'มีนักเรียนใหม่ลงทะเบียน',
    language: 'ภาษา',
    privacyPolicy: 'นโยบายความเป็นส่วนตัว',
    termsOfService: 'ข้อกำหนดการใช้งาน',

    // Navigation
    dashboard: 'แดชบอร์ด',
    profile: 'โปรไฟล์',
    studentRegistration: 'ลงทะเบียนนักเรียน',
    logout: 'ออกจากระบบ',
    systemSettings: 'การตั้งค่าระบบ',
    schedule: 'ตารางเรียน',
    home: 'หน้าแรก',
    courses: 'คอร์สเรียน',
    about: 'เกี่ยวกับเรา',
    contact: 'ติดต่อ',
    privacy: 'นโยบายความเป็นส่วนตัว',
    terms: 'ข้อกำหนดการใช้งาน',
    teacherPortal: 'Teacher Portal',
    analytics: 'วิเคราะห์ข้อมูล',
    reports: 'รายงาน',
    studentManagement: 'การจัดการนักเรียน',
    studentNew: 'นักเรียนใหม่',
    studentList: 'รายชื่อนักเรียน',
    
    // Groups Management
    groupManagement: 'การจัดการกลุ่มเรียน',
    groups: 'กลุ่มเรียน',
    studyGroups: 'กลุ่มเรียน',
    manageStudyGroups: 'จัดการกลุ่มเรียน',
    viewGroupDetails: 'ดูรายละเอียด',
    assignStudent: 'เพิ่มนักเรียน',
    addStudentToGroup: 'เพิ่มนักเรียนเข้ากลุ่ม',
    removeStudentFromGroup: 'ลบนักเรียนออกจากกลุ่ม',
    groupDetails: 'รายละเอียดกลุ่ม',
    groupMembers: 'สมาชิกกลุ่ม',
    membersList: 'รายชื่อสมาชิก',
    noGroupsFound: 'ไม่พบกลุ่มเรียน',
    noMembersInGroup: 'ยังไม่มีสมาชิกในกลุ่ม',
    groupName: 'ชื่อกลุ่ม',
    groupCourse: 'คอร์ส',
    groupLevel: 'ระดับ',
    groupStatus: 'สถานะ',
    groupPaymentStatus: 'สถานะการชำระเงิน',
    groupStudents: 'นักเรียน',
    groupAvailable: 'ที่ว่าง',
    groupSlots: 'ที่นั่ง',
    slotsAvailable: 'เหลือที่ว่าง',
    groupFull: 'เต็มแล้ว',
    groupEmpty: 'ว่าง',
    groupActive: 'เปิดรับ',
    groupInactive: 'ปิด',
    groupSuspended: 'พักการเรียน',
    groupNeedMore: 'ต้องเติม',
    paymentPending: 'รอชำระ',
    paymentDepositPaid: 'ชำระมัดจำ',
    paymentFullyPaid: 'ชำระครบ',
    groupMaxStudents: 'จำนวนนักเรียนสูงสุด',
    groupCurrentStudents: 'นักเรียนปัจจุบัน',
    groupDescription: 'คำอธิบาย',
    noGroupDescription: 'ไม่มีคำอธิบาย',
    groupCreated: 'สร้างเมื่อ',
    groupLastUpdated: 'แก้ไขล่าสุด',
    memberJoined: 'เข้าร่วมเมื่อ',
    memberPayment: 'การชำระเงิน',
    groupCategory: 'หมวดหมู่',
    allGroupCourses: 'ทุกคอร์ส',
    allGroupStatus: 'ทุกสถานะ',
    allGroupPaymentStatus: 'ทุกสถานะการชำระ',
    groupPerPage: 'แสดงต่อหน้า',
    showGroupPerPage: 'แสดงต่อหน้า',
    groupFilters: 'ตัวกรอง',
    groupQuickFilters: 'ตัวกรองด่วน',
    clearGroupFilters: 'ล้างตัวกรอง',
    clearAllFilters: 'ล้างทั้งหมด',
    refreshGroups: 'รีเฟรช',
    loadingGroups: 'กำลังโหลด...',
    tryAgainGroups: 'ลองใหม่',
    previousPage: 'ก่อนหน้า',
    nextPage: 'ถัดไป',
    pageNum: 'หน้า',
    pageOf: 'จาก',
    assignStudentToGroup: 'เพิ่มนักเรียนเข้ากลุ่ม',
    selectedGroupStudent: 'นักเรียนที่เลือก',
    selectGroupStudent: 'เลือกนักเรียน',
    searchGroupStudents: 'ค้นหานักเรียน',
    groupNameSurnameOrEmail: 'ชื่อ, นามสกุล, หรืออีเมล...',
    noGroupStudentsFound: 'ไม่พบนักเรียนที่ค้นหา',
    noGroupStudentsAvailable: 'ไม่มีนักเรียนที่สามารถเพิ่มได้',
    assigningStudent: 'กำลังเพิ่ม...',
    studentAssignmentSuccess: 'เพิ่มนักเรียนสำเร็จ',
    studentAssignmentFailed: 'เกิดข้อผิดพลาดในการเพิ่มนักเรียน',
    removeMemberConfirm: 'คุณแน่ใจหรือไม่ที่จะลบสมาชิกนี้?',
    removeMemberError: 'เกิดข้อผิดพลาดในการลบสมาชิก',
    updateMemberPaymentError: 'เกิดข้อผิดพลาดในการอัปเดตสถานะการชำระเงิน',
    loadGroupMembersError: 'ไม่สามารถโหลดรายชื่อสมาชิกได้',
    loadGroupStudentsError: 'ไม่สามารถโหลดรายชื่อนักเรียนได้',
    groupIsFullError: 'กลุ่มเต็มแล้ว',
    groupFullMessage: 'ไม่สามารถเพิ่มนักเรียนใหม่ได้ เนื่องจากกลุ่มมีสมาชิกครบแล้ว',
    changeStudent: 'เปลี่ยน',
    editGroup: 'แก้ไข',
    removeGroupMember: 'ลบ',
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
    englishKorat: 'ระบบจัดการภายใน English Korat Languges School',
    menu: 'เมนู',
    close: 'ปิด',
    save: 'บันทึก',
    cancel: 'ยกเลิก',
    submit: 'ยืนยัน',
    register: 'ลงทะเบียน',
    readMore: 'อ่านเพิ่มเติม',
    backToHome: 'กลับหน้าแรก',
    getStarted: 'เริ่มต้นเรียน',
    learnMore: 'เรียนรู้เพิ่มเติม',
    viewCourses: 'ดูคอร์สเรียน',

    // Homepage
    heroTitle: 'English Korat',
    heroSubtitle: 'เราทำให้คุณพูดได้',
    heroDescription: 'ที่เรียนที่ดีที่สุด สำหรับคนที่ #อ่อนภาษาอังกฤษ เปลี่ยนชีวิตหลังเรียน ใน 3 เดือน ‼️',
    startLearning: 'เริ่มเรียนวันนี้',
    whyChooseUs: 'ทำไมต้องเลือก English Korat?',
    whyChooseDesc: 'เรามีวิธีการสอนที่เป็นเอกลักษณ์ที่จะทำให้คุณพูดภาษาอังกฤษได้อย่างมั่นใจ',
    changeLifeIn3Months: 'เปลี่ยนชีวิตใน 3 เดือน',
    changeLifeDesc: 'วิธีการสอนที่พิสูจน์แล้วว่าสามารถทำให้คุณพูดภาษาอังกฤษได้ในเวลาอันสั้น',
    perfectForBeginners: 'เหมาะสำหรับคนอ่อนภาษา',
    perfectForBeginnersDesc: 'เราเข้าใจปัญหาของคนไทยที่เรียนภาษาอังกฤษ และมีวิธีแก้ไขที่ตรงจุด',
    guaranteedResults: 'ผลลัพธ์ที่รับประกันได้',
    guaranteedResultsDesc: 'มีนักเรียนกว่า 24,000+ คนที่ประสบความสำเร็จกับเรา',
    readyToChange: 'พร้อมเปลี่ยนชีวิตด้วยภาษาอังกฤษแล้วหรือยัง?',
    readyToChangeDesc: 'เข้าร่วมกับนักเรียนกว่า 24,000+ คนที่ประสบความสำเร็จกับเรา เรียนออนไลน์หรือที่สาขาก็ได้ เลือกตามความสะดวกของคุณ',
    joinUs: 'เข้าร่วมกับเรา',
    freeRegistration: '🚀 ลงทะเบียนเรียนฟรี',
    freeConsultation: '📞 ปรึกษาฟรี',
    monthsResult: 'เดือนเห็นผล',
    followers: 'ผู้ติดตาม',
    successfulStudents: 'นักเรียนสำเร็จ',
    rating: 'คะแนนรีวิว',

    // Courses Page
    coursesTitle: 'คอร์สเรียนภาษาอังกฤษ',
    coursesDescription: 'เลือกคอร์สที่เหมาะกับระดับและความต้องการของคุณ พร้อมวิธีการสอนที่เป็นเอกลักษณ์',
    courseFeatures: 'คุณสมบัติของคอร์ส',
    basicCourse: 'คอร์สพื้นฐาน (Basic)',
    basicCourseDesc: 'เหมาะสำหรับผู้เริ่มต้นเรียนภาษาอังกฤษ เน้นพื้นฐานการสื่อสาร',
    intermediateCourse: 'คอร์สปานกลาง (Intermediate)',
    intermediateCourseDesc: 'สำหรับผู้ที่มีพื้นฐานแล้ว ต้องการพัฒนาทักษะให้สูงขึ้น',
    advancedCourse: 'คอร์สสูง (Advanced)',
    advancedCourseDesc: 'เน้นการใช้ภาษาระดับสูง เพื่อการทำงานและการสื่อสารที่ซับซ้อน',
    businessCourse: 'คอร์สธุรกิจ (Business)',
    businessCourseDesc: 'ภาษาอังกฤษเพื่อการทำงาน การเจรจา และการนำเสนอ',
    courseBenefits: 'ประโยชน์ที่ได้รับ',
    flexibleSchedule: 'เรียนยืดหยุ่น',
    smallClasses: 'คลาสเล็ก',
    practicalFocus: 'เน้นการใช้จริง',
    progressTracking: 'ติดตามผล',

    // About Page
    aboutTitle: 'เกี่ยวกับเรา',
    aboutDescription: 'English Korat เป็นสถาบันสอนภาษาอังกฤษที่มุ่งมั่นพัฒนาการศึกษาภาษาอังกฤษให้กับคนไทย',
    ourMission: 'ภารกิจของเรา',
    ourMissionDesc: 'เราต้องการทำให้คนไทยทุกคนสามารถพูดภาษาอังกฤษได้อย่างมั่นใจ ด้วยวิธีการสอนที่เข้าใจปัญหาของคนไทย',
    ourVision: 'วิสัยทัศน์',
    ourVisionDesc: 'เป็นสถาบันสอนภาษาอังกฤษอันดับหนึ่งในภาคตะวันออกเฉียงเหนือ ที่ให้ผลลัพธ์ที่เห็นได้จริง',
    ourTeam: 'ทีมงานของเรา',
    ourTeamDesc: 'ทีมผู้สอนที่มีประสบการณ์และใจรักในการสอน พร้อมให้คำปรึกษาในทุกขั้นตอนการเรียนรู้',
    ourMethod: 'วิธีการสอนของเรา',
    ourMethodDesc: 'เราใช้วิธีการสอนที่เน้นการฝึกฝนและการใช้งานจริง ไม่เน้นท่องจำ แต่เน้นความเข้าใจและการประยุกต์ใช้',
    whyTrustUs: 'ทำไมควรเชื่อใจเรา',
    experiencedTeachers: 'ครูผู้สอนมากประสบการณ์',
    experiencedTeachersDesc: 'ทีมครูที่มีประสบการณ์การสอนมากกว่า 10 ปี และเข้าใจปัญหาของคนไทย',
    provenMethod: 'วิธีการที่พิสูจน์แล้ว',
    provenMethodDesc: 'มีผลงานการสอนที่เป็นที่ยอมรับ กับนักเรียนกว่า 24,000+ คน',
    comprehensiveSupport: 'การสนับสนุนที่ครอบคลุม',
    comprehensiveSupportDesc: 'ติดตามผลการเรียนและให้คำปรึกษาตลอดระยะเวลาการเรียน',

    // Contact Page
    contactTitle: 'ติดต่อเรา',
    contactDescription: 'พร้อมให้คำปรึกษาและตอบคำถามเกี่ยวกับการเรียนภาษาอังกฤษ',
    getInTouch: 'ติดต่อเรา',
    address: 'ที่อยู่',
    phone: 'โทรศัพท์',
    email: 'อีเมล',
    businessHours: 'เวลาทำการ',
    mondayFriday: 'จันทร์-ศุกร์ 9:00-20:00',
    saturdaySunday: 'เสาร์-อาทิตย์ 9:00-18:00',
    followUs: 'ติดตามเรา',
    contactForm: 'ฟอร์มติดต่อ',
    yourName: 'ชื่อของคุณ',
    yourEmail: 'อีเมลของคุณ',
    yourMessage: 'ข้อความของคุณ',
    sendMessage: 'ส่งข้อความ',

    // Privacy Policy Page
    privacyTitle: 'นโยบายความเป็นส่วนตัว',
    privacyDescription: 'เราให้ความสำคัญกับความเป็นส่วนตัวของข้อมูลของคุณ',
    informationCollection: 'การเก็บรวบรวมข้อมูล',
    informationCollectionDesc: 'เราเก็บรวบรวมข้อมูลที่จำเป็นสำหรับการให้บริการการศึกษาเท่านั้น',
    informationUse: 'การใช้ข้อมูล',
    informationUseDesc: 'ข้อมูลของคุณจะถูกใช้เพื่อการจัดการการเรียนการสอนและการติดต่อสื่อสาร',
    informationProtection: 'การปกป้องข้อมูล',
    informationProtectionDesc: 'เรามีมาตรการรักษาความปลอดภัยข้อมูลในระดับสูง',
    cookiePolicy: 'นโยบายคุกกี้',
    cookiePolicyDesc: 'เราใช้คุกกี้เพื่อปรับปรุงประสบการณ์การใช้งานเว็บไซต์',
    thirdPartyServices: 'บริการของบุคคลที่สาม',
    thirdPartyServicesDesc: 'เราอาจใช้บริการของบุคคลที่สามในการให้บริการบางส่วน',
    userRights: 'สิทธิของผู้ใช้',
    userRightsDesc: 'คุณมีสิทธิในการเข้าถึง แก้ไข และลบข้อมูลส่วนบุคคลของคุณ',
    policyUpdates: 'การอัปเดตนโยบาย',
    policyUpdatesDesc: 'นโยบายนี้อาจมีการปรับปรุงเปลี่ยนแปลงตามความเหมาะสม',

    // Terms of Service Page
    termsTitle: 'ข้อกำหนดการใช้งาน',
    termsDescription: 'ข้อกำหนดและเงื่อนไขในการใช้บริการ',
    serviceTerms: 'เงื่อนไขการใช้บริการ',
    serviceTermsDesc: 'การใช้บริการของเราถือว่าคุณยอมรับข้อกำหนดเหล่านี้',
    userResponsibilities: 'ความรับผิดชอบของผู้ใช้',
    userResponsibilitiesDesc: 'ผู้ใช้ต้องใช้บริการอย่างถูกต้องและไม่ละเมิดสิทธิของผู้อื่น',
    paymentTerms: 'เงื่อนไขการชำระเงิน',
    paymentTermsDesc: 'การชำระค่าเรียนต้องทำตามเงื่อนไขที่กำหนด',
    cancellationPolicy: 'นโยบายการยกเลิก',
    cancellationPolicyDesc: 'การยกเลิกคอร์สต้องแจ้งล่วงหน้าตามเงื่อนไขที่กำหนด',
    intellectualProperty: 'ทรัพย์สินทางปัญญา',
    intellectualPropertyDesc: 'เนื้อหาการสอนและสื่อการเรียนเป็นลิขสิทธิ์ของสถาบัน',
    limitationLiability: 'ข้อจำกัดความรับผิดชอบ',
    limitationLiabilityDesc: 'สถาบันจำกัดความรับผิดชอบตามกรอบกฎหมาย',
    termination: 'การยุติบริการ',
    terminationDesc: 'สถาบันสงวนสิทธิในการยุติบริการในกรณีที่มีการละเมิดข้อกำหนด',

    // Dashboard
    welcomeMessage: 'ยินดีต้อนรับ!',
    welcomeSubMessage: 'คุณได้เข้าสู่ระบบเรียบร้อยแล้ว เริ่มต้นการเรียนรู้ภาษาอังกฤษกับเรา',
    quickActions: 'การดำเนินการด่วน',
    recentActivity: 'กิจกรรมล่าสุด',
    loginSuccess: 'เข้าสู่ระบบสำเร็จ',
    loginSuccessTime: 'เมื่อสักครู่',

    //Schedule
    SelectTeachers: 'เลือกคุณครู',
    scheduleManagement: 'จัดการตารางเรียน',
    viewMode: 'โหมดดู',
    dayView: 'วัน',
    weekView: 'สัปดาห์',
    monthView: 'เดือน',
    currentTime: 'เวลาปัจจุบัน',
    selectAllTeachers: 'ทั้งหมด',
    clearSelection: 'ยกเลิก',
    noScheduleData: 'ไม่มีข้อมูลตารางเรียน',
    scheduleDetails: 'รายละเอียดตารางเรียน',
    scheduleInformation: 'ข้อมูลตารางเรียน',
    courseInformation: 'ข้อมูลคอร์ส',
    time: 'เวลา',
    classroom: 'ห้องเรียน',
    totalHours: 'จำนวนชั่วโมงรวม',
    hoursPerSession: 'ชั่วโมง/ครั้ง',
    startDate: 'วันที่เริ่ม',
    type: 'ประเภท',
    people: 'คน',
    scheduleSummary: 'สรุปตารางเรียน',
    totalSessions: 'ครั้งทั้งหมด',
    scheduledSessions: 'กำหนดแล้ว',
    completedSessions: 'เรียนแล้ว',
    createNewSchedule: 'สร้างตารางเรียนใหม่',
    preliminaryInfo: 'ข้อมูลเบื้องต้น',
    teacher: 'ครูผู้สอน',
    date: 'วันที่',
    underDevelopment: 'อยู่ระหว่างการพัฒนา',
    featureComingSoon: 'ฟีเจอร์สร้างตารางเรียนจะเปิดใช้งานเร็วๆ นี้',
    createScheduleMock: 'สร้างตารางเรียน (Mock)',
    scheduled: 'กำหนดเรียน',
    completed: 'เสร็จสิ้น',
    cancelled: 'ยกเลิก',
    active: 'ใช้งาน',
    inactive: 'ไม่ใช้งาน',
    failedToLoadDetails: 'ไม่สามารถโหลดข้อมูลรายละเอียดได้',
    retryLoading: 'ลองใหม่',
    sessionDetails: 'รายละเอียดครั้งเรียน',
    age: 'อายุ',
    years: 'ปี',
    nickname: 'ชื่อเล่น',
    branch: 'สาขา',
    room: 'ห้อง',
    course: 'คอร์ส',
    capacity: 'จำนวนที่รับได้',
    available: 'ว่าง',
    enrolled: 'ลงทะเบียนแล้ว',
    students: 'นักเรียน',
    notes: 'หมายเหตุ',
    status: 'สถานะ',
    editSchedule: 'แก้ไขตารางเรียน',
    createSession: 'สร้างครั้งเรียน',
    scheduleForm: 'ฟอร์มตารางเรียน',
    courseName: 'ชื่อคอร์ส',
    selectCourse: 'เลือกคอร์ส',
    selectTeacher: 'เลือกครู',
    selectRoom: 'เลือกห้อง',
    scheduleName: 'ชื่อตารางเรียน',
    timeSlots: 'ช่วงเวลา',
    addTimeSlot: 'เพิ่มช่วงเวลา',
    removeTimeSlot: 'ลบช่วงเวลา',
    dayOfWeek: 'วันในสัปดาห์',
    startTime: 'เวลาเริ่ม',
    endTime: 'เวลาจบ',
    monday: 'จันทร์',
    tuesday: 'อังคาร',
    wednesday: 'พุธ',
    thursday: 'พฤหัส',
    friday: 'ศุกร์',
    saturday: 'เสาร์',
    sunday: 'อาทิตย์',
    autoRescheduleHolidays: 'เลื่อนวันหยุดอัตโนมัติ',
    maxStudents: 'จำนวนนักเรียนสูงสุด',
    sessionForm: 'ฟอร์มครั้งเรียน',
    sessionDate: 'วันที่เรียน',
    repeatSession: 'ทำซ้ำ',
    repeatFrequency: 'ความถี่',
    repeatInterval: 'ช่วงการทำซ้ำ',
    repeatEnd: 'สิ้นสุดการทำซ้ำ',
    repeatCount: 'จำนวนครั้ง',
    repeatUntilDate: 'ทำซ้ำจนถึงวันที่',
    daily: 'รายวัน',
    weekly: 'รายสัปดาห์',
    monthly: 'รายเดือน',
    never: 'ไม่สิ้นสุด',
    after: 'หลังจาก',
    on: 'ณ วันที่',
    makeupSession: 'ครั้งเรียนชดเชย',
    appointmentNotes: 'หมายเหตุนัดหมาย',
    createScheduleSuccess: 'สร้างตารางเรียนสำเร็จ',
    updateScheduleSuccess: 'แก้ไขตารางเรียนสำเร็จ',
    createSessionSuccess: 'สร้างครั้งเรียนสำเร็จ',
    fillRequiredFields: 'กรุณากรอกข้อมูลให้ครบถ้วน',
    errorCreatingSchedule: 'เกิดข้อผิดพลาดในการสร้างตารางเรียน',
    errorUpdatingSchedule: 'เกิดข้อผิดพลาดในการแก้ไขตารางเรียน',
    errorCreatingSession: 'เกิดข้อผิดพลาดในการสร้างครั้งเรียน',

    // New session creation functionality
    createSessionMode: 'โหมดการสร้างเซสชัน',
    singleSession: 'เซสชันเดียว',
    createOneSession: 'สร้างเซสชันเดียว',
    multipleSession: 'หลายเซสชัน',
    createMultipleSessions: 'สร้างหลายเซสชัน',
    bulkCreate: 'สร้างจำนวนมาก',
    createBulkSessions: 'สร้างเซสชันจำนวนมาก',
    singleSessionDetails: 'รายละเอียดเซสชันเดียว',
    multipleSessionDetails: 'รายละเอียดหลายเซสชัน',
    bulkCreateDetails: 'รายละเอียดการสร้างจำนวนมาก',
    numberOfSessions: 'จำนวนเซสชัน',
    multipleSessionWarning: 'คำเตือนการสร้างหลายเซสชัน',
    willCreateSessions: 'จะสร้างเซสชันทั้งหมด {count} เซสชัน',
    repeatsEvery: 'ทำซ้ำทุก',
    checkForConflicts: 'กรุณาตรวจสอบตารางที่ขัดแย้งกัน',
    bulkCreateComingSoon: 'การสร้างจำนวนมากจะมาเร็วๆ นี้',
    bulkCreateDescription: 'ฟีเจอร์นี้จะช่วยให้คุณสร้างตารางเรียนจำนวนมากได้อย่างง่ayดาย',
    selectSchedule: 'เลือกตาราง',
    sessionNotes: 'หมายเหตุเซสชัน',
    createSessions: 'สร้างเซสชัน',

    // Profile
    personalInfo: 'ข้อมูลส่วนตัว',
    name: 'ชื่อ',
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

    //Teachers
    teachingReport: 'รายงานการสอน',

    // Placeholders
    pleaseEnterName: 'กรุณากรอกชื่อ',
    pleaseEnterLastName: 'กรุณากรอกนามสกุล',
    pleaseEnterAddress: 'กรุณากรอกที่อยู่',
    
    // CTA Section - Additional
    readyToTransform: 'พร้อมเปลี่ยนชีวิต',
    withEnglish: 'ด้วยภาษาอังกฤษ',
    question: 'แล้วหรือยัง?',
    joinSuccessfulStudents: 'เข้าร่วมกับนักเรียนกว่า',
    followersCount: '24,000+ คน',
    studentsSuccess: 'ที่ประสบความสำเร็จกับเรา',
    onlineOrBranch: 'เรียนออนไลน์หรือที่สาขาก็ได้ เลือกตามความสะดวกของคุณ',
    registerFree: 'ลงทะเบียนเรียนฟรี',
    consultFree: 'ปรึกษาฟรี',
    monthsResults: 'เดือนเห็นผล',
    reviewScore: 'คะแนนรีวิว',
    
    // Footer
    footerDescription: 'เราทำให้คุณพูดได้ - สถาบันสอนภาษาอังกฤษที่ดีที่สุดในโคราช พร้อมเปลี่ยนชีวิตคุณใน 3 เดือน',
    mainMenu: 'เมนูหลัก',
    koratBranch: 'สาขาโคราช',
    koratLocation: 'นครราชสีมา (โคราช)',
    weekdayHours: 'จันทร์-ศุกร์ 9:00-20:00',
    weekendHours: 'เสาร์-อาทิต์ 9:00-18:00',
    allRightsReserved: 'สงวนลิขสิทธิ์.',
    developedBy: 'พัฒนาโดย English Korat Team',
    
    // Courses Page
    coursesPageTitle: 'คอร์สเรียนภาษาอังกฤษ',
    coursesPageSubtitle: 'เลือกคอร์สที่เหมาะกับคุณ เรียนกับเราแล้วพูดได้จริงใน 3 เดือน',
    askForAdvice: 'ขอคำแนะนำ',
    filterByLevel: 'กรองตามระดับ',
    filterByType: 'กรองตามประเภท',
    ourCourses: 'คอร์สของเรา',
    whyOurCourses: 'ทำไมต้องเลือกคอร์สของเรา',
    whyOurCoursesDesc: 'เราใส่ใจทุกรายละเอียด เพื่อให้คุณได้รับการเรียนรู้ที่ดีที่สุด',
    readyToStartLearning: 'พร้อมเริ่มเรียนแล้วหรือยัง?',
    readyToStartLearningDesc: 'เข้าร่วมกับเราวันนี้ และเริ่มต้นการเปลี่ยนแปลงชีวิตของคุณ',
    contactForInfo: 'ติดต่อสอบถาม',
    
    // About Page
    aboutPageTitle: 'เกี่ยวกับเรา',
    aboutPageSubtitle: 'English Korat - สถาบันสอนภาษาอังกฤษที่ทำให้คุณพูดได้จริง',
    contactUs: 'ติดต่อเรา',
    missionStatement: 'เราตั้งใจจะทำให้ทุกคนพูดภาษาอังกฤษได้อย่างมั่นใจ ใน 3 เดือน',
    ourStory: 'เรื่องราวของเรา',
    storyParagraph1: 'English Korat เริ่มต้นขึ้นในปี 2019 ด้วยความตั้งใจที่จะแก้ไขปัญหาของคนไทยที่เรียนภาษาอังกฤษมานานแต่ยังพูดไม่ได้ เราเห็นว่าปัญหานี้เกิดจากวิธีการสอนที่เน้นไวยากรณ์มากเกินไป แต่ขาดการฝึกฝนการสนทนาจริง',
    storyParagraph2: 'ด้วยประสบการณ์ในการสอนมากกว่า 10 ปี เราได้พัฒนาวิธีการสอนที่เน้นการใช้งานจริง ทำให้นักเรียนสามารถพูดได้อย่างมั่นใจในเวลาเพียง 3 เดือน วิธีการนี้ได้รับการพิสูจน์แล้วจากนักเรียนกว่า 1,000 คนที่ประสบความสำเร็จ',
    storyParagraph3: 'วันนี้ English Korat ได้กลายเป็นสถาบันชั้นนำในจังหวัดนครราชสีมา ด้วยผู้ติดตามมากกว่า 24,000 คน เราภูมิใจที่ได้เป็นส่วนหนึ่งในการเปลี่ยนแปลงชีวิตของผู้คน ทำให้พวกเขามีโอกาสที่ดีขึ้นในการทำงานและชีวิต',
    ourValues: 'ค่านิยมของเรา',
    valuesDescription: 'ค่านิยมที่ขับเคลื่อนเราในการสร้างการเรียนรู้ที่มีคุณภาพ',
    qualityEducation: 'การศึกษาคุณภาพ',
    qualityEducationDesc: 'เราใส่ใจในทุกรายละเอียดของการสอน เพื่อให้นักเรียนได้รับความรู้ที่มีคุณภาพสูงสุด',
    innovation: 'นวัตกรรม',
    innovationDesc: 'เราพัฒนาวิธีการสอนใหม่ ๆ อยู่เสมอ เพื่อให้การเรียนรู้เป็นเรื่องที่สนุกและมีประสิทธิภาพ',
    studentCare: 'ใส่ใจนักเรียน',
    studentCareDesc: 'เราให้ความสำคัญกับทุกคน ดูแลและสนับสนุนให้นักเรียนทุกคนประสบความสำเร็จ',
    results: 'ผลลัพธ์',
    resultsDesc: 'เราให้ความสำคัญกับผลลัพธ์ที่เกิดขึ้นจริง มุ่งมั่นที่จะทำให้นักเรียนพูดได้จริงใน 3 เดือน',
    community: 'ชุมชน',
    communityDesc: 'เราสร้างชุมชนการเรียนรู้ที่อบอุ่น ทุกคนช่วยเหลือและสนับสนุนซึ่งกันและกัน',
    excellence: 'ความเป็นเลิศ',
    excellenceDesc: 'เราไม่หยุดที่จะพัฒนาและปรับปรุง เพื่อให้บริการที่เป็นเลิศแก่นักเรียนทุกคน',
    meetOurTeam: 'ทีมงานของเรา',
    teamDescription: 'ทีมงานมืออาชีพที่มีประสบการณ์และทุ่มเทเพื่อความสำเร็จของนักเรียน',
    ourAchievements: 'ความสำเร็จของเรา',
    achievementsDescription: 'ผลงานที่เราภูมิใจและเป็นแรงผลักดันให้เราก้าวต่อไป',
    readyToJoin: 'พร้อมเข้าร่วมกับเรา?',
    readyToJoinDescription: 'เริ่มต้นเปลี่ยนแปลงชีวิตของคุณวันนี้ เรียนกับเราและพูดภาษาอังกฤษได้ใน 3 เดือน',
    startToday: 'เริ่มต้นวันนี้',
    
    // Contact Page
    contactPageTitle: 'ติดต่อเรา',
    contactPageSubtitle: 'พร้อมให้คำปรึกษาและตอบทุกคำถามของคุณ ติดต่อเราได้ทุกช่องทาง',
    registerNow: 'ลงทะเบียนทันที',
    callNow: 'โทรเลย',
    contactMethods: 'ช่องทางการติดต่อ',
    contactMethodsDesc: 'เลือกช่องทางที่สะดวกสำหรับคุณ เราพร้อมให้บริการทุกวัน',
    phoneDesc: 'โทรสอบถามข้อมูลได้ทันที',
    lineDesc: 'แชทสอบถามผ่าน LINE',
    emailDesc: 'ส่งอีเมลสอบถามรายละเอียด',
    facebookDesc: 'ติดตามข่าวสารและสอบถาม',
    sendMessageDesc: 'ส่งข้อความให้เรา เราจะติดต่อกลับโดยเร็วที่สุด',
    fullName: 'ชื่อ-นามสกุล',
    phoneNumber: 'เบอร์โทรศัพท์',
    emailAddress: 'อีเมล',
    subject: 'หัวข้อสอบถาม',
    pleaseSelectSubject: 'กรุณาเลือกหัวข้อ',
    courseInquiry: 'สอบถามคอร์สเรียน',
    scheduleInquiry: 'สอบถามตารางเรียน',
    pricingInquiry: 'สอบถามราคา',
    generalInquiry: 'สอบถามทั่วไป',
    messagePlaceholder: 'กรุณาระบุข้อความที่ต้องการสอบถาม...',
    location: 'ที่ตั้ง',
    openingHours: 'เวลาทำการ',
    quickContact: 'ติดต่อด่วน',
    findUs: 'หาเรา',
    findUsDesc: 'ดูตำแหน่งที่ตั้งของเราใน Google Maps',
    openMap: 'เปิดแผนที่',
    frequentlyAsked: 'คำถามที่พบบ่อย',
    faqDesc: 'คำตอบสำหรับคำถามที่นักเรียนถามบ่อย ๆ',
    readyToTalk: 'พร้อมพูดคุยกับเรา?',
    readyToTalkDesc: 'ติดต่อเราเพื่อเริ่มต้นเปลี่ยนแปลงชีวิตของคุณไปกับภาষาอังกฤษ',
    
    // Privacy Policy Page
    privacyPolicyTitle: 'นโยบายความเป็นส่วนตัว',
    privacyPolicyDescription: 'เราให้ความสำคัญกับความเป็นส่วนตัวและการปกป้องข้อมูลส่วนบุคคลของคุณ',
    
    // Terms of Service Page
    termsOfServiceTitle: 'ข้อกำหนดการใช้งาน',
    termsOfServiceDescription: 'ข้อกำหนดและเงื่อนไขการใช้บริการของ English Korat',
  },

  en: {
    // New properties
    newStudent: 'New Student',
    systemUpdate: 'System Update',
    systemUpdateDesc: 'There is a recent system update',
    notifications: 'Notifications',
    newStudentDesc: 'A new student has registered',
    language: 'Language',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',

    // Navigation
    dashboard: 'Dashboard',
    profile: 'Profile',
    studentRegistration: 'Student Registration',
    logout: 'Logout',
    systemSettings: 'System Settings',
    schedule: 'Schedule',
    home: 'Home',
    courses: 'Courses',
    about: 'About Us',
    contact: 'Contact',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    teacherPortal: 'Teacher Portal',
    studentPortal: 'Student Portal',
    studentSchedule: 'Student Schedule',
    analytics: 'Analytics',
    reports: 'Reports',
    studentManagement: 'Student Management',
    settings: 'Settings',
    studentList: 'Student List',
    
    // Groups Management
    groupManagement: 'Group Management',
    groups: 'Groups',
    studyGroups: 'Study Groups',
    manageStudyGroups: 'Manage Study Groups',
    viewGroupDetails: 'View Details',
    assignStudent: 'Assign Student',
    addStudentToGroup: 'Add Student to Group',
    removeStudentFromGroup: 'Remove Student from Group',
    groupDetails: 'Group Details',
    groupMembers: 'Group Members',
    membersList: 'Members List',
    noGroupsFound: 'No groups found',
    noMembersInGroup: 'No members in this group yet',
    groupName: 'Group Name',
    groupCourse: 'Course',
    groupLevel: 'Level',
    groupStatus: 'Status',
    groupPaymentStatus: 'Payment Status',
    groupStudents: 'Students',
    groupAvailable: 'Available',
    groupSlots: 'Slots',
    slotsAvailable: 'slots available',
    groupFull: 'Full',
    groupEmpty: 'Empty',
    groupActive: 'Active',
    groupInactive: 'Inactive',
    groupSuspended: 'Suspended',
    groupNeedMore: 'Need More',
    paymentPending: 'Pending',
    paymentDepositPaid: 'Deposit Paid',
    paymentFullyPaid: 'Fully Paid',
    groupMaxStudents: 'Max Students',
    groupCurrentStudents: 'Current Students',
    groupDescription: 'Description',
    noGroupDescription: 'No description',
    groupCreated: 'Created',
    groupLastUpdated: 'Last updated',
    memberJoined: 'Joined',
    memberPayment: 'Payment',
    groupCategory: 'Category',
    allGroupCourses: 'All Courses',
    allGroupStatus: 'All Status',
    allGroupPaymentStatus: 'All Payment Status',
    groupPerPage: 'Per Page',
    showGroupPerPage: 'Show Per Page',
    groupFilters: 'Filters',
    groupQuickFilters: 'Quick Filters',
    clearGroupFilters: 'Clear Filters',
    clearAllFilters: 'Clear All',
    refreshGroups: 'Refresh',
    loadingGroups: 'Loading...',
    tryAgainGroups: 'Try Again',
    previousPage: 'Previous',
    nextPage: 'Next',
    pageNum: 'Page',
    pageOf: 'of',
    assignStudentToGroup: 'Assign Student to Group',
    selectedGroupStudent: 'Selected Student',
    selectGroupStudent: 'Select Student',
    searchGroupStudents: 'Search Students',
    groupNameSurnameOrEmail: 'Name, surname, or email...',
    noGroupStudentsFound: 'No students found',
    noGroupStudentsAvailable: 'No students available',
    assigningStudent: 'Assigning...',
    studentAssignmentSuccess: 'Student assigned successfully',
    studentAssignmentFailed: 'Failed to assign student',
    removeMemberConfirm: 'Are you sure you want to remove this member?',
    removeMemberError: 'Error removing member',
    updateMemberPaymentError: 'Error updating payment status',
    loadGroupMembersError: 'Failed to load members',
    loadGroupStudentsError: 'Failed to load students',
    groupIsFullError: 'Group is Full',
    groupFullMessage: 'Cannot assign new students as the group has reached maximum capacity.',
    changeStudent: 'Change',
    editGroup: 'Edit',
    removeGroupMember: 'Remove',
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
    englishKorat: 'English Korat Language School Management System',
    menu: 'Menu',
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    register: 'Register',
    readMore: 'Read More',
    backToHome: 'Back to Home',
    getStarted: 'Get Started',
    learnMore: 'Learn More',
    viewCourses: 'View Courses',

    // Homepage
    heroTitle: 'English Korat',
    heroSubtitle: 'We Make You Speak',
    heroDescription: 'The best place to learn for those who are #weak in English. Transform your life after studying in just 3 months ‼️',
    startLearning: 'Start Learning Today',
    whyChooseUs: 'Why Choose English Korat?',
    whyChooseDesc: 'We have unique teaching methods that will help you speak English confidently',
    changeLifeIn3Months: 'Transform Your Life in 3 Months',
    changeLifeDesc: 'Proven teaching methods that can help you speak English in a short time',
    perfectForBeginners: 'Perfect for Beginners',
    perfectForBeginnersDesc: 'We understand Thai people\'s English learning challenges and have targeted solutions',
    guaranteedResults: 'Guaranteed Results',
    guaranteedResultsDesc: 'Over 24,000+ students have succeeded with us',
    readyToChange: 'Ready to Transform Your Life with English?',
    readyToChangeDesc: 'Join over 24,000+ students who have succeeded with us. Learn online or at our branch - choose what\'s convenient for you',
    joinUs: 'Join Us',
    freeRegistration: '🚀 Free Registration',
    freeConsultation: '📞 Free Consultation',
    monthsResult: 'Months to See Results',
    followers: 'Followers',
    successfulStudents: 'Successful Students',
    rating: 'Review Rating',

    // Courses Page
    coursesTitle: 'English Language Courses',
    coursesDescription: 'Choose the course that fits your level and needs with our unique teaching methods',
    courseFeatures: 'Course Features',
    basicCourse: 'Basic Course',
    basicCourseDesc: 'Perfect for English beginners, focusing on basic communication skills',
    intermediateCourse: 'Intermediate Course',
    intermediateCourseDesc: 'For those with basic knowledge who want to advance their skills',
    advancedCourse: 'Advanced Course',
    advancedCourseDesc: 'Focus on high-level language use for work and complex communication',
    businessCourse: 'Business Course',
    businessCourseDesc: 'English for work, negotiation, and presentations',
    courseBenefits: 'Course Benefits',
    flexibleSchedule: 'Flexible Schedule',
    smallClasses: 'Small Classes',
    practicalFocus: 'Practical Focus',
    progressTracking: 'Progress Tracking',

    // About Page
    aboutTitle: 'About Us',
    aboutDescription: 'English Korat is an English language institute dedicated to developing English education for Thai people',
    ourMission: 'Our Mission',
    ourMissionDesc: 'We want every Thai person to be able to speak English confidently with teaching methods that understand Thai people\'s problems',
    ourVision: 'Our Vision',
    ourVisionDesc: 'To be the number one English language institute in Northeast Thailand that delivers real, visible results',
    ourTeam: 'Our Team',
    ourTeamDesc: 'Experienced teachers with passion for teaching, ready to provide guidance at every step of learning',
    ourMethod: 'Our Teaching Method',
    ourMethodDesc: 'We use teaching methods that focus on practice and real-world application, not memorization, but understanding and practical application',
    whyTrustUs: 'Why Trust Us',
    experiencedTeachers: 'Experienced Teachers',
    experiencedTeachersDesc: 'Teaching team with over 10 years of experience who understand Thai people\'s challenges',
    provenMethod: 'Proven Method',
    provenMethodDesc: 'Recognized teaching results with over 24,000+ students',
    comprehensiveSupport: 'Comprehensive Support',
    comprehensiveSupportDesc: 'Monitor learning progress and provide guidance throughout the learning period',

    // Contact Page
    contactTitle: 'Contact Us',
    contactDescription: 'Ready to provide consultation and answer questions about English learning',
    getInTouch: 'Get in Touch',
    address: 'Address',
    phone: 'Phone',
    email: 'Email',
    businessHours: 'Business Hours',
    mondayFriday: 'Monday-Friday 9:00-20:00',
    saturdaySunday: 'Saturday-Sunday 9:00-18:00',
    followUs: 'Follow Us',
    contactForm: 'Contact Form',
    yourName: 'Your Name',
    yourEmail: 'Your Email',
    yourMessage: 'Your Message',
    sendMessage: 'Send Message',

    // Privacy Policy Page
    privacyTitle: 'Privacy Policy',
    privacyDescription: 'We value the privacy of your information',
    informationCollection: 'Information Collection',
    informationCollectionDesc: 'We only collect information necessary for providing educational services',
    informationUse: 'Information Use',
    informationUseDesc: 'Your information will be used for educational management and communication',
    informationProtection: 'Information Protection',
    informationProtectionDesc: 'We have high-level data security measures',
    cookiePolicy: 'Cookie Policy',
    cookiePolicyDesc: 'We use cookies to improve website user experience',
    thirdPartyServices: 'Third Party Services',
    thirdPartyServicesDesc: 'We may use third-party services in providing some services',
    userRights: 'User Rights',
    userRightsDesc: 'You have the right to access, modify, and delete your personal information',
    policyUpdates: 'Policy Updates',
    policyUpdatesDesc: 'This policy may be updated as appropriate',

    // Terms of Service Page
    termsTitle: 'Terms of Service',
    termsDescription: 'Terms and conditions for using our services',
    serviceTerms: 'Service Terms',
    serviceTermsDesc: 'Using our services means you accept these terms',
    userResponsibilities: 'User Responsibilities',
    userResponsibilitiesDesc: 'Users must use services properly and not violate others\' rights',
    paymentTerms: 'Payment Terms',
    paymentTermsDesc: 'Tuition payments must be made according to specified terms',
    cancellationPolicy: 'Cancellation Policy',
    cancellationPolicyDesc: 'Course cancellations must be notified in advance according to specified terms',
    intellectualProperty: 'Intellectual Property',
    intellectualPropertyDesc: 'Teaching content and learning materials are copyrighted by the institute',
    limitationLiability: 'Limitation of Liability',
    limitationLiabilityDesc: 'The institute limits liability according to legal framework',
    termination: 'Service Termination',
    terminationDesc: 'The institute reserves the right to terminate services in case of terms violation',

    // Dashboard
    welcomeMessage: 'Welcome!',
    welcomeSubMessage: 'You have successfully logged in. Start your English learning journey with us',
    quickActions: 'Quick Actions',
    recentActivity: 'Recent Activity',
    loginSuccess: 'Login Successful',
    loginSuccessTime: 'Just now',

    //Schedule
    SelectTeachers: 'Select Teachers',
    scheduleManagement: 'Schedule Management',
    viewMode: 'View Mode',
    dayView: 'Day',
    weekView: 'Week',
    monthView: 'Month',
    currentTime: 'Current Time',
    selectAllTeachers: 'Select All',
    clearSelection: 'Clear',
    noScheduleData: 'No schedule data available',
    scheduleDetails: 'Schedule Details',
    scheduleInformation: 'Schedule Information',
    courseInformation: 'Course Information',
    time: 'Time',
    classroom: 'Classroom',
    totalHours: 'Total Hours',
    hoursPerSession: 'Hours/Session',
    startDate: 'Start Date',
    type: 'Type',
    people: 'People',
    scheduleSummary: 'Schedule Summary',
    totalSessions: 'Total Sessions',
    scheduledSessions: 'Scheduled',
    completedSessions: 'Completed',
    createNewSchedule: 'Create New Schedule',
    preliminaryInfo: 'Preliminary Information',
    teacher: 'Teacher',
    date: 'Date',
    underDevelopment: 'Under Development',
    featureComingSoon: 'Schedule creation feature coming soon',
    createScheduleMock: 'Create Schedule (Mock)',
    scheduled: 'Scheduled',
    completed: 'Completed',
    cancelled: 'Cancelled',
    active: 'Active',
    inactive: 'Inactive',
    failedToLoadDetails: 'Failed to load details',
    retryLoading: 'Retry',
    sessionDetails: 'Session Details',
    age: 'Age',
    years: 'Years',
    nickname: 'Nickname',
    branch: 'Branch',
    room: 'Room',
    course: 'Course',
    capacity: 'Capacity',
    available: 'Available',
    enrolled: 'Enrolled',
    students: 'Students',
    notes: 'Notes',
    status: 'Status',
    editSchedule: 'Edit Schedule',
    createSession: 'Create Session',
    scheduleForm: 'Schedule Form',
    courseName: 'Course Name',
    selectCourse: 'Select Course',
    selectTeacher: 'Select Teacher',
    selectRoom: 'Select Room',
    scheduleName: 'Schedule Name',
    timeSlots: 'Time Slots',
    addTimeSlot: 'Add Time Slot',
    removeTimeSlot: 'Remove Time Slot',
    dayOfWeek: 'Day of Week',
    startTime: 'Start Time',
    endTime: 'End Time',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
    autoRescheduleHolidays: 'Auto Reschedule Holidays',
    maxStudents: 'Max Students',
    sessionForm: 'Session Form',
    sessionDate: 'Session Date',
    repeatSession: 'Repeat Session',
    repeatFrequency: 'Repeat Frequency',
    repeatInterval: 'Repeat Interval',
    repeatEnd: 'Repeat End',
    repeatCount: 'Repeat Count',
    repeatUntilDate: 'Repeat Until Date',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    never: 'Never',
    after: 'After',
    on: 'On',
    makeupSession: 'Makeup Session',
    appointmentNotes: 'Appointment Notes',
    createScheduleSuccess: 'Schedule created successfully',
    updateScheduleSuccess: 'Schedule updated successfully',
    createSessionSuccess: 'Session created successfully',
    fillRequiredFields: 'Please fill in all required fields',
    errorCreatingSchedule: 'Error creating schedule',
    errorUpdatingSchedule: 'Error updating schedule',
    errorCreatingSession: 'Error creating session',
    
    // New session creation functionality
    createSessionMode: 'Session Creation Mode',
    singleSession: 'Single Session',
    createOneSession: 'Create one session',
    multipleSession: 'Multiple Sessions',
    createMultipleSessions: 'Create multiple sessions',
    bulkCreate: 'Bulk Create',
    createBulkSessions: 'Create sessions in bulk',
    singleSessionDetails: 'Single Session Details',
    multipleSessionDetails: 'Multiple Sessions Details',
    bulkCreateDetails: 'Bulk Creation Details',
    numberOfSessions: 'Number of Sessions',
    multipleSessionWarning: 'Multiple Session Warning',
    willCreateSessions: 'Will create {count} sessions',
    repeatsEvery: 'Repeats every',
    checkForConflicts: 'Please check for schedule conflicts',
    bulkCreateComingSoon: 'Bulk creation coming soon',
    bulkCreateDescription: 'This feature will help you create multiple schedules easily',
    selectSchedule: 'Select Schedule',
    sessionNotes: 'Session Notes',
    createSessions: 'Create Sessions',

    // Profile
    personalInfo: 'Personal Information',
    name: 'Name',
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

    //Teachers
    teachingReport: 'Teaching Report',

    // Placeholders
    pleaseEnterName: 'Please enter name',
    pleaseEnterLastName: 'Please enter last name',
    pleaseEnterAddress: 'Please enter address',
    
    // CTA Section - Additional
    readyToTransform: 'Ready to Transform Your Life',
    withEnglish: 'with English',
    question: '?',
    joinSuccessfulStudents: 'Join more than',
    followersCount: '24,000+ students',
    studentsSuccess: 'who succeeded with us',
    onlineOrBranch: 'Study online or at our branch, choose what\'s convenient for you',
    registerFree: 'Register for Free',
    consultFree: 'Free Consultation',
    monthsResults: 'Months to Results',
    reviewScore: 'Review Score',
    
    // Footer
    footerDescription: 'We make you speak - The best English institute in Korat, ready to transform your life in 3 months',
    mainMenu: 'Main Menu',
    koratBranch: 'Korat Branch',
    koratLocation: 'Nakhon Ratchasima (Korat)',
    weekdayHours: 'Mon-Fri 9:00-20:00',
    weekendHours: 'Sat-Sun 9:00-18:00',
    allRightsReserved: 'All rights reserved.',
    developedBy: 'Developed by English Korat Team',
    
    // Courses Page
    coursesPageTitle: 'English Courses',
    coursesPageSubtitle: 'Choose the course that\'s right for you. Learn with us and speak fluently in 3 months',
    askForAdvice: 'Ask for Advice',
    filterByLevel: 'Filter by Level',
    filterByType: 'Filter by Type',
    ourCourses: 'Our Courses',
    whyOurCourses: 'Why Choose Our Courses',
    whyOurCoursesDesc: 'We pay attention to every detail to give you the best learning experience',
    readyToStartLearning: 'Ready to Start Learning?',
    readyToStartLearningDesc: 'Join us today and start transforming your life',
    contactForInfo: 'Contact for Info',
    
    // About Page
    aboutPageTitle: 'About Us',
    aboutPageSubtitle: 'English Korat - The institute that makes you really speak English',
    contactUs: 'Contact Us',
    missionStatement: 'We are committed to making everyone speak English confidently in 3 months',
    ourStory: 'Our Story',
    storyParagraph1: 'English Korat began in 2019 with the intention to solve the problem of Thai people who have studied English for a long time but still can\'t speak. We saw that this problem arose from teaching methods that focused too much on grammar but lacked real conversation practice.',
    storyParagraph2: 'With more than 10 years of teaching experience, we have developed a practical teaching method that enables students to speak confidently in just 3 months. This method has been proven by more than 1,000 students who have succeeded.',
    storyParagraph3: 'Today, English Korat has become a leading institute in Nakhon Ratchasima province with more than 24,000 followers. We are proud to be part of transforming people\'s lives, giving them better opportunities in work and life.',
    ourValues: 'Our Values',
    valuesDescription: 'The values that drive us to create quality learning',
    qualityEducation: 'Quality Education',
    qualityEducationDesc: 'We care about every detail of teaching to provide students with the highest quality knowledge',
    innovation: 'Innovation',
    innovationDesc: 'We constantly develop new teaching methods to make learning fun and effective',
    studentCare: 'Student Care',
    studentCareDesc: 'We value everyone, care for and support every student to succeed',
    results: 'Results',
    resultsDesc: 'We focus on real results, committed to making students speak fluently in 3 months',
    community: 'Community',
    communityDesc: 'We create a warm learning community where everyone helps and supports each other',
    excellence: 'Excellence',
    excellenceDesc: 'We never stop developing and improving to provide excellent service to all students',
    meetOurTeam: 'Meet Our Team',
    teamDescription: 'Professional team with experience and dedication to student success',
    ourAchievements: 'Our Achievements',
    achievementsDescription: 'The achievements we are proud of and that drive us forward',
    readyToJoin: 'Ready to Join Us?',
    readyToJoinDescription: 'Start transforming your life today. Learn with us and speak English in 3 months',
    startToday: 'Start Today',
    
    // Contact Page
    contactPageTitle: 'Contact Us',
    contactPageSubtitle: 'Ready to provide consultation and answer all your questions. Contact us through any channel',
    registerNow: 'Register Now',
    callNow: 'Call Now',
    contactMethods: 'Contact Methods',
    contactMethodsDesc: 'Choose the channel that\'s convenient for you. We\'re available every day',
    phoneDesc: 'Call for immediate information',
    lineDesc: 'Chat via LINE',
    emailDesc: 'Send email for detailed inquiries',
    facebookDesc: 'Follow news and inquire',
    sendMessageDesc: 'Send us a message and we\'ll get back to you as soon as possible',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    emailAddress: 'Email Address',
    subject: 'Subject',
    pleaseSelectSubject: 'Please select a subject',
    courseInquiry: 'Course Inquiry',
    scheduleInquiry: 'Schedule Inquiry',
    pricingInquiry: 'Pricing Inquiry',
    generalInquiry: 'General Inquiry',
    messagePlaceholder: 'Please specify your inquiry...',
    location: 'Location',
    openingHours: 'Opening Hours',
    quickContact: 'Quick Contact',
    findUs: 'Find Us',
    findUsDesc: 'View our location on Google Maps',
    openMap: 'Open Map',
    frequentlyAsked: 'Frequently Asked Questions',
    faqDesc: 'Answers to questions students ask frequently',
    readyToTalk: 'Ready to Talk to Us?',
    readyToTalkDesc: 'Contact us to start transforming your life with English',
    
    // Privacy Policy Page
    privacyPolicyTitle: 'Privacy Policy',
    privacyPolicyDescription: 'We value your privacy and protecting your personal information',
    
    // Terms of Service Page
    termsOfServiceTitle: 'Terms of Service',
    termsOfServiceDescription: 'Terms and conditions for using English Korat services',
  }
}
