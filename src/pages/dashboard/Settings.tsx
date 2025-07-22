
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    marketingEmails: true, // Default to true
    orderUpdates: true,
  });

  // Fetch user settings from the database
  useEffect(() => {
    if (user) {
      const fetchUserSettings = async () => {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("marketing_emails")
            .eq("id", user.id)
            .single();

          if (error) throw error;

          // Update the marketing emails setting from the database
          // If marketing_emails is null, it will default to true
          setSettings(prev => ({
            ...prev,
            marketingEmails: data.marketing_emails ?? true
          }));
        } catch (error) {
          console.error("Error fetching user settings:", error);
        }
      };

      fetchUserSettings();
    }
  }, [user]);

  const handleToggle = (setting: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Update the marketing_emails setting in the database
      const { error } = await supabase
        .from("profiles")
        .update({
          marketing_emails: settings.marketingEmails
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    try {
      // In a production app, this would typically be handled by a server-side function
      // for security reasons. This is just a placeholder implementation.

      // Delete user data from profiles table
      if (user) {
        await supabase.from("profiles").delete().eq("id", user.id);
      }

      // Sign out the user
      await supabase.auth.signOut();

      toast.success("Your account has been deleted");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    }
  };

  return (
    <DashboardLayout title="Account Settings">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Preferences</CardTitle>
            <CardDescription>Manage how you receive email notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-gray-500">
                  Receive notifications about your account activity
                </p>
              </div>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={() => handleToggle("emailNotifications")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="marketingEmails">Marketing Emails</Label>
                <p className="text-sm text-gray-500">
                  Receive emails about new products and promotions
                </p>
              </div>
              <Switch
                id="marketingEmails"
                checked={settings.marketingEmails}
                onCheckedChange={() => handleToggle("marketingEmails")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="orderUpdates">Order Updates</Label>
                <p className="text-sm text-gray-500">
                  Receive updates about your orders
                </p>
              </div>
              <Switch
                id="orderUpdates"
                checked={settings.orderUpdates}
                onCheckedChange={() => handleToggle("orderUpdates")}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Preferences"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
            <CardDescription>Irreversible actions for your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h3 className="font-medium">Delete Account</h3>
              <p className="text-sm text-gray-500">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
