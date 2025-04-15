import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

export default async function SupabaseDiagnosticPage() {
  // Collect environment variables (without exposing values)
  const envVars = {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    POSTGRES_URL: !!process.env.POSTGRES_URL,
    POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
    POSTGRES_URL_NON_POOLING: !!process.env.POSTGRES_URL_NON_POOLING,
    POSTGRES_USER: !!process.env.POSTGRES_USER,
    POSTGRES_HOST: !!process.env.POSTGRES_HOST,
    POSTGRES_PASSWORD: !!process.env.POSTGRES_PASSWORD,
    POSTGRES_DATABASE: !!process.env.POSTGRES_DATABASE,
  };

  // Check for required variables
  const missingVars = [];
  if (!envVars.SUPABASE_URL && !envVars.NEXT_PUBLIC_SUPABASE_URL) {
    missingVars.push("SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL");
  }

  if (
    !envVars.SUPABASE_SERVICE_ROLE_KEY &&
    !envVars.SUPABASE_ANON_KEY &&
    !envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    missingVars.push(
      "SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  // Try to create a direct Postgres connection to test if the database is accessible
  let postgresStatus = "Unknown";
  const postgresError = null;

  if (envVars.POSTGRES_URL || envVars.POSTGRES_PRISMA_URL) {
    postgresStatus = "Available";
  } else {
    postgresStatus = "Not configured";
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Supabase Diagnostic Page</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert
              variant={missingVars.length === 0 ? "default" : "destructive"}
            >
              {missingVars.length === 0 ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Info className="h-4 w-4" />
              )}
              <AlertTitle>
                {missingVars.length === 0
                  ? "All Required Variables Set"
                  : "Missing Required Variables"}
              </AlertTitle>
              <AlertDescription>
                {missingVars.length === 0 ? (
                  "All required environment variables for Supabase are defined"
                ) : (
                  <div className="mt-2">
                    <p>The following required variables are missing:</p>
                    <ul className="list-disc pl-4 mt-2">
                      {missingVars.map((variable, i) => (
                        <li key={i}>{variable}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>

            <div className="mt-4">
              <h3 className="font-medium mb-2">Variable Status:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(envVars).map(([key, value]) => (
                  <div key={key} className="flex items-center">
                    <span
                      className={`inline-block w-3 h-3 rounded-full mr-2 ${
                        value ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <code className="text-xs">{key}</code>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Access</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert
              variant={
                postgresStatus === "Available"
                  ? "default"
                  : postgresStatus === "Not configured"
                  ? "destructive"
                  : "destructive"
              }
            >
              {postgresStatus === "Available" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>Postgres Connection: {postgresStatus}</AlertTitle>
              <AlertDescription>
                {postgresStatus === "Available"
                  ? "Postgres connection variables are available"
                  : postgresStatus === "Not configured"
                  ? "Direct Postgres connection is not configured"
                  : `Postgres connection error: ${postgresError}`}
              </AlertDescription>
            </Alert>

            <div className="mt-4">
              <h3 className="font-medium mb-2">Troubleshooting Steps:</h3>
              <ol className="list-decimal pl-4 space-y-2 text-sm">
                <li>
                  <strong>Check Supabase Project Settings:</strong> Verify your
                  Supabase project is active and the API credentials are
                  correct.
                </li>
                <li>
                  <strong>Verify Environment Variables:</strong> Ensure all
                  required environment variables are set correctly in your
                  Vercel project or .env file.
                </li>
                <li>
                  <strong>Check Network Access:</strong> Make sure your Supabase
                  project allows connections from your deployment environment.
                </li>
                <li>
                  <strong>Review Database Schema:</strong> Ensure the required
                  tables exist in your Supabase database.
                </li>
                <li>
                  <strong>Check RLS Policies:</strong> Verify Row Level Security
                  policies aren't blocking access.
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Direct Connection Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">
            To test your Supabase connection directly, run the following code in
            your browser console:
          </p>
          <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto">
            {`
// Replace with your actual Supabase URL and anon key
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key';

// Create a test client
const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

// Test a simple query
supabase
  .from('images')
  .select('count(*)', { count: 'exact', head: true })
  .then(({ data, error }) => {
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Success:', data);
    }
  });
            `}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
