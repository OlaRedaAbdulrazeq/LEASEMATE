import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: number;
}

export default function Logo({ size =30 }: { size?: number }) {
  return (
    <Link href="/" className="inline-block cursor-pointer">
      <div
        className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3h6v6H3V3zm6 6h6v6H9V9zm6 6h6v6h-6v-6z" fill="currentColor"/>
        </svg>
      </div>
      <span className="text-2xl font-bold text-orange-600 tracking-tight">LeaseMate</span>
    </Link>
  );
} 