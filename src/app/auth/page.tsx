import AuthForm from '../../components/forms/AuthForm';

export default function AuthPage() {
  return (
    <div className="auth-page">
      <AuthForm />
    </div>
  );
}

// Metadata สำหรับ SEO
export const metadata = {
  title: 'เข้าสู่ระบบ / สมัครสมาชิก - English Korat',
  description: 'เข้าสู่ระบบหรือสมัครสมาชิกใหม่กับ English Korat',
};
