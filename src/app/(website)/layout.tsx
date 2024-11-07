import HeaderServer from "@/blocks/global/Header/Server";
import FooterServer from "@/blocks/global/Footer/Server";
import React, { ReactNode } from "react";
import '@/styles/globals.css'


export default function layout({children}: {children: ReactNode}) {
    return (
        <div>
            <HeaderServer />
            <main className="relative min-h-screen pt-14 bg-white dark:bg-secondary-900">
            {children}
            </main>
            <FooterServer />
        </div>
    );
}