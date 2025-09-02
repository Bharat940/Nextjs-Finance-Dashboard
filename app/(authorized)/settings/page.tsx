"use client"

import React, { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PencilLine } from "lucide-react"

interface User {
    firstName: string
    lastName: string
    email: string
    dob?: string
    mobile?: string
}

export default function Page() {
    const [user, setUser] = useState<User>({
        firstName: "",
        lastName: "",
        email: "",
        dob: "",
        mobile: "",
    });
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const res = await fetch("/api/users/me", { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                setUser({
                    firstName: data.firstName || "",
                    lastName: data.lastName || "",
                    email: data.email || "",
                    dob: data.dob ? data.dob.split("T")[0] : "",
                    mobile: data.mobile || "",
                });
            }
        }
        fetchUser();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUser({ ...user, [e.target.name]: e.target.value })
    };

    const handleSave = async () => {
        if (newPassword && newPassword !== confirmPassword) {
            alert("Passwords do not match ❌");
            return;
        }

        setLoading(true);
        const res = await fetch("/api/users/me", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...user,
                ...(newPassword ? { password: newPassword } : {})
            }),
        });
        setLoading(false);

        if (res.ok) {
            const updated = await res.json();
            setUser({
                firstName: updated.firstName || "",
                lastName: updated.lastName || "",
                email: updated.email || "",
                dob: updated.dob ? updated.dob.split("T")[0] : "",
                mobile: updated.mobile || "",
            });
            setNewPassword("");
            setConfirmPassword("");
            setIsEditing(false);
            alert("Profile updated successfully ✅");
        } else {
            alert("Failed to update ❌");
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6 dark:bg-[#282541] dark:rounded-sm">
            <div>
                <h2 className="text-xl font-semibold">Account Information</h2>
                <p className="text-gray-500 text-sm">Update your account information</p>
            </div>

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <h3 className="text-lg font-semibold">Personal Information</h3>
                    {!isEditing && (
                        <div
                            className="flex items-center gap-1 cursor-pointer text-[#29A073] self-start sm:self-auto"
                            onClick={() => setIsEditing(true)}
                        >
                            <PencilLine size={18} />
                            <span className="text-sm font-medium">Edit</span>
                        </div>
                    )}
                </div>

                {/* Responsive grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-white">First Name</label>
                        <Input
                            name="firstName"
                            value={user.firstName}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            placeholder="Enter first name"
                            className={`h-11 ${!isEditing ? "bg-gray-100 cursor-not-allowed" : ""}`}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-white">Last Name</label>
                        <Input
                            name="lastName"
                            value={user.lastName}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            placeholder="Enter last name"
                            className={`h-11 ${!isEditing ? "bg-gray-100 cursor-not-allowed" : ""}`}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-white">Date of Birth</label>
                        <Input
                            type="date"
                            name="dob"
                            value={user.dob}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={`h-11 ${!isEditing ? "bg-gray-100 cursor-not-allowed" : ""}`}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-white">Mobile Number</label>
                        <Input
                            name="mobile"
                            value={user.mobile}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={`h-11 ${!isEditing ? "bg-gray-100 cursor-not-allowed" : ""}`}
                        />
                    </div>

                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-white">Email</label>
                        <Input
                            type="email"
                            name="email"
                            value={user.email}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={`h-11 ${!isEditing ? "bg-gray-100 cursor-not-allowed" : ""}`}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-white">New Password</label>
                        <Input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className={`h-11 ${!isEditing ? "bg-gray-100 cursor-not-allowed" : ""}`}
                            readOnly={!isEditing}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-white">Confirm Password</label>
                        <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                            className={`h-11 ${!isEditing ? "bg-gray-100 cursor-not-allowed" : ""}`}
                            readOnly={!isEditing}
                        />
                    </div>
                </div>

                {isEditing && (
                    <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
                        <Button
                            onClick={handleSave}
                            disabled={loading}
                            className="bg-[#29A073] hover:bg-[#218863] text-white rounded-xl px-6 h-11 w-full sm:w-auto"
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
