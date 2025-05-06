import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types/user";

export function AccountPage({ user }: { user: User }) {
  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src="/placeholder.svg?height=96&width=96"
                alt={user.name}
              />
              <AvatarFallback>AJ</AvatarFallback>
            </Avatar>

            <div className="space-y-4 text-center md:text-left">
              <div>
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-muted-foreground">{user.plan} Member</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p>{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p>{user.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p>{user.memberSince}</p>
                </div>
              </div>

              <div className="pt-4">
                <Button>Edit Profile</Button>
                <Button variant="outline" className="ml-2">
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Medical Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Medical Conditions
              </p>
              <p>{user.medicalConditions}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Medications</p>
              <p>{user.medications}</p>
            </div>
          </div>
          <Button variant="outline" className="mt-6">
            Update Medical Information
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
