// app/login/page.js
'use client';
import dynamic from 'next/dynamic';

const Login = dynamic(() => import('../auth/page'), { ssr: false });

export default function LoginPage() {
  return <Login />;
}