"use client"

import { GalleryVerticalEnd, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { RegisterForm } from "@/components/register-form"
import Image from "next/image"
import { useEffect, useState } from "react"

export default function RegisterPage() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])


    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-8 p-6 md:p-10">
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-md flex flex-col gap-8">
                        <div className="flex items-center justify-between">
                            <a href="#" className="flex items-center gap-2 font-medium">
                                <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                                    <GalleryVerticalEnd className="size-4" />
                                </div>
                                Finance.
                            </a>

                            {mounted && (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() =>
                                        setTheme(theme === "dark" ? "light" : "dark")
                                    }
                                    className="rounded-full"
                                >
                                    {theme === "dark" ? (
                                        <Sun className="h-5 w-5" />
                                    ) : (
                                        <Moon className="h-5 w-5" />
                                    )}
                                </Button>
                            )}
                        </div>

                        <RegisterForm />
                    </div>
                </div>
            </div>

            <div className="bg-muted relative hidden lg:block">
                <Image
                    src="/image.jpg"
                    alt="Image"
                    width={1350}
                    height={1800}
                    className="absolute inset-0 h-full w-full object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                />
            </div>
        </div>
    )
}
