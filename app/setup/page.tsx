"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

export default function SetupPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [setupStep, setSetupStep] = useState(1)
  const [activeTab, setActiveTab] = useState("database")

  const sqlScript = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create queues table
CREATE TABLE IF NOT EXISTS queues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  current_number INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create queue_entries table
CREATE TABLE IF NOT EXISTS queue_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  queue_id UUID REFERENCES queues ON DELETE CASCADE,
  user_id UUID REFERENCES profiles ON DELETE CASCADE,
  queue_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'serving', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user if not exists
INSERT INTO profiles (id, email, full_name, role)
SELECT uuid_generate_v4(), 'admin@example.com', 'Admin User', 'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE email = 'admin@example.com'
);

-- Insert sample queues if not exists
INSERT INTO queues (name, description, current_number, status)
SELECT 'Customer Service', 'General customer service inquiries', 10, 'active'
WHERE NOT EXISTS (
  SELECT 1 FROM queues WHERE name = 'Customer Service'
);

INSERT INTO queues (name, description, current_number, status)
SELECT 'Technical Support', 'Technical issues and troubleshooting', 5, 'active'
WHERE NOT EXISTS (
  SELECT 1 FROM queues WHERE name = 'Technical Support'
);

INSERT INTO queues (name, description, current_number, status)
SELECT 'Billing', 'Billing inquiries and payment issues', 8, 'paused'
WHERE NOT EXISTS (
  SELECT 1 FROM queues WHERE name = 'Billing'
);

-- Insert sample announcements if not exists
INSERT INTO announcements (title, content)
SELECT 'System Maintenance', 'The system will be undergoing maintenance on Saturday from 2 AM to 4 AM.'
WHERE NOT EXISTS (
  SELECT 1 FROM announcements WHERE title = 'System Maintenance'
);

INSERT INTO announcements (title, content)
SELECT 'New Queue Feature', 'We have added a new feature to allow you to receive SMS notifications when your queue number is called.'
WHERE NOT EXISTS (
  SELECT 1 FROM announcements WHERE title = 'New Queue Feature'
);
  `

  const runSetup = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Run the SQL script
      const { error } = await supabase.rpc("exec_sql", { sql: sqlScript })

      if (error) {
        throw error
      }

      setSuccess(true)
      setSetupStep(2)
    } catch (err: any) {
      console.error("Setup error:", err)
      setError(err.message || "Failed to run setup script. Please try again or run it manually.")

      if (err.message.includes("function") && err.message.includes("does not exist")) {
        setError("The 'exec_sql' function does not exist. Please follow the manual setup instructions.")
        setSetupStep(3)
      }
    } finally {
      setLoading(false)
    }
  }

  const testEmailConfig = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Test email by sending a test email to yourself
      const { error } = await supabase.auth.signInWithOtp({
        email: "test@example.com",
      })

      if (error) {
        if (error.message.includes("invalid")) {
          setError("Email validation failed. This is likely due to Supabase's email restrictions in development mode.")
        } else {
          throw error
        }
      } else {
        setSuccess(true)
        setError(null)
      }
    } catch (err: any) {
      console.error("Email test error:", err)
      setError(err.message || "Failed to test email configuration.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-3xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Queue Management System Setup</CardTitle>
          <CardDescription>Set up your database tables and initial data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>Setup completed successfully!</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="database">Database Setup</TabsTrigger>
              <TabsTrigger value="auth">Auth Configuration</TabsTrigger>
            </TabsList>
            <TabsContent value="database">
              {setupStep === 1 && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Automatic Setup</h3>
                    <p>
                      Click the button below to automatically set up your database tables and sample data. This requires
                      the 'exec_sql' function to be enabled in your Supabase project.
                    </p>
                    <Button onClick={runSetup} disabled={loading}>
                      {loading ? "Setting up..." : "Run Setup"}
                    </Button>
                  </div>

                  <div className="my-6 border-t pt-6">
                    <h3 className="text-lg font-medium">Manual Setup</h3>
                    <p className="mb-4">
                      If the automatic setup doesn't work, you can manually run the SQL script in your Supabase SQL
                      Editor:
                    </p>
                    <div className="relative">
                      <pre className="max-h-60 overflow-auto rounded-md bg-gray-900 p-4 text-sm text-white">
                        {sqlScript}
                      </pre>
                      <Button
                        className="absolute right-2 top-2 bg-transparent"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(sqlScript)
                          toast({ title: "✓ Berhasil", description: "SQL script disalin ke clipboard" })
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {setupStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Setup Complete!</h3>
                  <p>Your database has been set up successfully. You can now use the Queue Management System.</p>
                  <p>
                    <strong>Default Admin User:</strong>
                    <br />
                    Email: admin@example.com
                    <br />
                    Note: You'll need to set up a password for this user through Supabase Authentication.
                  </p>
                </div>
              )}

              {setupStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Manual Setup Required</h3>
                  <p>
                    The automatic setup couldn't run because the 'exec_sql' function is not available. Please follow
                    these steps:
                  </p>
                  <ol className="list-decimal space-y-2 pl-5">
                    <li>Go to your Supabase dashboard</li>
                    <li>Navigate to the SQL Editor</li>
                    <li>Create a new query</li>
                    <li>Copy and paste the SQL script above</li>
                    <li>Run the script</li>
                  </ol>
                  <p>
                    After running the script, you'll have the necessary tables and sample data to use the Queue
                    Management System.
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="auth">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Configuration</h3>
                <p>
                  Supabase Auth has restrictions on which email domains can be used in development mode. If you're
                  experiencing issues with email validation, here are some options:
                </p>
                <ol className="list-decimal space-y-2 pl-5">
                  <li>
                    <strong>Use an allowed email domain</strong>: In development, Supabase allows emails from certain
                    domains like example.com, test.com, etc.
                  </li>
                  <li>
                    <strong>Configure SMTP in Supabase</strong>: Go to your Supabase dashboard → Authentication →
                    Providers → Email and set up SMTP with a service like SendGrid, Mailgun, etc.
                  </li>
                  <li>
                    <strong>Disable email confirmation</strong>: For testing only, you can disable email confirmation in
                    Supabase dashboard → Authentication → Providers → Email.
                  </li>
                </ol>
                <div className="mt-4">
                  <Button onClick={testEmailConfig} disabled={loading}>
                    {loading ? "Testing..." : "Test Email Configuration"}
                  </Button>
                </div>
                <div className="mt-6 rounded-md bg-yellow-50 p-4 text-yellow-800">
                  <h4 className="font-medium">Important Note</h4>
                  <p>
                    If you're seeing "Email address is invalid" errors during registration, it's likely due to
                    Supabase's email restrictions in development mode. Try using an email with domain example.com or
                    configure SMTP as described above.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          {(setupStep === 2 || setupStep === 3 || activeTab === "auth") && (
            <div className="flex space-x-4">
              <Link href="/login">
                <Button>Go to Login</Button>
              </Link>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
