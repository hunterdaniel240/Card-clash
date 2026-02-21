"use client"

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Button} from @/components/ui/button"
import {Label} from @/components/ui/label"

export default function LoginPage () {
  retun (
    <div className="flex h-screen items-center justify-center bg-gray-100">
     <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className="space-y-4">
        </CardHeader>
      
      <CardContent className="space-y-4">
      <div>
        <Label>Email</Label>
        <Input placeholder= "Enter Your Email" />
      </div>
      
      </div>
         <Label>Password</Label>
        <Input type=="password" placeholder= "Enter Your Password"/>
          
        <Button className="w-full">Login</Button>
      </CardContent>
     </Card>
    </div>
    )
}
