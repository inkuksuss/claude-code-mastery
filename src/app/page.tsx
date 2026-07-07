'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Toaster, toast } from 'sonner';
import { Code, Sparkles, Zap } from 'lucide-react';

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleButtonClick = () => {
    toast.success('Button clicked successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-slate-50 py-12 px-4">
      <Toaster />
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-foreground">
            Welcome to Your Next.js Starter Kit
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            A modern web development foundation built with Next.js 15, TypeScript, Tailwind CSS v4,
            and shadcn/ui components.
          </p>
          <Button size="lg" onClick={handleButtonClick}>
            Get Started
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <Zap className="w-8 h-8 mb-2 text-blue-600" />
              <CardTitle>Lightning Fast</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Built with Next.js 15 and Turbopack for blazingly fast development and production
                builds.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Code className="w-8 h-8 mb-2 text-green-600" />
              <CardTitle>TypeScript Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Full TypeScript support out of the box for type-safe development and better IDE
                experience.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Sparkles className="w-8 h-8 mb-2 text-purple-600" />
              <CardTitle>shadcn/ui Components</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Beautiful, accessible, and customizable components from shadcn/ui pre-installed
                and ready to use.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Component Examples */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-8 text-foreground">Component Examples</h2>

          <div className="space-y-8">
            {/* Button Examples */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <Button onClick={handleButtonClick}>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>

            {/* Input Example */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Input Field</h3>
              <div className="flex gap-2 max-w-md">
                <Input placeholder="Type something..." className="flex-1" />
                <Button>Submit</Button>
              </div>
            </div>

            {/* Dialog Example */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Dialog</h3>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Dialog Example</DialogTitle>
                    <DialogDescription>
                      This is a dialog component from shadcn/ui. Click outside or press ESC to
                      close.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-slate-600">
                      You can add any content here. Dialogs are useful for confirmations, forms,
                      or detailed information displays.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Dropdown Menu Example */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Dropdown Menu</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Open Menu</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => toast.info('Profile clicked')}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.info('Settings clicked')}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.info('Logout clicked')}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Toast Example */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Toast Notifications</h3>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => toast.success('Success! This is a success message.')}>
                  Success
                </Button>
                <Button onClick={() => toast.error('Error! Something went wrong.')} variant="destructive">
                  Error
                </Button>
                <Button onClick={() => toast.info('Info: Here is some information.')} variant="outline">
                  Info
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack Info */}
        <Card>
          <CardHeader>
            <CardTitle>Technology Stack</CardTitle>
            <CardDescription>What powers this starter kit</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <li>✓ Next.js 15</li>
              <li>✓ TypeScript</li>
              <li>✓ Tailwind CSS v4</li>
              <li>✓ shadcn/ui</li>
              <li>✓ lucide-react</li>
              <li>✓ ESLint</li>
              <li>✓ Prettier</li>
              <li>✓ React 19</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
