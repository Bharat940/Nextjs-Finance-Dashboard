import { SiteHeader } from "@/components/site-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import "../globals.css";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-screen dark:bg-[#201E34] dark:text-white">
            <SidebarProvider style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 50)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            } className="dark:bg-[#201E34] dark:text-white">
                <AppSidebar variant="inset"/>

                <SidebarInset>
                    <SiteHeader />

                    <main className="flex-1 overflow-y-auto p-4 dark:bg-[#201E34] dark:text-white">
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
}
