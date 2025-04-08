"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Building2,
    ShieldCheck,
    User,
    User2,
    Menu,
    BriefcaseBusiness,
    Train,
} from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

interface UserData {
    id: string;
    email: string;
    user_type: string;
    name?: string;
    user_name?: string;
}

export const SideBar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const router = useRouter();

    // ✅ Fix: useEffect for redirect
    useEffect(() => {
        if (status !== "loading" && !session) {
            router.push("/login");
        }
    }, [status, session, router]);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    if (status === "loading" || !session) {
        return null; // Prevent rendering until session is ready
    }

    const handleSignOut = async () => {
        await signOut({ redirect: true, callbackUrl: "/" });
    };

    const navItems = [
        { href: "/dashboard", label: "Dashboard", icon: Building2 },
        { href: "/progress", label: "Progress", icon: ShieldCheck },
        { href: "/nutrition", label: "Nutrition", icon: BriefcaseBusiness },
        { href: "/diet", label: "Diet", icon: BriefcaseBusiness },
        { href: "/train", label: "Train", icon: Train },
    ];

    if (isMobile) {
        return (
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="fixed top-4 right-4 mb-4 z-50">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64">
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-center p-6">
                            <h3 className="text-3xl font-semibold text-blue-600">Fit 4 <span>You</span></h3>
                        </div>
                        <nav className="space-y-1 px-3 flex-grow">
                            {navItems.map((item) => {
                                const isActive = pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors ${isActive
                                            ? "bg-[#e8efed] text-[#1b5445] font-extrabold"
                                            : "text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        <item.icon className="h-5 w-5 flex-shrink-0" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                        <div className="p-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="w-full justify-start p-2 relative bg-[#e8efed] py-6">
                                        <Avatar className="h-8 w-8 mr-2">
                                            <AvatarFallback className="bg-[#1b5445] text-white">
                                                <User />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col items-start">
                                            <span className="text-sm font-medium text-gray-700">{session.user?.name}</span>
                                            <span className="text-xs text-gray-500">{session.user?.email}</span>
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuItem onClick={() => router.push("/profile")}>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleSignOut}>
                                        <Button variant="destructive" className="w-full">Sign Out</Button>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <div className={`flex h-screen flex-col justify-between border-r bg-white transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"}`}>
            <div>
                <div className="flex items-center justify-between p-6">
                    <h3 className="text-2xl font-semibold text-blue-600">Fit 4 <span className="text-gray-400">You</span></h3>
                </div>
                <nav className="space-y-1 px-3">
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <TooltipProvider key={item.href}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href={item.href}
                                            className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors ${isActive
                                                ? "bg-[#e8efed] text-[#1b5445] font-extrabold"
                                                : "text-gray-600 hover:bg-gray-50"
                                                }`}
                                        >
                                            <item.icon className="h-5 w-5 flex-shrink-0" />
                                            {!isCollapsed && item.label}
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" sideOffset={20}>
                                        {item.label}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        );
                    })}
                </nav>
            </div>
            <div className="p-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start p-2 relative bg-[#e8efed] py-6">
                            <Avatar className="h-8 w-8 mr-2">
                                <AvatarFallback className="bg-[#1b5445] text-white">
                                    <User2 />
                                </AvatarFallback>
                            </Avatar>
                            {!isCollapsed && (
                                <div className="flex flex-col items-start">
                                    <span className="text-sm font-medium text-gray-700">
                                        {session.user?.name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {session.user?.email}
                                    </span>
                                </div>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuItem onClick={() => router.push("/profile")}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut}>
                            <button className="mt-4 w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                                Sign Out
                            </button>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};