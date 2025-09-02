"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { signIn } from "next-auth/react"

export function RegisterForm({ className, ...props }: React.ComponentProps<"form">) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; server?: string }>({})

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setErrors({})

        const form = new FormData(e.currentTarget)
        const name = (form.get("name") || "").toString().trim()
        const email = (form.get("email") || "").toString().trim()
        const password = (form.get("password") || "").toString().trim()

        // Client-side validation
        if (!name || !email || !password) {
            setErrors({
                name: !name ? "Name is required" : undefined,
                email: !email ? "Email is required" : undefined,
                password: !password ? "Password is required" : undefined,
            })
            return
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setErrors({ email: "Invalid email format" })
            return
        }

        try {
            setLoading(true)
            const res = await fetch("/api/register", {
                method: "POST",
                body: JSON.stringify({ name, email, password }),
                headers: { "Content-Type": "application/json" },
            })

            setLoading(false)

            if (!res.ok) {
                const data = await res.json()
                // Map server error to field if possible
                if (data.error.toLowerCase().includes("email")) {
                    setErrors({ email: data.error })
                } else {
                    setErrors({ server: data.error || "Registration failed" })
                }
                return
            }

            // Auto-login after successful registration
            const loginRes = await signIn("credentials", { email, password, redirect: false })
            if (loginRes?.error) {
                if (loginRes.error.toLowerCase().includes("user")) {
                    setErrors({ email: loginRes.error })
                } else if (loginRes.error.toLowerCase().includes("password")) {
                    setErrors({ password: loginRes.error })
                } else {
                    setErrors({ server: loginRes.error })
                }
            } else {
                router.push("/dashboard")
            }
        } catch (err) {
            console.error(err)
            setErrors({ server: "Something went wrong. Please try again." })
            setLoading(false)
        }
    }

    return (
        <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={onSubmit}>
            <div className="flex flex-col gap-2 text-left">
                <h1 className="text-2xl font-bold">Create Account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                    Enter your details to create a new account
                </p>
            </div>

            {errors.server && <p className="text-destructive text-sm">{errors.server}</p>}

            <div className="grid gap-6">
                <div>
                    <Label htmlFor="name" className="pb-2">Name</Label>
                    <Input id="name" name="name" type="text" placeholder="Enter your name" />
                    {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                    <Label htmlFor="email" className="pb-2">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="Enter your email" />
                    {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                    <Label htmlFor="password" className="pb-2">Password</Label>
                    <Input id="password" name="password" type="password" placeholder="••••••••" />
                    {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
                </div>

                <Button type="submit" className="w-full bg-[#C8EE44] text-[#1B212D]" disabled={loading}>
                    {loading ? "Creating..." : "Create Account"}
                </Button>
            </div>

            <div className="text-center text-sm">
                <span className="text-muted-foreground">Already have an account?{" "}</span>
                <a href="/login" className="underline underline-offset-4">
                    Sign in
                </a>
            </div>
        </form>
    )
}
