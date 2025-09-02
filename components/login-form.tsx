"use client"

import { signIn } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function LoginForm({ className, ...props }: React.ComponentProps<"form">) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; server?: string }>({})

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors({})

    const form = new FormData(e.currentTarget)
    const email = (form.get("email") || "").toString().trim()
    const password = (form.get("password") || "").toString().trim()

    if (!email || !password) {
      setErrors({
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
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      setLoading(false)

      if (res?.error) {
        if (res.error.toLowerCase().includes("user")) {
          setErrors({ email: res.error })
        } else if (res.error.toLowerCase().includes("password")) {
          setErrors({ password: res.error })
        } else {
          setErrors({ server: res.error })
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
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Welcome back! Please enter your details
        </p>
      </div>

      {errors.server && <p className="text-destructive text-sm">{errors.server}</p>}

      <div className="grid gap-6">
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
          {loading ? "Logging in..." : "Login"}
        </Button>
      </div>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Don&apos;t have an account?{" "}</span>
        <a href="/register" className="underline underline-offset-4">
          Sign up for free
        </a>
      </div>
    </form>
  )
}
