"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pill, FlaskRoundIcon as Flask, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Order } from "@/types/order";

export function OrderPage({ orders }: { orders: Order[] }) {
  const medications = orders.filter((order) => order.type === "medication");
  const labs = orders.filter((order) => order.type === "lab");

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Orders</h1>
        <p className="text-muted-foreground mt-2">
          View your medications and lab tests
        </p>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="labs">Lab Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>Your medications and lab tests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {order.type === "medication" ? (
                          <Pill className="h-5 w-5 text-primary" />
                        ) : (
                          <Flask className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{order.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Order ID: {order.id}
                        </p>
                        <p className="text-sm">{order.date}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant={
                          order.status === "delivered" ||
                          order.status === "completed"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {order.status}
                      </Badge>
                      {order.type === "medication" && (
                        <Button variant="outline" size="sm" className="mt-1">
                          Refill <ArrowUpRight className="ml-1 h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Medications</CardTitle>
              <CardDescription>
                Your prescription and over-the-counter medications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medications.map((med) => (
                  <div
                    key={med.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <Pill className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{med.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Order ID: {med.id}
                        </p>
                        <p className="text-sm">{med.date}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant={
                          med.status === "delivered" ? "secondary" : "outline"
                        }
                      >
                        {med.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Lab Tests</CardTitle>
              <CardDescription>
                Your diagnostic and screening tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {labs.map((lab) => (
                  <div
                    key={lab.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <Flask className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{lab.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Order ID: {lab.id}
                        </p>
                        <p className="text-sm">{lab.date}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant={
                          lab.status === "completed" ? "secondary" : "outline"
                        }
                      >
                        {lab.status}
                      </Badge>
                      {lab.status === "completed" && (
                        <Button variant="outline" size="sm" className="mt-1">
                          View Results <ArrowUpRight className="ml-1 h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
