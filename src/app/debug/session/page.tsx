"use client";

import { useSession } from "next-auth/react";
import { api } from "@/lib/trpc";
import { useEffect, useState } from "react";

export default function SessionDebugPage() {
  const { data: session, status } = useSession();
  const [dbUser, setDbUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkDatabase() {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/debug/check-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: session.user.email }),
          });
          const data = await response.json();
          setDbUser(data.user);
        } catch (err) {
          setError('Failed to fetch database user');
        }
      }
    }
    
    checkDatabase();
  }, [session]);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Session Debug Information</h1>
      
      <div className="space-y-6">
        {/* Session Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Session Status</h2>
          <div className="bg-gray-100 p-4 rounded">
            <code className="text-sm">{status}</code>
          </div>
        </div>

        {/* Current Session */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Current Session</h2>
          <div className="bg-gray-100 p-4 rounded overflow-auto">
            <pre className="text-sm">{JSON.stringify(session, null, 2)}</pre>
          </div>
        </div>

        {/* JWT Token Info */}
        {session && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Session User Details</h2>
            <table className="w-full">
              <tbody>
                <tr className="border-b">
                  <td className="py-2 font-semibold">ID:</td>
                  <td className="py-2">{session.user?.id || 'Not set'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-semibold">Email:</td>
                  <td className="py-2">{session.user?.email || 'Not set'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-semibold">Name:</td>
                  <td className="py-2">{session.user?.name || 'Not set'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-semibold">Role:</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-white ${
                      session.user?.role === 'ADMIN' ? 'bg-purple-500' : 
                      session.user?.role === 'CLIENT' ? 'bg-green-500' : 'bg-gray-500'
                    }`}>
                      {session.user?.role || 'NOT SET'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Database User */}
        {dbUser && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Database User</h2>
            <div className="bg-gray-100 p-4 rounded overflow-auto">
              <pre className="text-sm">{JSON.stringify(dbUser, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Debug Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Actions</h2>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh Page
            </button>
            <button
              onClick={() => {
                document.cookie.split(";").forEach((c) => {
                  document.cookie = c
                    .replace(/^ +/, "")
                    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                });
                window.location.href = '/auth/signin';
              }}
              className="ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear Cookies & Re-login
            </button>
          </div>
        </div>

        {/* Troubleshooting Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting Checklist</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>✅ Database user exists with email: {session?.user?.email}</li>
            <li className={session?.user?.role === 'ADMIN' ? '✅' : '❌'}>
              Session has ADMIN role: {session?.user?.role || 'NOT SET'}
            </li>
            <li className={dbUser?.role === 'ADMIN' ? '✅' : '❌'}>
              Database user has ADMIN role: {dbUser?.role || 'NOT CHECKED'}
            </li>
            <li>Check if JWT callback in auth.ts is properly setting the role</li>
            <li>Check if session callback in auth.ts is properly passing the role</li>
            <li>Try clearing browser cookies and re-login</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
